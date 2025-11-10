@echo off
setlocal enabledelayedexpansion

set "logDir=logs"
set "backupDir=logs_backup"
set "date=%date:~10,4%-%date:~4,2%-%date:~7,2%"

echo Log Directory: %logDir%
echo Backup Directory: %backupDir%
echo Date: %date%

if not exist "%backupDir%" (
    echo Creating backup directory...
    mkdir "%backupDir%"
)

echo Moving log files...

for %%F in (%logDir%\pm2_logs_*.log %logDir%\pm2_error_*.log) do (
    echo Moving "%%F" to "%backupDir%\%%~nF_%date%%%~xF"
    move "%%F" "%backupDir%\%%~nF_%date%%%~xF"
)

echo Reloading PM2 logs...
pm2 reloadLogs

echo Done.
pause

endlocal
