@echo off
title CORDOBA APP  --  KEEP THIS WINDOW OPEN
cd /d D:\CordobaApp\app
echo.
echo  ============================================================
echo     CORDOBA TRAINING CENTER  -  starting the app
echo  ============================================================
echo.
echo   Please wait ~15 seconds for it to build...
echo.
echo   When you see:   Local:  http://localhost:5173/
echo   open that link in Chrome.
echo.
echo   ^>^>^>  KEEP THIS BLACK WINDOW OPEN while using the app.  ^<^<^<
echo.
echo  ------------------------------------------------------------
echo.
call npm.cmd run build
echo.
echo   Build done. Starting server...
echo.
call npm.cmd run preview
echo.
echo   (If it closed, there was an error above. Send me a photo.)
pause
