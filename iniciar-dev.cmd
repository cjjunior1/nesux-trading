@echo off
setlocal
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
start "" http://localhost:3000/
npm run dev
pause
