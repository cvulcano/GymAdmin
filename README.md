# GymAdmin — gestión de gimnasios

Python 3.8+ · Linux · Windows

Aplicación para llevar un gimnasio: **clientes, cobro de cuotas, control de ingreso a sala y contabilidad**.
Funciona en **Linux y Windows**, sin internet y sin instalar librerías: solo necesita Python 3.8 o superior.
Los datos quedan en tu computadora (carpeta `datos/`).

## Cómo abrirla

**Windows**
1. Si no tenés Python: bajalo de https://www.python.org/downloads/ y al instalar marcá **"Add Python to PATH"**.
2. Doble clic en **`iniciar.bat`**. Se abre una ventana negra (no la cierres) y la app en el navegador.
3. Opcional: doble clic en `crear-acceso-directo-windows.bat` para tener un ícono en el Escritorio.

**Linux**
1. Python 3 ya viene instalado en casi todas las distribuciones.
2. En una terminal, dentro de esta carpeta: `./iniciar.sh`
3. Opcional: `./crear-acceso-directo-linux.sh` para que aparezca "GymAdmin" en el menú de aplicaciones.

Para cerrar la aplicación, cerrá la ventana negra/terminal (o Ctrl+C).

## Qué hace

| Sección | Para qué sirve |
|---|---|
| **Inicio** | Resumen del día: socios activos, ingresos a sala, plata del mes, cuotas vencidas y por vencer (con botón para cobrar o avisar por WhatsApp). |
| **Ingreso a sala** | En recepción: escribís el DNI y Enter. Se pone verde (al día), amarillo (por vencer) o rojo (vencida / sin pago / apto médico vencido). |
| **Clientes** | Alta, edición, búsqueda y filtros (al día, por vencer, vencidas, bajas). Ficha con datos, historial de pagos y asistencias. Exportación a Excel. |
| **Cobrar cuota** | Elegís cliente y plan; el monto y el nuevo vencimiento se calculan solos (si todavía no venció, se extiende desde el vencimiento actual). Recibo para imprimir y mensaje de WhatsApp. El cobro se registra solo en la contabilidad. |
| **Contabilidad** | Ingresos y gastos por período, por categoría y por medio de pago; evolución de 12 meses; resultado (ganancia/pérdida); exportación a Excel. |
| **Planes y precios** | Membresías con precio y duración (mensual, trimestral, clase suelta, etc.). |
| **Ajustes** | Nombre del gimnasio, moneda, días de aviso, categorías, medios de pago y copias de seguridad. |

## Usarla desde varias PCs o una tablet

Iniciá con la opción `--red` en la PC principal:
- Linux: `./iniciar.sh --red`
- Windows: abrí una consola en la carpeta y ejecutá `iniciar.bat --red`

La ventana muestra una dirección tipo `http://192.168.0.10:8765/` para abrir desde los otros equipos de la misma red
(puede que el firewall de Windows pida permiso la primera vez). Todos trabajan sobre los mismos datos.

## Copias de seguridad

- Cada día que se abre la aplicación se guarda una copia automática en `datos/copias/` (se conservan 30).
- Desde **Ajustes → Descargar copia ahora** podés bajar una copia para guardar en un pendrive o la nube.
- Para restaurar: cerrá la app, renombrá la copia a `gimnasio.db` y reemplazá la de `datos/`.

## Ejecutable sin Python (opcional)

`python empaquetar.py` genera `dist/GymAdmin.exe` (en Windows) o `dist/GymAdmin` (en Linux).
Hay que ejecutarlo en cada sistema para obtener su versión.

## Archivos

```
app.py              servidor y lógica (Python, sin dependencias)
static/             interfaz (HTML, CSS, JavaScript)
datos/              base de datos SQLite y copias (se crea al iniciar)
iniciar.sh / .bat   lanzadores
```
