@echo off
rem Inicia GymAdmin en Windows. Doble clic para abrir.
chcp 65001 >nul
title GymAdmin - no cierres esta ventana mientras uses la aplicacion
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
    py -3 app.py %*
    goto fin
)
where python >nul 2>nul
if %errorlevel%==0 (
    python app.py %*
    goto fin
)
echo.
echo No se encontro Python 3.
echo Descargalo de https://www.python.org/downloads/ y durante la instalacion
echo marca la opcion "Add Python to PATH". Despues volve a abrir este archivo.
echo.
:fin
pause
