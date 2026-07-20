@echo off
title Cordoba App - Dev Server
cd /d D:\CordobaApp\app
echo.
echo  ============================================
echo    CORDOBA TRAINING CENTER - Starting app
echo  ============================================
echo.
echo  Wait for "Local: http://localhost:XXXX/"
echo  then open that link in Chrome.
echo.
echo  Keep THIS WINDOW OPEN while using the app.
echo.
call npm.cmd run dev
pause
