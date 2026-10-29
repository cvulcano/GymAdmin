#!/usr/bin/env python3
"""
Genera un ejecutable de GymAdmin que no necesita Python instalado.
Hay que correrlo en cada sistema operativo para obtener su ejecutable:
  - en Windows genera  dist/GymAdmin.exe
  - en Linux genera    dist/GymAdmin

Uso:  python empaquetar.py
"""
import os
import subprocess
import sys

aqui = os.path.dirname(os.path.abspath(__file__))
os.chdir(aqui)
try:
    import PyInstaller  # noqa: F401
except ImportError:
    print("Instalando PyInstaller...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "pyinstaller"])

sep = ";" if os.name == "nt" else ":"
subprocess.check_call([sys.executable, "-m", "PyInstaller", "--noconfirm", "--onefile", "--name", "GymAdmin",
                       "--add-data", "static%sstatic" % sep, "app.py"])
print("\nListo. El ejecutable está en la carpeta 'dist'. Copialo a la carpeta donde quieras guardar los datos;")
print("la base de datos se creará en una subcarpeta 'datos' al lado del ejecutable.")
