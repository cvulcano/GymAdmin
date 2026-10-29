#!/usr/bin/env bash
# Crea un acceso directo "GymAdmin" en el menú de aplicaciones (y en el escritorio si existe).
DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
chmod +x "$DIR/iniciar.sh"
ENTRADA="[Desktop Entry]
Type=Application
Name=GymAdmin
Comment=Gestión del gimnasio: clientes, cuotas y contabilidad
Exec=\"$DIR/iniciar.sh\"
Icon=$DIR/static/icono.svg
Terminal=true
Categories=Office;Finance;"
mkdir -p "$HOME/.local/share/applications"
echo "$ENTRADA" > "$HOME/.local/share/applications/gymadmin.desktop"
chmod +x "$HOME/.local/share/applications/gymadmin.desktop"
ESCRITORIO="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Escritorio")"
if [ -d "$ESCRITORIO" ]; then
    echo "$ENTRADA" > "$ESCRITORIO/GymAdmin.desktop"
    chmod +x "$ESCRITORIO/GymAdmin.desktop"
    gio set "$ESCRITORIO/GymAdmin.desktop" metadata::trusted true 2>/dev/null
fi
echo "Listo: buscá \"GymAdmin\" en el menú de aplicaciones."
