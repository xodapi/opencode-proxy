#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "OpenCode Proxy CLI Management Tool"
  echo
  echo "Usage: ./run.sh <command> [args...]"
  echo
  echo "Available commands:"
  echo "  start          - Start the OpenCode proxy server (npm start)"
  echo "  dev            - Start proxy server in watch mode (npm run dev)"
  echo "  doctor         - Run doctor diagnostics on environment (npm run doctor)"
  echo "  doctor:factory - Run doctor diagnostics for factory (npm run doctor:factory)"
  echo "  model-health   - Run model health testing (npm run model-health)"
  echo "  proxy-status   - Check status and metrics of proxy (npm run proxy-status)"
  echo "  secret-scan    - Scan project files for raw secrets (npm run secret-scan)"
  echo "  release:zip    - Create a clean release zip distribution (npm run release:zip)"
  echo "  setup:opencode - Setup OpenCode provider (npm run setup:opencode)"
  echo "  setup:factory  - Configure Factory Droid mission (npm run setup:factory)"
  echo "  setup:vibemode - Update legacy configurations (npm run setup:vibemode)"
  echo "  factory:backup - Backup/restore configurations (npm run factory:backup)"
  echo "  cleanup:usage  - Clean up older usage history log files (npm run cleanup:usage)"
  echo "  test           - Run project unit testing suite (npm test)"
  echo
  exit 0
fi

npm run "$@"
