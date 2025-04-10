@echo off
:loop
echo Running scraper...
node scraper.js

REM Check if overlay has changed
git diff --quiet overlay.html
IF %ERRORLEVEL% NEQ 0 (
  echo Changes found - pushing to GitHub...
  git add overlay.html
  git commit -m "Auto update"
  git push
) ELSE (
  echo No changes detected.
)

timeout /t 30
goto loop