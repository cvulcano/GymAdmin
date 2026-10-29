@echo off
rem Crea un acceso directo "GymAdmin" en el Escritorio de Windows.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\GymAdmin.lnk');" ^
  "$s.TargetPath='%~dp0iniciar.bat';$s.WorkingDirectory='%~dp0';$s.Description='GymAdmin - gestion del gimnasio';$s.Save()"
echo Listo: se creo el acceso directo GymAdmin en el Escritorio.
pause
