#!/usr/bin/env bash
# Inicia GymAdmin en Linux. Uso: ./iniciar.sh   (o ./iniciar.sh --red)
cd "$(dirname "$(readlink -f "$0")")" || exit 1
if command -v python3 >/dev/null 2>&1; then
    exec python3 app.py "$@"
elif command -v python >/dev/null 2>&1; then
    exec python app.py "$@"
else
    echo "No se encontró Python 3. Instalalo con:  sudo apt install python3   (o el gestor de paquetes de tu distribución)"
    read -r -p "Presioná Enter para salir..." _
    exit 1
fi
