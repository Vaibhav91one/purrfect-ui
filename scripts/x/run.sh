#!/bin/sh
# launchd entry point for scripts/x/com.purrfectui.x-today.plist (launchd has a minimal PATH).
export PATH="/Users/vaibhavtomar/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$(dirname "$0")/../.." || exit 1
echo "--- $(date)"
exec /Users/vaibhavtomar/.local/bin/node scripts/x/today.mjs "$@"
