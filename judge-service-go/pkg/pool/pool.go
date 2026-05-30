package pool

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	docker "github.com/fsouza/go-dockerclient"

	"judge-service-go/pkg/workspace"
)

// PooledContainer represents a container in the pool.
type PooledContainer struct {
	ID       string
	Language string
	Busy     bool
	WorkDir  string
}

// ContainerPool manages a pool of pre-warmed Docker containers.
type ContainerPool struct {
	cli        *docker.Client
	mu         sync.Mutex
	available  map[string][]*PooledContainer // language -> idle containers
	inUse      map[string]*PooledContainer   // containerID -> container
	maxPerLang int
	images     map[string]string // language -> image name
}

// NewPool creates a new container pool.
func NewPool(cli *docker.Client, maxPerLang int) *ContainerPool {
	return &ContainerPool{
		cli:        cli,
		available:  make(map[string][]*PooledContainer),
		inUse:      make(map[string]*PooledContainer),
		maxPerLang: maxPerLang,
		images:     make(map[string]string),
	}
}

// Acquire gets a container from the pool for the given language.
func (p *ContainerPool) Acquire(lang string) *PooledContainer {
	p.mu.Lock()
	defer p.mu.Unlock()

	if len(p.available[lang]) == 0 {
		return nil // Or create a new one if pool is not at max capacity
	}

	container := p.available[lang][0]
	p.available[lang] = p.available[lang][1:]
	container.Busy = true
	p.inUse[container.ID] = container
	return container
}

// Release returns a container to the pool.
func (p *ContainerPool) Release(container *PooledContainer) {
	p.mu.Lock()
	defer p.mu.Unlock()

	container.Busy = false
	delete(p.inUse, container.ID)
	p.available[container.Language] = append(p.available[container.Language], container)
}

// WarmUp creates an initial set of containers for a given language.
func (p *ContainerPool) WarmUp(ctx context.Context, lang string, image string, count int) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	p.images[lang] = image

	if err := p.pullImage(ctx, image); err != nil {
		return fmt.Errorf("failed to pull image %s: %w", image, err)
	}

	for i := 0; i < count; i++ {
		id, workDir, err := p.createContainer(ctx, image, lang)
		if err != nil {
			return err
		}
		p.available[lang] = append(p.available[lang], &PooledContainer{
			ID:       id,
			Language: lang,
			WorkDir:  workDir,
		})
	}
	return nil
}

// Shutdown stops and removes all containers in the pool.
func (p *ContainerPool) Shutdown(ctx context.Context) {
	p.mu.Lock()
	defer p.mu.Unlock()

	slog.Info("Shutting down container pool", "total_available", len(p.available), "total_in_use", len(p.inUse))

	var wg sync.WaitGroup

	remove := func(c *PooledContainer) {
		defer wg.Done()
		slog.Debug("Removing container", "containerId", c.ID, "language", c.Language)
		err := p.cli.RemoveContainer(docker.RemoveContainerOptions{
			ID:    c.ID,
			Force: true,
		})
		if err != nil {
			slog.Error("Failed to remove container during shutdown", "containerId", c.ID, "error", err)
		}
		// Also cleanup the workdir
		if err := workspace.CleanupSubmissionWorkspace(c.WorkDir); err != nil {
			slog.Error("Failed to cleanup workdir during shutdown", "workdir", c.WorkDir, "error", err)
		}
	}

	for _, containers := range p.available {
		for _, c := range containers {
			wg.Add(1)
			go remove(c)
		}
	}

	for _, c := range p.inUse {
		wg.Add(1)
		go remove(c)
	}

	wg.Wait()
	p.available = make(map[string][]*PooledContainer)
	p.inUse = make(map[string]*PooledContainer)
}

// PoolStats represents the current state of the container pool.
type PoolStats struct {
	Available map[string]int `json:"available"`
	InUse     map[string]int `json:"in_use"`
}

// GetStats returns the current statistics of the container pool.
func (p *ContainerPool) GetStats() PoolStats {
	p.mu.Lock()
	defer p.mu.Unlock()

	stats := PoolStats{
		Available: make(map[string]int),
		InUse:     make(map[string]int),
	}

	for lang, containers := range p.available {
		stats.Available[lang] = len(containers)
	}

	for _, c := range p.inUse {
		stats.InUse[c.Language]++
	}

	return stats
}

// StartMonitor starts a background goroutine to monitor container health.
func (p *ContainerPool) StartMonitor(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for {
			select {
			case <-ctx.Done():
				ticker.Stop()
				return
			case <-ticker.C:
				p.checkHealth(ctx)
			}
		}
	}()
}

func (p *ContainerPool) checkHealth(ctx context.Context) {
	p.mu.Lock()
	defer p.mu.Unlock()

	for lang, containers := range p.available {
		var healthy []*PooledContainer
		for _, c := range containers {
			if p.isContainerHealthy(c.ID) {
				healthy = append(healthy, c)
			} else {
				slog.Warn("Container found unhealthy, removing", "containerId", c.ID, "language", lang)
				p.removeContainer(c)

				// Recreate replacement
				image := p.images[lang]
				if image != "" {
					id, workDir, err := p.createContainer(ctx, image, lang)
					if err == nil {
						healthy = append(healthy, &PooledContainer{
							ID:       id,
							Language: lang,
							WorkDir:  workDir,
						})
						slog.Info("Replaced unhealthy container", "oldId", c.ID, "newId", id, "language", lang)
					} else {
						slog.Error("Failed to recreate replacement container", "language", lang, "error", err)
					}
				}
			}
		}
		p.available[lang] = healthy
	}
}

func (p *ContainerPool) isContainerHealthy(id string) bool {
	container, err := p.cli.InspectContainer(id)
	if err != nil {
		return false
	}
	return container.State.Running && !container.State.Paused
}

func (p *ContainerPool) removeContainer(c *PooledContainer) {
	_ = p.cli.RemoveContainer(docker.RemoveContainerOptions{
		ID:    c.ID,
		Force: true,
	})
	_ = workspace.CleanupSubmissionWorkspace(c.WorkDir)
}

// createContainer creates a new Docker container with a tmpfs volume mount.
func (p *ContainerPool) createContainer(ctx context.Context, image string, lang string) (string, string, error) {
	// Decide user. Prefer numeric UID if set, else do not force "judge" name to avoid missing passwd entry.
	user := os.Getenv("JUDGE_USER") // e.g., "judge"
	uid := os.Getenv("JUDGE_UID")   // e.g., "1000"
	var containerUser string
	if uid != "" {
		containerUser = uid
	} else if user != "" {
		containerUser = user
	} else {
		containerUser = "" // let image default to its default user
	}

	pidsLimit := int64(128)
	memoryBytes := int64(1024 * 1024 * 1024) // Increase to 1GB
	memorySwap := memoryBytes
	noNewPrivileges := "no-new-privileges:true"

	// Create a temporary directory on the host for this container
	if err := os.MkdirAll(workspace.RootDir, 0755); err != nil {
		return "", "", fmt.Errorf("failed to create workspace root %s: %w", workspace.RootDir, err)
	}
	hostWorkDir, err := os.MkdirTemp(workspace.RootDir, "judge-")
	if err != nil {
		return "", "", fmt.Errorf("failed to create temp dir for container: %w", err)
	}
	// Container images typically run as a non-root "judge" user. The temp dir
	// created by MkdirTemp is 0700, which blocks bind-mounted file access.
	if err := os.Chmod(hostWorkDir, 0777); err != nil {
		return "", "", fmt.Errorf("failed to chmod container workdir %s: %w", hostWorkDir, err)
	}
	workspaceBind := fmt.Sprintf("%s:/app", hostWorkDir)

	hostCfg := &docker.HostConfig{
		NetworkMode:    "none",
		ReadonlyRootfs: true,
		SecurityOpt:    []string{noNewPrivileges},
		CapDrop:        []string{"ALL"},
		Memory:         memoryBytes,
		MemorySwap:     memorySwap,
		CPUQuota:       100000, // Increase to 1.0 CPU
		PidsLimit:      &pidsLimit,
		Binds:          []string{workspaceBind},
		Tmpfs: map[string]string{
			"/tmp": "rw,noexec,nosuid,nodev,size=512m",
		},
	}

	containerOptions := docker.CreateContainerOptions{
		Context: ctx,
		Config: &docker.Config{
			Image:      image,
			Cmd:        []string{"tail", "-f", "/dev/null"},
			WorkingDir: "/app",
			Tty:        false,
		},
		HostConfig: hostCfg,
	}

	// If containerUser configured, set it
	if containerUser != "" {
		containerOptions.Config.User = containerUser
	}

	container, err := p.cli.CreateContainer(containerOptions)
	if err != nil {
		return "", "", fmt.Errorf("failed to create container: %w", err)
	}

	if err := p.cli.StartContainer(container.ID, nil); err != nil {
		// If starting fails, try to remove the container
		_ = p.cli.RemoveContainer(docker.RemoveContainerOptions{ID: container.ID, Force: true})
		return "", "", fmt.Errorf("failed to start container: %w", err)
	}

	slog.Info("Started container", "containerId", container.ID, "language", lang, "workdir", filepath.Clean(hostWorkDir))

	return container.ID, hostWorkDir, nil
}

// pullImage pulls a Docker image if it's not available locally
func (p *ContainerPool) pullImage(ctx context.Context, image string) error {
	// If image exists locally, skip
	if _, err := p.cli.InspectImage(image); err == nil {
		return nil
	} else if err != docker.ErrNoSuchImage {
		return fmt.Errorf("failed to inspect image %s: %w", image, err)
	}

	// Parse image into repository and tag
	repo, tag := image, "latest"
	if strings.Contains(image, ":") {
		parts := strings.SplitN(image, ":", 2)
		repo, tag = parts[0], parts[1]
	}

	slog.Info("Pulling image", "repository", repo, "tag", tag)
	pullOptions := docker.PullImageOptions{
		Repository:   repo,
		Tag:          tag,
		Context:      ctx,
		OutputStream: io.Discard,
	}
	auth := docker.AuthConfiguration{}
	if err := p.cli.PullImage(pullOptions, auth); err != nil {
		return fmt.Errorf("failed to pull image %s: %w", image, err)
	}
	return nil
}
