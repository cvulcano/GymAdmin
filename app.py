#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GymAdmin - Gestión de gimnasios (clientes, cuotas, asistencia y contabilidad).

Funciona en Linux y Windows. Solo necesita Python 3.8 o superior
(no requiere instalar librerías adicionales).

Uso:
    python app.py              -> abre la aplicación en el navegador
    python app.py --red        -> permite acceder desde otras PCs/tablets de la red local
    python app.py --puerto 9000
    python app.py --sin-navegador
"""

import argparse
import csv
import io
import json
import os
import re
import shutil
import socket
import sqlite3
import sys
import threading
import time
import webbrowser
from datetime import date, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen

VERSION = "1.1.0"

# Repositorio donde se publican las versiones (para el aviso de actualizaciones).
REPO = "cvulcano/GymAdmin"

# En modo "sin consola" (ejecutable de Windows) no hay salida estándar: evitá que print falle.
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

# ---------------------------------------------------------------------------
# Rutas (compatibles con ejecución normal y con ejecutable de PyInstaller)
# ---------------------------------------------------------------------------
if getattr(sys, "frozen", False):
    RECURSOS = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
    BASE = os.path.dirname(sys.executable)
else:
    RECURSOS = os.path.dirname(os.path.abspath(__file__))
    BASE = RECURSOS

STATIC_DIR = os.path.join(RECURSOS, "static")
DATA_DIR = os.path.join(BASE, "datos")
BACKUP_DIR = os.path.join(DATA_DIR, "copias")
DB_PATH = os.path.join(DATA_DIR, "gimnasio.db")

DB_LOCK = threading.Lock()

CATEGORIAS_INGRESO = ["Cuotas", "Inscripciones", "Venta de productos", "Clases particulares", "Otros ingresos"]
CATEGORIAS_EGRESO = ["Alquiler", "Sueldos y honorarios", "Servicios (luz, agua, gas, internet)",
                     "Mantenimiento", "Equipamiento", "Limpieza", "Publicidad", "Impuestos",
                     "Compra de mercadería", "Otros gastos"]
MEDIOS_PAGO = ["Efectivo", "Transferencia", "Tarjeta de débito", "Tarjeta de crédito", "Mercado Pago"]

ESQUEMA = """
CREATE TABLE IF NOT EXISTS config (
    clave TEXT PRIMARY KEY,
    valor TEXT
);
CREATE TABLE IF NOT EXISTS planes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio INTEGER NOT NULL DEFAULT 0,          -- en centavos
    duracion_dias INTEGER NOT NULL DEFAULT 30,
    descripcion TEXT DEFAULT '',
    activo INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL DEFAULT '',
    dni TEXT DEFAULT '',
    telefono TEXT DEFAULT '',
    email TEXT DEFAULT '',
    fecha_nacimiento TEXT DEFAULT '',
    direccion TEXT DEFAULT '',
    contacto_emergencia TEXT DEFAULT '',
    apto_medico_vence TEXT DEFAULT '',
    plan_id INTEGER REFERENCES planes(id),
    fecha_alta TEXT NOT NULL,
    vencimiento TEXT DEFAULT '',
    notas TEXT DEFAULT '',
    activo INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    plan_id INTEGER REFERENCES planes(id),
    fecha TEXT NOT NULL,
    monto INTEGER NOT NULL,
    medio TEXT NOT NULL,
    periodos INTEGER NOT NULL DEFAULT 1,
    desde TEXT NOT NULL,
    hasta TEXT NOT NULL,
    vencimiento_anterior TEXT DEFAULT '',
    notas TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso','egreso')),
    categoria TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    monto INTEGER NOT NULL,
    medio TEXT DEFAULT 'Efectivo',
    pago_id INTEGER REFERENCES pagos(id),
    creado TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mov_fecha ON movimientos(fecha);
CREATE TABLE IF NOT EXISTS asistencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_asist_fecha ON asistencias(fecha);
"""


# ---------------------------------------------------------------------------
# Aviso de actualizaciones (consulta la última versión publicada en GitHub)
# ---------------------------------------------------------------------------
_cache_update = {"t": 0.0, "data": None}


def version_tupla(s):
    partes = []
    for parte in str(s or "").lstrip("vV").split("."):
        num = ""
        for ch in parte:
            if ch.isdigit():
                num += ch
            else:
                break
        partes.append(int(num) if num else 0)
    return tuple(partes) or (0,)


def consultar_actualizacion(forzar=False):
    ahora = time.time()
    if not forzar and _cache_update["data"] and ahora - _cache_update["t"] < 3600:
        return _cache_update["data"]
    res = {"version_actual": VERSION, "version_nueva": None, "hay_actualizacion": False,
           "url": "", "url_descarga": "", "notas": "", "sin_conexion": False}
    try:
        req = Request("https://api.github.com/repos/%s/releases/latest" % REPO,
                      headers={"Accept": "application/vnd.github+json", "User-Agent": "GymAdmin"})
        with urlopen(req, timeout=5) as r:
            data = json.loads(r.read().decode("utf-8"))
        tag = data.get("tag_name") or ""
        res["version_nueva"] = tag.lstrip("vV")
        res["url"] = data.get("html_url") or ("https://github.com/%s/releases" % REPO)
        res["notas"] = (data.get("body") or "").strip()[:600]
        for a in data.get("assets", []):
            if (a.get("name") or "").lower().endswith(".exe"):
                res["url_descarga"] = a.get("browser_download_url") or ""
        res["hay_actualizacion"] = version_tupla(tag) > version_tupla(VERSION)
    except Exception:
        res["sin_conexion"] = True
    _cache_update["t"] = ahora
    _cache_update["data"] = res
    return res


class ErrorUsuario(Exception):
    """Error con mensaje para mostrar al usuario."""

    def __init__(self, mensaje, estado=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.estado = estado


# ---------------------------------------------------------------------------
# Base de datos
# ---------------------------------------------------------------------------
def conectar():
    con = sqlite3.connect(DB_PATH, timeout=10)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def inicializar_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    nueva = not os.path.exists(DB_PATH)
    con = conectar()
    con.executescript(ESQUEMA)
    if nueva or con.execute("SELECT COUNT(*) FROM config").fetchone()[0] == 0:
        valores = {
            "nombre_gimnasio": "Mi Gimnasio",
            "moneda": "$",
            "dias_aviso": "7",
            "categorias_ingreso": json.dumps(CATEGORIAS_INGRESO, ensure_ascii=False),
            "categorias_egreso": json.dumps(CATEGORIAS_EGRESO, ensure_ascii=False),
            "medios_pago": json.dumps(MEDIOS_PAGO, ensure_ascii=False),
        }
        for k, v in valores.items():
            con.execute("INSERT OR IGNORE INTO config (clave, valor) VALUES (?, ?)", (k, v))
    if con.execute("SELECT COUNT(*) FROM planes").fetchone()[0] == 0:
        planes = [
            ("Pase libre mensual", 3000000, 30, "Acceso ilimitado a sala y clases"),
            ("3 veces por semana", 2200000, 30, "Hasta 12 ingresos por mes"),
            ("Trimestral pase libre", 8100000, 90, "Tres meses con descuento"),
            ("Clase suelta", 500000, 1, "Un día de acceso"),
        ]
        con.executemany("INSERT INTO planes (nombre, precio, duracion_dias, descripcion) VALUES (?,?,?,?)", planes)
    con.commit()
    con.close()
    copia_automatica()


def copia_automatica():
    """Guarda una copia diaria de la base (se conservan las últimas 30)."""
    try:
        destino = os.path.join(BACKUP_DIR, "gimnasio-%s.db" % date.today().isoformat())
        if not os.path.exists(destino) and os.path.exists(DB_PATH):
            src = sqlite3.connect(DB_PATH)
            dst = sqlite3.connect(destino)
            src.backup(dst)
            dst.close()
            src.close()
        copias = sorted(f for f in os.listdir(BACKUP_DIR) if f.endswith(".db"))
        for viejo in copias[:-30]:
            os.remove(os.path.join(BACKUP_DIR, viejo))
    except Exception as e:  # una copia fallida no debe impedir usar la app
        print("Aviso: no se pudo hacer la copia de seguridad automática:", e)


def leer_config(con):
    cfg = {r["clave"]: r["valor"] for r in con.execute("SELECT clave, valor FROM config")}
    for k in ("categorias_ingreso", "categorias_egreso", "medios_pago"):
        try:
            cfg[k] = json.loads(cfg.get(k) or "[]")
        except ValueError:
            cfg[k] = []
    cfg["dias_aviso"] = int(cfg.get("dias_aviso") or 7)
    return cfg


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def hoy():
    return date.today()


def a_fecha(texto, campo="fecha", obligatorio=True):
    if not texto:
        if obligatorio:
            raise ErrorUsuario("Falta completar el campo '%s'." % campo)
        return None
    try:
        return datetime.strptime(str(texto)[:10], "%Y-%m-%d").date()
    except ValueError:
        raise ErrorUsuario("La fecha del campo '%s' no es válida." % campo)


def a_centavos(valor, campo="monto"):
    if valor is None or valor == "":
        raise ErrorUsuario("Falta completar el campo '%s'." % campo)
    try:
        if isinstance(valor, str):
            valor = valor.replace("$", "").replace(" ", "")
            # admite "1.234,50" y "1234.50"
            if "," in valor:
                valor = valor.replace(".", "").replace(",", ".")
        num = float(valor)
    except (TypeError, ValueError):
        raise ErrorUsuario("El %s ingresado no es un número válido." % campo)
    if num < 0:
        raise ErrorUsuario("El %s no puede ser negativo." % campo)
    return int(round(num * 100))


def pesos(centavos):
    return round((centavos or 0) / 100.0, 2)


def texto(d, clave, maximo=500):
    v = d.get(clave)
    if v is None:
        return ""
    return str(v).strip()[:maximo]


def estado_cuota(vencimiento, dias_aviso, activo=1):
    if not activo:
        return "baja"
    if not vencimiento:
        return "sin_pago"
    v = a_fecha(vencimiento, obligatorio=False)
    if v is None:
        return "sin_pago"
    dias = (v - hoy()).days
    if dias < 0:
        return "vencida"
    if dias <= dias_aviso:
        return "por_vencer"
    return "al_dia"


def cliente_a_dict(r, dias_aviso):
    d = dict(r)
    d["estado"] = estado_cuota(d.get("vencimiento"), dias_aviso, d.get("activo", 1))
    if d.get("vencimiento"):
        d["dias_restantes"] = (a_fecha(d["vencimiento"]) - hoy()).days
    else:
        d["dias_restantes"] = None
    if "plan_precio" in d and d["plan_precio"] is not None:
        d["plan_precio"] = pesos(d["plan_precio"])
    return d


SQL_CLIENTE = """
SELECT c.*, p.nombre AS plan_nombre, p.precio AS plan_precio, p.duracion_dias AS plan_duracion,
       (SELECT MAX(a.fecha) FROM asistencias a WHERE a.cliente_id = c.id) AS ultima_asistencia
FROM clientes c LEFT JOIN planes p ON p.id = c.plan_id
"""


def mes_rango(anio, mes):
    inicio = date(anio, mes, 1)
    fin = date(anio + (mes == 12), (mes % 12) + 1, 1) - timedelta(days=1)
    return inicio, fin


def sumar_mes(anio, mes, delta):
    total = anio * 12 + (mes - 1) + delta
    return total // 12, total % 12 + 1


# ---------------------------------------------------------------------------
# Lógica de la API
# ---------------------------------------------------------------------------
def api_config_get(con, q, body):
    cfg = leer_config(con)
    cfg["version"] = VERSION
    cfg["ruta_datos"] = DATA_DIR
    return cfg


def api_config_put(con, q, body):
    for k in ("nombre_gimnasio", "moneda"):
        if k in body:
            con.execute("INSERT OR REPLACE INTO config (clave, valor) VALUES (?, ?)", (k, texto(body, k, 100)))
    if "dias_aviso" in body:
        try:
            dias = max(0, min(60, int(body["dias_aviso"])))
        except (TypeError, ValueError):
            raise ErrorUsuario("Los días de aviso deben ser un número.")
        con.execute("INSERT OR REPLACE INTO config (clave, valor) VALUES ('dias_aviso', ?)", (str(dias),))
    for k in ("categorias_ingreso", "categorias_egreso", "medios_pago"):
        if k in body:
            lista = [str(x).strip()[:80] for x in (body[k] or []) if str(x).strip()]
            if not lista:
                raise ErrorUsuario("La lista no puede quedar vacía.")
            con.execute("INSERT OR REPLACE INTO config (clave, valor) VALUES (?, ?)",
                        (k, json.dumps(lista, ensure_ascii=False)))
    con.commit()
    return api_config_get(con, q, body)


def api_dashboard(con, q, body):
    cfg = leer_config(con)
    dias_aviso = cfg["dias_aviso"]
    t = hoy()
    clientes = [cliente_a_dict(r, dias_aviso) for r in con.execute(SQL_CLIENTE + " WHERE c.activo = 1")]
    activos = len(clientes)
    vencidas = sorted([c for c in clientes if c["estado"] in ("vencida", "sin_pago")],
                      key=lambda c: c["vencimiento"] or "")
    por_vencer = sorted([c for c in clientes if c["estado"] == "por_vencer"], key=lambda c: c["vencimiento"])
    al_dia = len([c for c in clientes if c["estado"] in ("al_dia", "por_vencer")])
    ini, fin = mes_rango(t.year, t.month)
    tot = con.execute("""SELECT
            COALESCE(SUM(CASE WHEN tipo='ingreso' THEN monto END),0) AS ingresos,
            COALESCE(SUM(CASE WHEN tipo='egreso' THEN monto END),0) AS egresos
        FROM movimientos WHERE fecha BETWEEN ? AND ?""", (ini.isoformat(), fin.isoformat())).fetchone()
    hoy_tot = con.execute("""SELECT COALESCE(SUM(CASE WHEN tipo='ingreso' THEN monto END),0) AS ingresos,
            COALESCE(SUM(CASE WHEN tipo='egreso' THEN monto END),0) AS egresos
        FROM movimientos WHERE fecha = ?""", (t.isoformat(),)).fetchone()
    asist_hoy = con.execute("SELECT COUNT(*) FROM asistencias WHERE fecha = ?", (t.isoformat(),)).fetchone()[0]
    caja = con.execute("""SELECT COALESCE(SUM(CASE WHEN tipo='ingreso' THEN monto ELSE -monto END),0)
        FROM movimientos WHERE medio = 'Efectivo'""").fetchone()[0]
    nuevos_mes = con.execute("SELECT COUNT(*) FROM clientes WHERE fecha_alta BETWEEN ? AND ?",
                             (ini.isoformat(), fin.isoformat())).fetchone()[0]
    ultimos = [dict(r) for r in con.execute("""
        SELECT a.hora, c.id AS cliente_id, c.nombre, c.apellido FROM asistencias a
        JOIN clientes c ON c.id = a.cliente_id WHERE a.fecha = ? ORDER BY a.id DESC LIMIT 8""", (t.isoformat(),))]
    return {
        "nombre_gimnasio": cfg.get("nombre_gimnasio"),
        "hoy": t.isoformat(),
        "activos": activos,
        "al_dia": al_dia,
        "nuevos_mes": nuevos_mes,
        "vencidas": vencidas[:50],
        "cant_vencidas": len(vencidas),
        "por_vencer": por_vencer[:50],
        "cant_por_vencer": len(por_vencer),
        "ingresos_mes": pesos(tot["ingresos"]),
        "egresos_mes": pesos(tot["egresos"]),
        "resultado_mes": pesos(tot["ingresos"] - tot["egresos"]),
        "ingresos_hoy": pesos(hoy_tot["ingresos"]),
        "egresos_hoy": pesos(hoy_tot["egresos"]),
        "caja_efectivo": pesos(caja),
        "asistencias_hoy": asist_hoy,
        "ultimas_asistencias": ultimos,
        "serie": serie_mensual(con, t.year, t.month, 6),
    }


def serie_mensual(con, anio, mes, cantidad):
    serie = []
    for i in range(cantidad - 1, -1, -1):
        a, m = sumar_mes(anio, mes, -i)
        ini, fin = mes_rango(a, m)
        r = con.execute("""SELECT COALESCE(SUM(CASE WHEN tipo='ingreso' THEN monto END),0) AS ing,
                COALESCE(SUM(CASE WHEN tipo='egreso' THEN monto END),0) AS egr
            FROM movimientos WHERE fecha BETWEEN ? AND ?""", (ini.isoformat(), fin.isoformat())).fetchone()
        serie.append({"anio": a, "mes": m, "ingresos": pesos(r["ing"]), "egresos": pesos(r["egr"])})
    return serie


# --- Clientes ---------------------------------------------------------------
CAMPOS_CLIENTE = ["nombre", "apellido", "dni", "telefono", "email", "fecha_nacimiento", "direccion",
                  "contacto_emergencia", "apto_medico_vence", "notas"]


def validar_cliente(con, body, cliente_id=None):
    datos = {k: texto(body, k, 2000 if k == "notas" else 200) for k in CAMPOS_CLIENTE}
    if not datos["nombre"]:
        raise ErrorUsuario("El nombre es obligatorio.")
    datos["dni"] = re.sub(r"[^0-9A-Za-z]", "", datos["dni"])
    if datos["dni"]:
        fila = con.execute("SELECT id, nombre, apellido FROM clientes WHERE dni = ? AND id != ?",
                           (datos["dni"], cliente_id or 0)).fetchone()
        if fila:
            raise ErrorUsuario("Ya existe un cliente con ese DNI: %s %s." % (fila["nombre"], fila["apellido"]))
    for campo in ("fecha_nacimiento", "apto_medico_vence"):
        if datos[campo]:
            a_fecha(datos[campo], campo)
    plan_id = body.get("plan_id")
    datos["plan_id"] = int(plan_id) if plan_id not in (None, "", 0, "0") else None
    if datos["plan_id"] and not con.execute("SELECT 1 FROM planes WHERE id = ?", (datos["plan_id"],)).fetchone():
        raise ErrorUsuario("El plan elegido no existe.")
    return datos


def api_clientes_list(con, q, body):
    cfg = leer_config(con)
    busq = (q.get("q") or "").strip()
    filtro = q.get("estado") or "activos"
    sql = SQL_CLIENTE + " WHERE 1=1"
    params = []
    if filtro == "bajas":
        sql += " AND c.activo = 0"
    elif filtro != "todos":
        sql += " AND c.activo = 1"
    if busq:
        for palabra in busq.split():
            sql += " AND (c.nombre LIKE ? OR c.apellido LIKE ? OR c.dni LIKE ? OR c.telefono LIKE ? OR c.email LIKE ?)"
            params += ["%" + palabra + "%"] * 5
    sql += " ORDER BY c.apellido COLLATE NOCASE, c.nombre COLLATE NOCASE"
    lista = [cliente_a_dict(r, cfg["dias_aviso"]) for r in con.execute(sql, params)]
    if filtro in ("vencida", "por_vencer", "al_dia", "sin_pago"):
        if filtro == "vencida":
            lista = [c for c in lista if c["estado"] in ("vencida", "sin_pago")]
        else:
            lista = [c for c in lista if c["estado"] == filtro]
    return lista


def api_cliente_get(con, cid):
    cfg = leer_config(con)
    r = con.execute(SQL_CLIENTE + " WHERE c.id = ?", (cid,)).fetchone()
    if not r:
        raise ErrorUsuario("El cliente no existe.", 404)
    c = cliente_a_dict(r, cfg["dias_aviso"])
    c["pagos"] = []
    for p in con.execute("""SELECT pg.*, pl.nombre AS plan_nombre FROM pagos pg
            LEFT JOIN planes pl ON pl.id = pg.plan_id WHERE pg.cliente_id = ? ORDER BY pg.fecha DESC, pg.id DESC""",
                         (cid,)):
        d = dict(p)
        d["monto"] = pesos(d["monto"])
        c["pagos"].append(d)
    c["asistencias"] = [dict(a) for a in con.execute(
        "SELECT fecha, hora FROM asistencias WHERE cliente_id = ? ORDER BY id DESC LIMIT 30", (cid,))]
    c["asistencias_mes"] = con.execute(
        "SELECT COUNT(*) FROM asistencias WHERE cliente_id = ? AND fecha >= ?",
        (cid, hoy().replace(day=1).isoformat())).fetchone()[0]
    c["total_pagado"] = sum(p["monto"] for p in c["pagos"])
    return c


def api_clientes_post(con, q, body):
    datos = validar_cliente(con, body)
    datos["fecha_alta"] = (a_fecha(body.get("fecha_alta"), obligatorio=False) or hoy()).isoformat()
    cols = list(datos.keys())
    cur = con.execute("INSERT INTO clientes (%s) VALUES (%s)" % (",".join(cols), ",".join("?" * len(cols))),
                      [datos[k] for k in cols])
    con.commit()
    return api_cliente_get(con, cur.lastrowid)


def api_clientes_put(con, cid, body):
    if not con.execute("SELECT 1 FROM clientes WHERE id = ?", (cid,)).fetchone():
        raise ErrorUsuario("El cliente no existe.", 404)
    if set(body.keys()) == {"activo"}:
        con.execute("UPDATE clientes SET activo = ? WHERE id = ?", (1 if body["activo"] else 0, cid))
    else:
        datos = validar_cliente(con, body, cid)
        if body.get("fecha_alta"):
            datos["fecha_alta"] = a_fecha(body["fecha_alta"], "fecha de alta").isoformat()
        if "vencimiento" in body:
            v = a_fecha(body.get("vencimiento"), "vencimiento", obligatorio=False)
            datos["vencimiento"] = v.isoformat() if v else ""
        sets = ", ".join("%s = ?" % k for k in datos)
        con.execute("UPDATE clientes SET %s WHERE id = ?" % sets, list(datos.values()) + [cid])
    con.commit()
    return api_cliente_get(con, cid)


def api_clientes_delete(con, cid):
    if con.execute("SELECT COUNT(*) FROM pagos WHERE cliente_id = ?", (cid,)).fetchone()[0]:
        raise ErrorUsuario("Este cliente tiene pagos registrados y no se puede eliminar "
                           "(la contabilidad quedaría incompleta). Podés darlo de baja.")
    con.execute("DELETE FROM asistencias WHERE cliente_id = ?", (cid,))
    con.execute("DELETE FROM clientes WHERE id = ?", (cid,))
    con.commit()
    return {"ok": True}


# --- Planes -----------------------------------------------------------------
def api_planes_list(con, q, body):
    filas = con.execute("""SELECT p.*, (SELECT COUNT(*) FROM clientes c WHERE c.plan_id = p.id AND c.activo = 1)
        AS clientes FROM planes p ORDER BY p.activo DESC, p.nombre COLLATE NOCASE""").fetchall()
    out = []
    for r in filas:
        d = dict(r)
        d["precio"] = pesos(d["precio"])
        out.append(d)
    return out


def validar_plan(body):
    nombre = texto(body, "nombre", 100)
    if not nombre:
        raise ErrorUsuario("El nombre del plan es obligatorio.")
    try:
        dur = int(body.get("duracion_dias") or 0)
    except (TypeError, ValueError):
        raise ErrorUsuario("La duración debe ser un número de días.")
    if dur < 1 or dur > 3660:
        raise ErrorUsuario("La duración debe estar entre 1 y 3660 días.")
    return {"nombre": nombre, "precio": a_centavos(body.get("precio"), "precio"), "duracion_dias": dur,
            "descripcion": texto(body, "descripcion", 300), "activo": 0 if body.get("activo") is False else 1}


def api_planes_post(con, q, body):
    d = validar_plan(body)
    con.execute("INSERT INTO planes (nombre, precio, duracion_dias, descripcion, activo) VALUES (?,?,?,?,?)",
                (d["nombre"], d["precio"], d["duracion_dias"], d["descripcion"], d["activo"]))
    con.commit()
    return {"ok": True}


def api_planes_put(con, pid, body):
    d = validar_plan(body)
    con.execute("UPDATE planes SET nombre=?, precio=?, duracion_dias=?, descripcion=?, activo=? WHERE id=?",
                (d["nombre"], d["precio"], d["duracion_dias"], d["descripcion"], d["activo"], pid))
    con.commit()
    return {"ok": True}


def api_planes_delete(con, pid):
    usado = con.execute("SELECT (SELECT COUNT(*) FROM clientes WHERE plan_id = ?) + "
                        "(SELECT COUNT(*) FROM pagos WHERE plan_id = ?)", (pid, pid)).fetchone()[0]
    if usado:
        con.execute("UPDATE planes SET activo = 0 WHERE id = ?", (pid,))
        con.commit()
        return {"ok": True, "mensaje": "El plan está en uso, así que se desactivó en lugar de eliminarse."}
    con.execute("DELETE FROM planes WHERE id = ?", (pid,))
    con.commit()
    return {"ok": True, "mensaje": "Plan eliminado."}


# --- Pagos de cuotas --------------------------------------------------------
def api_pagos_post(con, q, body):
    try:
        cid = int(body.get("cliente_id"))
    except (TypeError, ValueError):
        raise ErrorUsuario("Elegí el cliente que paga.")
    cli = con.execute("SELECT * FROM clientes WHERE id = ?", (cid,)).fetchone()
    if not cli:
        raise ErrorUsuario("El cliente no existe.")
    try:
        plan_id = int(body.get("plan_id"))
    except (TypeError, ValueError):
        raise ErrorUsuario("Elegí el plan que se está pagando.")
    plan = con.execute("SELECT * FROM planes WHERE id = ?", (plan_id,)).fetchone()
    if not plan:
        raise ErrorUsuario("El plan no existe.")
    try:
        periodos = max(1, min(24, int(body.get("periodos") or 1)))
    except (TypeError, ValueError):
        raise ErrorUsuario("La cantidad de períodos debe ser un número.")
    fecha = a_fecha(body.get("fecha"), "fecha", obligatorio=False) or hoy()
    monto = a_centavos(body.get("monto"), "monto")
    medio = texto(body, "medio", 60) or "Efectivo"
    # Desde cuándo corre el nuevo período: si la cuota sigue vigente, se extiende desde el vencimiento.
    venc_ant = cli["vencimiento"] or ""
    v = a_fecha(venc_ant, obligatorio=False)
    if body.get("desde"):
        desde = a_fecha(body.get("desde"), "desde")
    elif v and v >= fecha:
        desde = v + timedelta(days=1)
    else:
        desde = fecha
    hasta = desde + timedelta(days=plan["duracion_dias"] * periodos - 1)
    nuevo_venc = max(hasta, v) if v else hasta
    notas = texto(body, "notas", 300)
    cur = con.execute("""INSERT INTO pagos (cliente_id, plan_id, fecha, monto, medio, periodos, desde, hasta,
            vencimiento_anterior, notas) VALUES (?,?,?,?,?,?,?,?,?,?)""",
                      (cid, plan_id, fecha.isoformat(), monto, medio, periodos, desde.isoformat(), hasta.isoformat(),
                       venc_ant, notas))
    pago_id = cur.lastrowid
    desc = "Cuota %s - %s %s (%s al %s)" % (plan["nombre"], cli["nombre"], cli["apellido"],
                                             desde.strftime("%d/%m/%Y"), hasta.strftime("%d/%m/%Y"))
    con.execute("""INSERT INTO movimientos (fecha, tipo, categoria, descripcion, monto, medio, pago_id, creado)
        VALUES (?, 'ingreso', 'Cuotas', ?, ?, ?, ?, ?)""",
                (fecha.isoformat(), desc, monto, medio, pago_id, datetime.now().isoformat(timespec="seconds")))
    con.execute("UPDATE clientes SET vencimiento = ?, plan_id = ?, activo = 1 WHERE id = ?",
                (nuevo_venc.isoformat(), plan_id, cid))
    con.commit()
    return {"ok": True, "pago_id": pago_id, "desde": desde.isoformat(), "hasta": hasta.isoformat(),
            "vencimiento": nuevo_venc.isoformat()}


def api_pagos_delete(con, pid):
    pago = con.execute("SELECT * FROM pagos WHERE id = ?", (pid,)).fetchone()
    if not pago:
        raise ErrorUsuario("El pago no existe.", 404)
    ultimo = con.execute("SELECT MAX(id) FROM pagos WHERE cliente_id = ?", (pago["cliente_id"],)).fetchone()[0]
    con.execute("DELETE FROM movimientos WHERE pago_id = ?", (pid,))
    con.execute("DELETE FROM pagos WHERE id = ?", (pid,))
    if ultimo == pid:
        con.execute("UPDATE clientes SET vencimiento = ? WHERE id = ?",
                    (pago["vencimiento_anterior"] or "", pago["cliente_id"]))
    con.commit()
    return {"ok": True}


# --- Asistencia -------------------------------------------------------------
def api_asistencias_post(con, q, body):
    cfg = leer_config(con)
    cid = body.get("cliente_id")
    if not cid:
        dni = re.sub(r"[^0-9A-Za-z]", "", texto(body, "dni", 30))
        if not dni:
            raise ErrorUsuario("Ingresá el DNI o elegí el cliente.")
        fila = con.execute("SELECT id FROM clientes WHERE dni = ?", (dni,)).fetchone()
        if not fila:
            raise ErrorUsuario("No hay ningún cliente con DNI %s." % dni, 404)
        cid = fila["id"]
    cid = int(cid)
    r = con.execute(SQL_CLIENTE + " WHERE c.id = ?", (cid,)).fetchone()
    if not r:
        raise ErrorUsuario("El cliente no existe.", 404)
    ahora = datetime.now()
    ya = con.execute("SELECT hora FROM asistencias WHERE cliente_id = ? AND fecha = ? ORDER BY id DESC LIMIT 1",
                     (cid, ahora.date().isoformat())).fetchone()
    if not ya or body.get("forzar"):
        con.execute("INSERT INTO asistencias (cliente_id, fecha, hora) VALUES (?,?,?)",
                    (cid, ahora.date().isoformat(), ahora.strftime("%H:%M")))
        con.commit()
    c = cliente_a_dict(r, cfg["dias_aviso"])
    c["ya_registrado"] = bool(ya)
    c["hora_anterior"] = ya["hora"] if ya else None
    c["asistencias_mes"] = con.execute("SELECT COUNT(*) FROM asistencias WHERE cliente_id = ? AND fecha >= ?",
                                       (cid, hoy().replace(day=1).isoformat())).fetchone()[0]
    return c


def api_asistencias_list(con, q, body):
    f = a_fecha(q.get("fecha"), obligatorio=False) or hoy()
    return [dict(r) for r in con.execute("""SELECT a.id, a.hora, c.id AS cliente_id, c.nombre, c.apellido, c.dni
        FROM asistencias a JOIN clientes c ON c.id = a.cliente_id WHERE a.fecha = ? ORDER BY a.id DESC""",
                                          (f.isoformat(),))]


def api_asistencias_delete(con, aid):
    con.execute("DELETE FROM asistencias WHERE id = ?", (aid,))
    con.commit()
    return {"ok": True}


# --- Contabilidad -----------------------------------------------------------
def filtro_movimientos(q):
    t = hoy()
    desde = a_fecha(q.get("desde"), obligatorio=False) or t.replace(day=1)
    hasta = a_fecha(q.get("hasta"), obligatorio=False) or mes_rango(t.year, t.month)[1]
    sql = " WHERE m.fecha BETWEEN ? AND ?"
    params = [desde.isoformat(), hasta.isoformat()]
    if q.get("tipo") in ("ingreso", "egreso"):
        sql += " AND m.tipo = ?"
        params.append(q["tipo"])
    if q.get("categoria"):
        sql += " AND m.categoria = ?"
        params.append(q["categoria"])
    if q.get("medio"):
        sql += " AND m.medio = ?"
        params.append(q["medio"])
    if q.get("q"):
        sql += " AND m.descripcion LIKE ?"
        params.append("%" + q["q"] + "%")
    return sql, params, desde, hasta


def api_movimientos_list(con, q, body):
    where, params, desde, hasta = filtro_movimientos(q)
    filas = con.execute("SELECT m.* FROM movimientos m" + where + " ORDER BY m.fecha DESC, m.id DESC", params)
    movs = []
    ing = egr = 0
    por_cat = {}
    por_medio = {}
    for r in filas:
        d = dict(r)
        if d["tipo"] == "ingreso":
            ing += d["monto"]
        else:
            egr += d["monto"]
        clave = (d["tipo"], d["categoria"])
        por_cat[clave] = por_cat.get(clave, 0) + d["monto"]
        signo = 1 if d["tipo"] == "ingreso" else -1
        por_medio[d["medio"]] = por_medio.get(d["medio"], 0) + signo * d["monto"]
        d["monto"] = pesos(d["monto"])
        movs.append(d)
    return {
        "desde": desde.isoformat(), "hasta": hasta.isoformat(),
        "movimientos": movs,
        "ingresos": pesos(ing), "egresos": pesos(egr), "resultado": pesos(ing - egr),
        "por_categoria": sorted([{"tipo": k[0], "categoria": k[1], "monto": pesos(v)} for k, v in por_cat.items()],
                                key=lambda x: (x["tipo"] != "ingreso", -x["monto"])),
        "por_medio": sorted([{"medio": k, "monto": pesos(v)} for k, v in por_medio.items()],
                            key=lambda x: -abs(x["monto"])),
        "serie": serie_mensual(con, hasta.year, hasta.month, 12),
    }


def api_movimientos_post(con, q, body):
    tipo = body.get("tipo")
    if tipo not in ("ingreso", "egreso"):
        raise ErrorUsuario("Indicá si es un ingreso o un egreso.")
    categoria = texto(body, "categoria", 80)
    if not categoria:
        raise ErrorUsuario("Elegí una categoría.")
    monto = a_centavos(body.get("monto"))
    if monto == 0:
        raise ErrorUsuario("El monto debe ser mayor a cero.")
    fecha = a_fecha(body.get("fecha"), obligatorio=False) or hoy()
    con.execute("""INSERT INTO movimientos (fecha, tipo, categoria, descripcion, monto, medio, creado)
        VALUES (?,?,?,?,?,?,?)""", (fecha.isoformat(), tipo, categoria, texto(body, "descripcion", 300), monto,
                                    texto(body, "medio", 60) or "Efectivo",
                                    datetime.now().isoformat(timespec="seconds")))
    con.commit()
    return {"ok": True}


def api_movimientos_put(con, mid, body):
    m = con.execute("SELECT * FROM movimientos WHERE id = ?", (mid,)).fetchone()
    if not m:
        raise ErrorUsuario("El movimiento no existe.", 404)
    if m["pago_id"]:
        raise ErrorUsuario("Este movimiento corresponde a un cobro de cuota. "
                           "Para corregirlo, anulá el pago desde la ficha del cliente.")
    tipo = body.get("tipo") if body.get("tipo") in ("ingreso", "egreso") else m["tipo"]
    monto = a_centavos(body.get("monto"))
    fecha = a_fecha(body.get("fecha"), "fecha")
    con.execute("UPDATE movimientos SET fecha=?, tipo=?, categoria=?, descripcion=?, monto=?, medio=? WHERE id=?",
                (fecha.isoformat(), tipo, texto(body, "categoria", 80) or m["categoria"],
                 texto(body, "descripcion", 300), monto, texto(body, "medio", 60) or m["medio"], mid))
    con.commit()
    return {"ok": True}


def api_movimientos_delete(con, mid):
    m = con.execute("SELECT pago_id FROM movimientos WHERE id = ?", (mid,)).fetchone()
    if not m:
        raise ErrorUsuario("El movimiento no existe.", 404)
    if m["pago_id"]:
        raise ErrorUsuario("Este movimiento corresponde a un cobro de cuota. "
                           "Para eliminarlo, anulá el pago desde la ficha del cliente.")
    con.execute("DELETE FROM movimientos WHERE id = ?", (mid,))
    con.commit()
    return {"ok": True}


# --- Exportaciones ----------------------------------------------------------
def csv_bytes(encabezados, filas):
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";")
    w.writerow(encabezados)
    for f in filas:
        w.writerow(f)
    # BOM para que Excel lo abra con acentos correctos
    return ("﻿" + buf.getvalue()).encode("utf-8")


def numero_ar(valor):
    return ("%.2f" % valor).replace(".", ",")


def export_clientes(con, q):
    cfg = leer_config(con)
    filas = []
    for r in con.execute(SQL_CLIENTE + " ORDER BY c.apellido, c.nombre"):
        c = cliente_a_dict(r, cfg["dias_aviso"])
        filas.append([c["id"], c["apellido"], c["nombre"], c["dni"], c["telefono"], c["email"],
                      c["fecha_nacimiento"], c["direccion"], c["plan_nombre"] or "", c["fecha_alta"],
                      c["vencimiento"], ESTADOS_TXT.get(c["estado"], c["estado"]), c["apto_medico_vence"],
                      c["contacto_emergencia"], c["notas"]])
    return csv_bytes(["ID", "Apellido", "Nombre", "DNI", "Teléfono", "Email", "Nacimiento", "Dirección", "Plan",
                      "Alta", "Vencimiento cuota", "Estado", "Apto médico vence", "Contacto emergencia", "Notas"],
                     filas)


ESTADOS_TXT = {"al_dia": "Al día", "por_vencer": "Por vencer", "vencida": "Vencida", "sin_pago": "Sin pagos",
               "baja": "Baja"}


def export_movimientos(con, q):
    where, params, _, _ = filtro_movimientos(q)
    filas = []
    for r in con.execute("SELECT m.* FROM movimientos m" + where + " ORDER BY m.fecha, m.id", params):
        filas.append([r["fecha"], "Ingreso" if r["tipo"] == "ingreso" else "Egreso", r["categoria"],
                      r["descripcion"], r["medio"],
                      numero_ar(pesos(r["monto"]) * (1 if r["tipo"] == "ingreso" else -1))])
    return csv_bytes(["Fecha", "Tipo", "Categoría", "Descripción", "Medio de pago", "Monto"], filas)


# ---------------------------------------------------------------------------
# Servidor HTTP
# ---------------------------------------------------------------------------
RUTAS = [
    ("GET", r"^/api/config$", api_config_get),
    ("PUT", r"^/api/config$", api_config_put),
    ("GET", r"^/api/dashboard$", api_dashboard),
    ("GET", r"^/api/actualizacion$", lambda con, q, b: consultar_actualizacion(q.get("forzar") == "1")),
    ("GET", r"^/api/clientes$", api_clientes_list),
    ("POST", r"^/api/clientes$", api_clientes_post),
    ("GET", r"^/api/clientes/(\d+)$", lambda con, q, b, i: api_cliente_get(con, int(i))),
    ("PUT", r"^/api/clientes/(\d+)$", lambda con, q, b, i: api_clientes_put(con, int(i), b)),
    ("DELETE", r"^/api/clientes/(\d+)$", lambda con, q, b, i: api_clientes_delete(con, int(i))),
    ("GET", r"^/api/planes$", api_planes_list),
    ("POST", r"^/api/planes$", api_planes_post),
    ("PUT", r"^/api/planes/(\d+)$", lambda con, q, b, i: api_planes_put(con, int(i), b)),
    ("DELETE", r"^/api/planes/(\d+)$", lambda con, q, b, i: api_planes_delete(con, int(i))),
    ("POST", r"^/api/pagos$", api_pagos_post),
    ("DELETE", r"^/api/pagos/(\d+)$", lambda con, q, b, i: api_pagos_delete(con, int(i))),
    ("GET", r"^/api/asistencias$", api_asistencias_list),
    ("POST", r"^/api/asistencias$", api_asistencias_post),
    ("DELETE", r"^/api/asistencias/(\d+)$", lambda con, q, b, i: api_asistencias_delete(con, int(i))),
    ("GET", r"^/api/movimientos$", api_movimientos_list),
    ("POST", r"^/api/movimientos$", api_movimientos_post),
    ("PUT", r"^/api/movimientos/(\d+)$", lambda con, q, b, i: api_movimientos_put(con, int(i), b)),
    ("DELETE", r"^/api/movimientos/(\d+)$", lambda con, q, b, i: api_movimientos_delete(con, int(i))),
]

TIPOS = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
         ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
         ".ico": "image/x-icon", ".json": "application/json"}


class Manejador(BaseHTTPRequestHandler):
    server_version = "GymAdmin/" + VERSION

    def log_message(self, fmt, *args):  # silencio en consola
        pass

    def _enviar(self, estado, cuerpo, tipo="application/json; charset=utf-8", extra=None):
        self.send_response(estado)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(cuerpo)

    def _json(self, estado, datos):
        self._enviar(estado, json.dumps(datos, ensure_ascii=False).encode("utf-8"))

    def _archivo_estatico(self, ruta):
        if ruta in ("/", ""):
            ruta = "/index.html"
        completa = os.path.normpath(os.path.join(STATIC_DIR, ruta.lstrip("/")))
        if not completa.startswith(os.path.normpath(STATIC_DIR)) or not os.path.isfile(completa):
            completa = os.path.join(STATIC_DIR, "index.html")
        with open(completa, "rb") as f:
            datos = f.read()
        tipo = TIPOS.get(os.path.splitext(completa)[1], "application/octet-stream")
        # Fuerza el motor moderno en Edge/Internet Explorer (127.0.0.1 es "intranet")
        extra = {"X-UA-Compatible": "IE=edge"} if tipo.startswith("text/html") else None
        self._enviar(200, datos, tipo, extra)

    def _descarga(self, nombre, datos, tipo):
        self._enviar(200, datos, tipo, {"Content-Disposition": 'attachment; filename="%s"' % nombre})

    def _procesar(self, metodo):
        url = urlparse(self.path)
        ruta = url.path
        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        if not ruta.startswith("/api/"):
            if metodo in ("GET", "HEAD"):
                return self._archivo_estatico(ruta)
            return self._json(404, {"error": "No encontrado"})
        try:
            body = {}
            largo = int(self.headers.get("Content-Length") or 0)
            if largo:
                body = json.loads(self.rfile.read(largo).decode("utf-8") or "{}")
            with DB_LOCK:
                con = conectar()
                try:
                    if metodo == "POST" and ruta == "/api/salir":
                        self._json(200, {"ok": True})
                        print("GymAdmin: cerrado desde la aplicación.")
                        threading.Timer(0.4, lambda: os._exit(0)).start()
                        return
                    if metodo == "GET" and ruta == "/api/exportar/clientes.csv":
                        return self._descarga("clientes-%s.csv" % hoy().isoformat(), export_clientes(con, q),
                                              "text/csv; charset=utf-8")
                    if metodo == "GET" and ruta == "/api/exportar/movimientos.csv":
                        return self._descarga("movimientos-%s.csv" % hoy().isoformat(),
                                              export_movimientos(con, q), "text/csv; charset=utf-8")
                    if metodo == "GET" and ruta == "/api/copia-seguridad":
                        tmp = os.path.join(DATA_DIR, "_descarga.db")
                        dst = sqlite3.connect(tmp)
                        con.backup(dst)
                        dst.close()
                        with open(tmp, "rb") as f:
                            datos = f.read()
                        os.remove(tmp)
                        return self._descarga("gimnasio-copia-%s.db" % datetime.now().strftime("%Y%m%d-%H%M"),
                                              datos, "application/octet-stream")
                    for m, patron, fn in RUTAS:
                        if m != metodo:
                            continue
                        coincide = re.match(patron, ruta)
                        if coincide:
                            res = fn(con, q, body, *coincide.groups())
                            return self._json(200, res)
                    return self._json(404, {"error": "Ruta no encontrada"})
                finally:
                    con.close()
        except ErrorUsuario as e:
            return self._json(e.estado, {"error": e.mensaje})
        except Exception as e:  # error inesperado
            import traceback
            traceback.print_exc()
            return self._json(500, {"error": "Error interno: %s" % e})

    def do_GET(self):
        self._procesar("GET")

    def do_HEAD(self):
        self._procesar("HEAD")

    def do_POST(self):
        self._procesar("POST")

    def do_PUT(self):
        self._procesar("PUT")

    def do_DELETE(self):
        self._procesar("DELETE")


def puerto_libre(host, preferido):
    for p in [preferido] + list(range(preferido + 1, preferido + 20)):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, p))
                return p
            except OSError:
                continue
    raise SystemExit("No se encontró un puerto libre.")


def ya_corriendo(puerto):
    """Devuelve True si en ese puerto ya responde una instancia de GymAdmin."""
    try:
        req = Request("http://127.0.0.1:%d/api/config" % puerto, headers={"User-Agent": "GymAdmin"})
        with urlopen(req, timeout=1.5) as r:
            data = json.loads(r.read().decode("utf-8"))
        return bool(data.get("version"))
    except Exception:
        return False


def ip_local():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return "127.0.0.1"


def main():
    ap = argparse.ArgumentParser(description="GymAdmin - gestión de gimnasios")
    ap.add_argument("--puerto", type=int, default=8765)
    ap.add_argument("--red", action="store_true", help="permitir acceso desde otros equipos de la red local")
    ap.add_argument("--sin-navegador", action="store_true", help="no abrir el navegador automáticamente")
    args = ap.parse_args()

    # Si ya hay una instancia abierta en el puerto preferido, solo abrir el navegador y salir
    # (evita dejar copias corriendo cuando se hace doble clic varias veces).
    if not args.red and ya_corriendo(args.puerto):
        url = "http://127.0.0.1:%d/" % args.puerto
        print("GymAdmin ya estaba abierto. Abriendo %s" % url)
        if not args.sin_navegador:
            webbrowser.open(url)
        return

    inicializar_db()
    host = "0.0.0.0" if args.red else "127.0.0.1"
    puerto = puerto_libre(host, args.puerto)
    servidor = ThreadingHTTPServer((host, puerto), Manejador)
    url = "http://127.0.0.1:%d/" % puerto
    print("=" * 60)
    print("  GymAdmin %s en funcionamiento" % VERSION)
    print("  Abrí en el navegador:  %s" % url)
    if args.red:
        print("  Desde otros equipos:   http://%s:%d/" % (ip_local(), puerto))
    print("  Datos guardados en:    %s" % DATA_DIR)
    print("  Para cerrar la aplicación, cerrá esta ventana o presioná Ctrl+C")
    print("=" * 60)
    if not args.sin_navegador:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()
        print("GymAdmin cerrado.")


if __name__ == "__main__":
    main()
