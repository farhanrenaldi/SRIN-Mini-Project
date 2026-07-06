#!/bin/sh
# ---------------------------------------------------------------------------
# Development entrypoint for the Spring Boot backend inside Docker.
#
# Live reload works in two stages:
#   1. This script polls the mounted source tree and recompiles on change.
#      (Polling is used instead of inotify because filesystem events do not
#       propagate reliably across Docker bind mounts on Windows/macOS.)
#   2. Spring Boot DevTools watches target/classes (container-local) and
#      automatically restarts the application whenever a recompile lands.
# ---------------------------------------------------------------------------
set -e

chmod +x ./mvnw 2>/dev/null || true

snapshot() {
  find src -type f \
    \( -name '*.java' -o -name '*.properties' -o -name '*.yml' -o -name '*.yaml' \) \
    -printf '%T@:%p\n' 2>/dev/null | sort | md5sum
}

echo "[dev] Resolving dependencies and compiling (the first run can take a few minutes)…"
./mvnw -q -DskipTests compile

echo "[dev] Watching ./src for changes (polling every 2s)…"
(
  LAST="$(snapshot)"
  while true; do
    sleep 2
    CURRENT="$(snapshot)"
    if [ "$CURRENT" != "$LAST" ]; then
      echo "[dev] Source change detected — recompiling…"
      if ./mvnw -q -DskipTests compile; then
        echo "[dev] Recompiled ✓  (DevTools will restart the app)"
      else
        echo "[dev] Compilation failed — fix the error and save again."
      fi
      LAST="$CURRENT"
    fi
  done
) &

echo "[dev] Starting Spring Boot with DevTools live restart…"
exec ./mvnw -DskipTests spring-boot:run
