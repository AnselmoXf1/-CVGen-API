@echo off
echo Starting CVGen API - BlueVision Tech...
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak > nul

REM Start the application
echo Starting Node.js server...
node server.js

pause