@echo off
REM ============================================
REM   DESPLEGAR - Trading a Contabo
REM   Solo haz doble clic en este archivo.
REM ============================================
cd /d "%~dp0"

echo.
echo ========================================
echo   DESPLEGANDO TRADING A CONTABO
echo ========================================
echo.

REM 1) Preparar cambios locales
git add -A

REM 2) Ver si hay cambios que guardar
git diff --cached --quiet
if %errorlevel%==0 (
    echo No hay cambios nuevos que desplegar.
    echo Tu proyecto ya esta actualizado en Contabo.
    echo.
    pause
    exit /b 0
)

REM 3) Crear punto de guardado con fecha y hora
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set FECHA=%%a-%%b-%%c
set HORA=%time:~0,5%
git commit -m "Despliegue a Contabo %FECHA% %HORA%"

REM 4) Subir a GitHub (rama main)
echo.
echo Subiendo a GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo al subir a GitHub.
    echo Revisa tu conexion o credenciales de GitHub.
    echo.
    pause
    exit /b 1
)

REM 5) Desplegar a Contabo por SSH
echo.
echo Desplegando a Contabo en /var/www/trading...
ssh root@66.94.109.203 "cd /var/www/trading && git pull origin main && npm run build && pm2 restart nesux-trading && echo Listo"

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   LISTO! Trading desplegado en Contabo
    echo   https://trading.nesuxglobalbusinessrd.com
    echo ========================================
) else (
    echo.
    echo ATENCION: Hubo un problema al desplegar.
    echo Revisa tu conexion SSH a Contabo.
)

echo.
pause
