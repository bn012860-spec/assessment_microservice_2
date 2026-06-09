package metrics

import (
	"sync/atomic"
	"time"
)

var (
	gcLastRunUnixNano int64
	gcRemovedTotal    int64
	gcRemovedExited   int64
	gcRemovedDead     int64

	reconcileLastRunUnixNano int64
	reconcileRepairsTotal    int64

	containerReplacementsTotal int64
)

func SetGCLastRun(t time.Time) {
	atomic.StoreInt64(&gcLastRunUnixNano, t.UnixNano())
}

func AddGCRemoved(total int) {
	atomic.AddInt64(&gcRemovedTotal, int64(total))
}

func AddGCRemovedExited(n int) {
	atomic.AddInt64(&gcRemovedExited, int64(n))
}

func AddGCRemovedDead(n int) {
	atomic.AddInt64(&gcRemovedDead, int64(n))
}

func SetReconcileLastRun(t time.Time) {
	atomic.StoreInt64(&reconcileLastRunUnixNano, t.UnixNano())
}

func AddReconcileRepairs(n int) {
	atomic.AddInt64(&reconcileRepairsTotal, int64(n))
}

func AddContainerReplacement(n int) {
	atomic.AddInt64(&containerReplacementsTotal, int64(n))
}

// Snapshot returns metrics in primitive values for JSON encoding.
func Snapshot() map[string]interface{} {
	lastGCRun := atomic.LoadInt64(&gcLastRunUnixNano)
	lastReconcileRun := atomic.LoadInt64(&reconcileLastRunUnixNano)

	var lastGCRunStr string
	if lastGCRun != 0 {
		lastGCRunStr = time.Unix(0, lastGCRun).UTC().Format(time.RFC3339)
	}
	var lastReconcileRunStr string
	if lastReconcileRun != 0 {
		lastReconcileRunStr = time.Unix(0, lastReconcileRun).UTC().Format(time.RFC3339)
	}

	return map[string]interface{}{
		"last_gc_run_unix":             lastGCRun,
		"last_gc_run":                  lastGCRunStr,
		"gc_removed_total":             atomic.LoadInt64(&gcRemovedTotal),
		"gc_removed_exited":            atomic.LoadInt64(&gcRemovedExited),
		"gc_removed_dead":              atomic.LoadInt64(&gcRemovedDead),
		"last_reconcile_run_unix":      lastReconcileRun,
		"last_reconcile_run":           lastReconcileRunStr,
		"reconcile_repairs_total":      atomic.LoadInt64(&reconcileRepairsTotal),
		"container_replacements_total": atomic.LoadInt64(&containerReplacementsTotal),
	}
}
