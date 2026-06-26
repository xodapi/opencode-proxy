@echo off
setlocal enabledelayedexpansion

set CMD_ARG=%~1

if "%CMD_ARG%"=="" (
  echo OpenCode Proxy CLI Management Tool
  echo.
  echo Usage: .\run.cmd ^<command^> [args...]
  echo.
  echo Available commands:
  echo   start          - Start the OpenCode proxy server
  echo   dev            - Start proxy server in watch/development mode
  echo   doctor         - Run doctor diagnostics on environment
  echo   doctor-factory - Run doctor diagnostics for factory
  echo   health         - Run model health testing
  echo   status         - Check status and metrics of proxy
  echo   scan           - Scan project files for raw secrets/keys
  echo   build          - Create a clean release zip distribution (release:zip)
  echo   setup          - Setup OpenCode provider in your system (setup:opencode)
  echo   setup-factory  - Auto-configure Factory Droid mission (setup:factory)
  echo   setup-vibemode - Update legacy configurations (setup:vibemode)
  echo   backup         - Backup/restore Factory configurations (factory:backup)
  echo   cleanup        - Clean up older usage history log files (cleanup:usage)
  echo   test           - Run project unit testing suite
  echo.
  exit /b 0
)

if "%CMD_ARG%"=="start" (
  npm start %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="dev" (
  npm run dev %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="doctor" (
  npm run doctor %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="doctor-factory" (
  npm run doctor:factory %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="health" (
  npm run model-health %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="status" (
  npm run proxy-status %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="scan" (
  npm run secret-scan %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="build" (
  npm run release:zip %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="setup" (
  npm run setup:opencode %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="setup-factory" (
  npm run setup:factory %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="setup-vibemode" (
  npm run setup:vibemode %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="backup" (
  npm run factory:backup %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="cleanup" (
  npm run cleanup:usage %2 %3 %4 %5 %6 %7 %8 %9
) else if "%CMD_ARG%"=="test" (
  npm test %2 %3 %4 %5 %6 %7 %8 %9
) else (
  npm run %*
)
