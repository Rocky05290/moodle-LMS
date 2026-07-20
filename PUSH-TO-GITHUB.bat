@echo off
title Push to GitHub - Cordoba LMS
cd /d D:\CordobaApp
echo.
echo  ==================================================
echo    Pushing to github.com/Rocky05290/moodle-LMS
echo  ==================================================
echo.
echo  A browser window may open asking you to sign in
echo  to GitHub. Complete it, then come back here.
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
echo  ---- Done. Check the messages above. ----
echo.
pause
