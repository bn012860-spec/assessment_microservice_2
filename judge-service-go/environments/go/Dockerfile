FROM golang:1.24-alpine

# Install any necessary build tools
RUN apk add --no-cache build-base

# Create a non-root user 'judge'
RUN addgroup -S judge && adduser -S -G judge judge

# Set Go environment variables for writable directories in /app (bind-mounted to host)
ENV GOCACHE=/app/.cache/go-build
ENV GOPATH=/app/go

# Set the working directory
WORKDIR /app

# Set the user
USER judge
