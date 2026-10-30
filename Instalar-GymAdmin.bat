@echo off
rem ============================================================
rem  Instalador de GymAdmin para Windows
rem  Dejar este archivo en la MISMA carpeta que GymAdmin.exe
rem  y hacer doble clic. Crea el acceso directo en el escritorio.
rem ============================================================
chcp 65001 >nul
title Instalar GymAdmin
cd /d "%~dp0"

if not exist "GymAdmin.exe" (
    echo.
    echo  No encontre "GymAdmin.exe" en esta carpeta.
    echo  Poné este instalador junto al archivo GymAdmin.exe y volvé a ejecutarlo.
    echo.
    pause
    exit /b 1
)

set "DESTINO=%LOCALAPPDATA%\GymAdmin"
echo.
echo  Instalando GymAdmin en: %DESTINO%
if not exist "%DESTINO%" mkdir "%DESTINO%"
copy /y "GymAdmin.exe" "%DESTINO%\GymAdmin.exe" >nul
if errorlevel 1 (
    echo  No se pudo copiar el programa. Cerrá GymAdmin si está abierto y reintentá.
    pause
    exit /b 1
)

rem Crear acceso directo en el Escritorio
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\GymAdmin.lnk');" ^
  "$s.TargetPath='%DESTINO%\GymAdmin.exe';$s.WorkingDirectory='%DESTINO%';$s.Description='GymAdmin - gestion del gimnasio';$s.Save()"

rem Crear acceso directo en el Menú Inicio
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$d=[Environment]::GetFolderPath('Programs');" ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut($d+'\GymAdmin.lnk');" ^
  "$s.TargetPath='%DESTINO%\GymAdmin.exe';$s.WorkingDirectory='%DESTINO%';$s.Save()"

echo.
echo  Listo. Ya tenés el icono "GymAdmin" en el Escritorio.
echo  Hacé doble clic ahí para abrir el programa.
echo.
pause
