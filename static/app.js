/* GymAdmin - interfaz */
"use strict";

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICONOS = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>',
  check: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
  clientes: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M17 14.5c2.4 0 4.2 1.5 4.6 4.5"/>',
  caja: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/><path d="M8 6V4h8v2"/>',
  planes: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  dinero: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
  gasto: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
  ingreso: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M4 4h16"/>',
  persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>',
  personaMas: '<circle cx="10" cy="8" r="4"/><path d="M2.5 21c.8-4.2 4-6.5 7.5-6.5 1.5 0 2.9.4 4.1 1"/><path d="M19 14v6M16 17h6"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m14 6 4 4"/>',
  borrar: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
  cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
  descargar: '<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
  imprimir: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2 1.8.8-.4 1.6c-3.6.6-8-3.8-7.4-7.4l1.6-.4.8 1.8z"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tendencia: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
};
const ico = (n, extra = "") => `<svg class="i ${extra}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ""}</svg>`;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_C = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const ESTADOS = { al_dia: "Al día", por_vencer: "Por vencer", vencida: "Vencida", sin_pago: "Sin pagos", baja: "De baja" };

let CONFIG = { moneda: "$", nombre_gimnasio: "Mi Gimnasio", dias_aviso: 7, categorias_ingreso: [], categorias_egreso: [], medios_pago: [] };
let PLANES = [];

const fmtNum = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const dinero = (v) => `${v < 0 ? "−" : ""}${CONFIG.moneda || "$"} ${fmtNum.format(Math.abs(v || 0))}`;

function hoyISO() {
  const d = new Date();
  return isoDe(d);
}
function isoDe(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function deISO(s) {
  const [a, m, d] = s.split("-").map(Number);
  return new Date(a, m - 1, d);
}
function sumarDias(iso, n) {
  const d = deISO(iso);
  d.setDate(d.getDate() + n);
  return isoDe(d);
}
function fmtFecha(iso) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}
function fmtFechaLarga(iso) {
  const d = deISO(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}
function textoDias(n) {
  if (n == null) return "";
  if (n === 0) return "vence hoy";
  if (n === 1) return "vence mañana";
  if (n > 0) return `vence en ${n} días`;
  if (n === -1) return "venció ayer";
  return `venció hace ${-n} días`;
}
const nombreCompleto = (c) => `${c.nombre || ""} ${c.apellido || ""}`.trim();
const iniciales = (c) => ((c.nombre || "?")[0] + ((c.apellido || "")[0] || "")).toUpperCase();
const COLORES_AV = ["#E8572A", "#2E6BC6", "#1F8A5B", "#8A4FBF", "#B7791F", "#C8372D", "#1C8C99", "#5C6270"];
function colorAvatar(c) {
  const s = nombreCompleto(c);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return COLORES_AV[h % COLORES_AV.length];
}
const avatar = (c, extra = "") => `<span class="avatar ${extra}" style="--c:${colorAvatar(c)}">${esc(iniciales(c))}</span>`;
const badge = (estado) => `<span class="badge b-${estado}">${ESTADOS[estado] || estado}</span>`;

function linkWhatsapp(tel, texto) {
  let n = String(tel || "").replace(/\D/g, "");
  if (!n) return null;
  if (n.startsWith("0")) n = n.slice(1);
  if (!n.startsWith("54") && n.length === 10) n = "549" + n; // número argentino sin código de país
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

async function api(metodo, url, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  if (cuerpo !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }
  let r;
  try {
    r = await fetch(url, opciones);
  } catch (e) {
    throw new Error("No hay conexión con la aplicación. ¿Está abierta la ventana de GymAdmin?");
  }
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || `Error ${r.status}`);
  return datos;
}

function toast(msj, tipo = "") {
  const t = document.createElement("div");
  t.className = `toast ${tipo}`;
  t.textContent = msj;
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), tipo === "error" ? 6000 : 3500);
}

function debounce(fn, ms = 250) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
let alCerrarModal = null;
function abrirModal(html, { ancho = false, alCerrar = null } = {}) {
  const m = $("#modal");
  m.className = "modal" + (ancho ? " ancho" : "");
  m.innerHTML = html;
  $("#modalFondo").hidden = false;
  alCerrarModal = alCerrar;
  $$("[data-cerrar]", m).forEach((b) => b.addEventListener("click", cerrarModal));
  const primero = $("[autofocus]", m) || $("input, select, textarea", m);
  if (primero) setTimeout(() => primero.focus(), 30);
  return m;
}
function cerrarModal() {
  $("#modalFondo").hidden = true;
  $("#modal").innerHTML = "";
  const f = alCerrarModal;
  alCerrarModal = null;
  if (f) f();
}
$("#modalFondo").addEventListener("mousedown", (e) => {
  if (e.target.id === "modalFondo") cerrarModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#modalFondo").hidden) cerrarModal();
});
const cabModal = (titulo) => `<div class="modal-cab"><h2>${titulo}</h2><button class="btn btn-texto" data-cerrar aria-label="Cerrar">${ico("cerrar")}</button></div>`;

function confirmar(titulo, mensaje, textoBoton = "Confirmar", peligro = true) {
  return new Promise((res) => {
    let respondido = false;
    const m = abrirModal(`${cabModal(esc(titulo))}<div class="modal-cuerpo"><p style="margin:0">${mensaje}</p></div>
      <div class="modal-pie"><button class="btn" data-cerrar>Cancelar</button>
      <button class="btn ${peligro ? "btn-peligro" : "btn-primario"}" id="btnSi">${esc(textoBoton)}</button></div>`,
      { alCerrar: () => { if (!respondido) res(false); } });
    $("#btnSi", m).addEventListener("click", () => {
      respondido = true;
      cerrarModal();
      res(true);
    });
    setTimeout(() => $("#btnSi", m).focus(), 40);
  });
}

function leerForm(form) {
  const d = {};
  $$("input[name], select[name], textarea[name]", form).forEach((el) => {
    d[el.name] = el.type === "checkbox" ? el.checked : el.value;
  });
  return d;
}

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------
const VISTAS = {};
function irA(vista) {
  if (location.hash !== "#" + vista) location.hash = vista;
  else render();
}
async function render() {
  const vista = (location.hash || "#inicio").slice(1).split("?")[0] || "inicio";
  const fn = VISTAS[vista] || VISTAS.inicio;
  $$("#menu a").forEach((a) => a.classList.toggle("activo", a.dataset.vista === vista));
  const cont = $("#contenido");
  try {
    await fn(cont);
  } catch (e) {
    cont.innerHTML = `<div class="tarjeta vacio"><b>No se pudo cargar esta sección</b>${esc(e.message)}</div>`;
  }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", render);

async function cargarBase() {
  CONFIG = await api("GET", "/api/config");
  PLANES = await api("GET", "/api/planes");
  $("#nombreGimnasio").textContent = CONFIG.nombre_gimnasio;
  document.title = `${CONFIG.nombre_gimnasio} · GymAdmin`;
}

// Recarga la vista actual (después de guardar algo)
const refrescar = () => render();

// ---------------------------------------------------------------------------
// Gráfico de barras ingresos/egresos
// ---------------------------------------------------------------------------
function graficoBarras(serie) {
  const W = 640, H = 220, mi = 54, mb = 26, mt = 10;
  const max = Math.max(1, ...serie.flatMap((s) => [s.ingresos, s.egresos]));
  const paso = niceMax(max);
  const ancho = (W - mi - 8) / serie.length;
  const bw = Math.min(22, ancho / 3);
  const y = (v) => mt + (H - mt - mb) * (1 - v / paso);
  let g = "";
  for (let i = 0; i <= 4; i++) {
    const v = (paso / 4) * i;
    g += `<line x1="${mi}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}" stroke="#EEEBE5"/>`;
    g += `<text x="${mi - 8}" y="${y(v) + 4}" text-anchor="end">${abreviar(v)}</text>`;
  }
  serie.forEach((s, i) => {
    const cx = mi + ancho * i + ancho / 2;
    const hi = Math.max(0, H - mb - y(s.ingresos));
    const he = Math.max(0, H - mb - y(s.egresos));
    g += `<rect x="${cx - bw - 1.5}" y="${H - mb - hi}" width="${bw}" height="${hi}" rx="3" fill="#1F8A5B"><title>Ingresos ${MESES_C[s.mes - 1]} ${s.anio}: ${dinero(s.ingresos)}</title></rect>`;
    g += `<rect x="${cx + 1.5}" y="${H - mb - he}" width="${bw}" height="${he}" rx="3" fill="#E8572A"><title>Egresos ${MESES_C[s.mes - 1]} ${s.anio}: ${dinero(s.egresos)}</title></rect>`;
    g += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${MESES_C[s.mes - 1]}${s.mes === 1 ? " " + String(s.anio).slice(2) : ""}</text>`;
  });
  return `<svg class="grafico" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Ingresos y egresos por mes">${g}</svg>
    <div class="leyenda"><span style="--c:#1F8A5B">Ingresos</span><span style="--c:#E8572A">Egresos</span></div>`;
}
function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}
function abreviar(v) {
  if (v >= 1e6) return (v / 1e6).toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " M";
  if (v >= 1e3) return (v / 1e3).toLocaleString("es-AR", { maximumFractionDigits: 1 }) + " k";
  return String(Math.round(v));
}

// ---------------------------------------------------------------------------
// INICIO
// ---------------------------------------------------------------------------
VISTAS.inicio = async (cont) => {
  const d = await api("GET", "/api/dashboard");
  const fila = (c, tipo) => {
    const wa = linkWhatsapp(c.telefono, `Hola ${c.nombre}! Te escribimos de ${CONFIG.nombre_gimnasio}. ${c.estado === "por_vencer" ? `Te recordamos que tu cuota vence el ${fmtFecha(c.vencimiento)}.` : "Tu cuota se encuentra vencida. ¡Te esperamos para renovarla!"}`);
    return `<li>${avatar(c)}<div class="quien" style="flex:1"><b data-ficha="${c.id}">${esc(nombreCompleto(c))}</b>
      <span>${c.vencimiento ? textoDias(c.dias_restantes) + " · " + fmtFecha(c.vencimiento) : "nunca pagó"}${c.plan_nombre ? " · " + esc(c.plan_nombre) : ""}</span></div>
      ${wa ? `<a class="btn btn-chico btn-texto" href="${wa}" target="_blank" title="Avisar por WhatsApp">${ico("whatsapp")}</a>` : ""}
      <button class="btn btn-chico" data-cobrar="${c.id}">Cobrar</button></li>`;
  };
  cont.innerHTML = `
    <div class="encabezado"><div><h1>Hola 👋</h1><p>Así está ${esc(d.nombre_gimnasio)} hoy, ${fmtFechaLarga(d.hoy)}.</p></div></div>
    <div class="accesos">
      <button class="acceso destacado" data-accion="cobrar"><span class="burbuja">${ico("dinero")}</span><span>Cobrar cuota<small>Registrar un pago</small></span></button>
      <button class="acceso" data-accion="asistencia"><span class="burbuja">${ico("check")}</span><span>Ingreso a sala<small>Controlar por DNI</small></span></button>
      <button class="acceso" data-accion="cliente"><span class="burbuja">${ico("personaMas")}</span><span>Nuevo cliente<small>Dar de alta un socio</small></span></button>
      <button class="acceso" data-accion="gasto"><span class="burbuja">${ico("gasto")}</span><span>Registrar gasto<small>Alquiler, sueldos, etc.</small></span></button>
    </div>
    <div class="grilla g-4">
      <div class="tarjeta kpi"><div class="kpi-tit">${ico("clientes")}Socios activos</div><div class="kpi-valor">${d.activos}</div><div class="kpi-sub">${d.al_dia} con la cuota al día · ${d.nuevos_mes} nuevos este mes</div></div>
      <div class="tarjeta kpi"><div class="kpi-tit">${ico("check")}Ingresos a sala hoy</div><div class="kpi-valor">${d.asistencias_hoy}</div><div class="kpi-sub">Cobrado hoy: ${dinero(d.ingresos_hoy)}</div></div>
      <div class="tarjeta kpi"><div class="kpi-tit">${ico("ingreso")}Ingresos de ${MESES[new Date().getMonth()]}</div><div class="kpi-valor">${dinero(d.ingresos_mes)}</div><div class="kpi-sub">Gastos: ${dinero(d.egresos_mes)}</div></div>
      <div class="tarjeta kpi ${d.resultado_mes >= 0 ? "verde" : "rojo"}"><div class="kpi-tit">${ico("tendencia")}Resultado del mes</div><div class="kpi-valor">${dinero(d.resultado_mes)}</div><div class="kpi-sub">Efectivo en caja: ${dinero(d.caja_efectivo)}</div></div>
    </div>
    <div class="grilla g-2 mt">
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Cuotas vencidas <span class="badge b-vencida">${d.cant_vencidas}</span></h2><a href="#clientes" data-filtro="vencida" class="btn btn-chico btn-texto">Ver todas</a></div>
        ${d.vencidas.length ? `<ul class="lista-mini">${d.vencidas.slice(0, 8).map((c) => fila(c)).join("")}</ul>` : `<div class="vacio"><b>¡Nadie debe!</b>Todos los socios activos tienen la cuota al día.</div>`}</div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Vencen en los próximos ${CONFIG.dias_aviso} días <span class="badge b-por_vencer">${d.cant_por_vencer}</span></h2><a href="#clientes" data-filtro="por_vencer" class="btn btn-chico btn-texto">Ver todas</a></div>
        ${d.por_vencer.length ? `<ul class="lista-mini">${d.por_vencer.slice(0, 8).map((c) => fila(c)).join("")}</ul>` : `<div class="vacio"><b>Sin vencimientos cercanos</b>No hay cuotas que venzan en los próximos días.</div>`}</div>
    </div>
    <div class="grilla g-2 mt">
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Ingresos y gastos (últimos 6 meses)</h2><a href="#contabilidad" class="btn btn-chico btn-texto">Contabilidad</a></div><div class="tarjeta-cuerpo">${graficoBarras(d.serie)}</div></div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Últimos ingresos a sala</h2><a href="#asistencia" class="btn btn-chico btn-texto">Registrar</a></div>
        ${d.ultimas_asistencias.length ? `<ul class="lista-mini">${d.ultimas_asistencias.map((a) => `<li>${avatar(a)}<div class="quien" style="flex:1"><b data-ficha="${a.cliente_id}">${esc(nombreCompleto(a))}</b></div><span class="sec num">${esc(a.hora)}</span></li>`).join("")}</ul>` : `<div class="vacio"><b>Todavía nadie ingresó hoy</b>Registrá los ingresos desde “Ingreso a sala”.</div>`}</div>
    </div>`;
  cont.querySelector("[data-accion=cobrar]").onclick = () => formCobro();
  cont.querySelector("[data-accion=asistencia]").onclick = () => irA("asistencia");
  cont.querySelector("[data-accion=cliente]").onclick = () => formCliente();
  cont.querySelector("[data-accion=gasto]").onclick = () => formMovimiento("egreso");
  $$("[data-filtro]", cont).forEach((a) => a.addEventListener("click", () => { estadoClientes.filtro = a.dataset.filtro; }));
  enlazarComunes(cont);
};

function enlazarComunes(cont) {
  $$("[data-ficha]", cont).forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); fichaCliente(+el.dataset.ficha); }));
  $$("[data-cobrar]", cont).forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); formCobro(+el.dataset.cobrar); }));
}

// ---------------------------------------------------------------------------
// INGRESO A SALA (asistencia)
// ---------------------------------------------------------------------------
VISTAS.asistencia = async (cont) => {
  cont.innerHTML = `
    <div class="encabezado"><div><h1>Ingreso a sala</h1><p>Escribí el DNI (o el nombre) y presioná <kbd>Enter</kbd>. Se muestra al instante si la cuota está al día.</p></div></div>
    <div class="checkin">
      <div class="checkin-entrada ac">
        <input type="text" id="ciEntrada" placeholder="DNI o nombre del socio" autocomplete="off" autofocus>
        <button class="btn btn-primario" id="ciBtn">Registrar</button>
        <div class="ac-lista" id="ciLista" hidden></div>
      </div>
      <div id="ciResultado"></div>
      <div class="tarjeta mt"><div class="tarjeta-cab"><h2>Ingresos de hoy <span class="sec" id="ciCuenta"></span></h2></div><div id="ciHoy"></div></div>
    </div>`;
  const entrada = $("#ciEntrada"), lista = $("#ciLista");
  let opciones = [], sel = -1;

  async function cargarHoy() {
    const filas = await api("GET", "/api/asistencias");
    $("#ciCuenta").textContent = `(${filas.length})`;
    $("#ciHoy").innerHTML = filas.length ? `<div class="tabla-cont"><table><thead><tr><th>Hora</th><th>Socio</th><th>DNI</th><th></th></tr></thead><tbody>
      ${filas.map((a) => `<tr><td class="num">${esc(a.hora)}</td><td><span class="nombre-cel" data-ficha="${a.cliente_id}" style="cursor:pointer">${esc(nombreCompleto(a))}</span></td><td class="num">${esc(a.dni || "—")}</td>
      <td class="der"><button class="btn btn-chico btn-texto" data-borrar-asist="${a.id}" title="Quitar registro">${ico("borrar")}</button></td></tr>`).join("")}</tbody></table></div>`
      : `<div class="vacio"><b>Sin ingresos todavía</b>Los ingresos registrados hoy aparecerán acá.</div>`;
    enlazarComunes($("#ciHoy"));
    $$("[data-borrar-asist]").forEach((b) => b.onclick = async () => {
      await api("DELETE", `/api/asistencias/${b.dataset.borrarAsist}`);
      cargarHoy();
    });
  }

  async function registrar(cuerpo) {
    lista.hidden = true;
    try {
      const c = await api("POST", "/api/asistencias", cuerpo);
      mostrarResultado(c);
      entrada.value = "";
      cargarHoy();
    } catch (e) {
      $("#ciResultado").innerHTML = `<div class="resultado mal">${ico("alerta")}<div><h2>No encontrado</h2><div class="msj">${esc(e.message)}</div>
        <div class="det">Si es un socio nuevo, dalo de alta.</div></div><div class="acciones"><button class="btn" id="ciAlta">${ico("personaMas")}Nuevo cliente</button></div></div>`;
      $("#ciAlta").onclick = () => formCliente(null, { dni: /^\d+$/.test(entrada.value.trim()) ? entrada.value.trim() : "" });
      entrada.select();
    }
  }

  function mostrarResultado(c) {
    let clase = "ok", msj = "Cuota al día. ¡Puede pasar!";
    if (c.estado === "por_vencer") { clase = "aviso"; msj = `Puede pasar — su cuota ${textoDias(c.dias_restantes)}.`; }
    if (c.estado === "vencida") { clase = "mal"; msj = `Cuota vencida (${textoDias(c.dias_restantes)}).`; }
    if (c.estado === "sin_pago") { clase = "mal"; msj = "No tiene ningún pago registrado."; }
    if (c.estado === "baja") { clase = "mal"; msj = "El socio está dado de baja."; }
    let apto = "";
    if (c.apto_medico_vence && c.apto_medico_vence < hoyISO()) apto = ` · <b>Apto médico vencido</b> (${fmtFecha(c.apto_medico_vence)})`;
    $("#ciResultado").innerHTML = `<div class="resultado ${clase}">${avatar(c)}<div><h2>${esc(nombreCompleto(c))}</h2><div class="msj">${msj}</div>
      <div class="det">${c.plan_nombre ? esc(c.plan_nombre) + " · " : ""}Vence: ${fmtFecha(c.vencimiento)} · ${c.asistencias_mes} ingresos este mes${c.ya_registrado ? ` · ya había ingresado hoy a las ${esc(c.hora_anterior)}` : ""}${apto}</div></div>
      <div class="acciones">${clase !== "ok" ? `<button class="btn btn-primario" data-cobrar="${c.id}">${ico("dinero")}Cobrar cuota</button>` : ""}<button class="btn" data-ficha="${c.id}">Ver ficha</button></div></div>`;
    enlazarComunes($("#ciResultado"));
  }

  const buscar = debounce(async () => {
    const t = entrada.value.trim();
    if (t.length < 2 || /^\d+$/.test(t)) { lista.hidden = true; opciones = []; return; }
    opciones = (await api("GET", `/api/clientes?estado=todos&q=${encodeURIComponent(t)}`)).slice(0, 8);
    sel = opciones.length ? 0 : -1;
    pintarOpciones();
  }, 200);
  function pintarOpciones() {
    if (!opciones.length) { lista.hidden = true; return; }
    lista.innerHTML = opciones.map((c, i) => `<div class="ac-op ${i === sel ? "sel" : ""}" data-i="${i}">${avatar(c)}<div><b>${esc(nombreCompleto(c))}</b><small>DNI ${esc(c.dni || "—")} · ${ESTADOS[c.estado]}</small></div></div>`).join("");
    lista.hidden = false;
    $$(".ac-op", lista).forEach((op) => op.onmousedown = (e) => { e.preventDefault(); registrar({ cliente_id: opciones[+op.dataset.i].id }); });
  }
  entrada.addEventListener("input", buscar);
  entrada.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && opciones.length) { sel = (sel + 1) % opciones.length; pintarOpciones(); e.preventDefault(); }
    else if (e.key === "ArrowUp" && opciones.length) { sel = (sel - 1 + opciones.length) % opciones.length; pintarOpciones(); e.preventDefault(); }
    else if (e.key === "Enter") { e.preventDefault(); enviar(); }
  });
  entrada.addEventListener("blur", () => setTimeout(() => (lista.hidden = true), 150));
  $("#ciBtn").onclick = enviar;
  function enviar() {
    const t = entrada.value.trim();
    if (!t) return;
    if (!lista.hidden && sel >= 0 && opciones[sel]) registrar({ cliente_id: opciones[sel].id });
    else registrar({ dni: t });
  }
  cargarHoy();
};

// ---------------------------------------------------------------------------
// CLIENTES
// ---------------------------------------------------------------------------
const estadoClientes = { filtro: "activos", q: "" };
VISTAS.clientes = async (cont) => {
  cont.innerHTML = `
    <div class="encabezado"><div><h1>Clientes</h1><p>Buscá, filtrá y abrí la ficha de cada socio.</p></div>
      <div class="acciones"><a class="btn" href="/api/exportar/clientes.csv">${ico("descargar")}Exportar a Excel</a><button class="btn btn-primario" id="btnNuevoCli">${ico("personaMas")}Nuevo cliente</button></div></div>
    <div class="tarjeta">
      <div class="tarjeta-cab" style="flex-wrap:wrap">
        <div class="buscador">${ico("buscar")}<input type="search" id="buscaCli" placeholder="Buscar por nombre, DNI, teléfono o email…" value="${esc(estadoClientes.q)}"></div>
        <div class="chips" id="filtrosCli">
          ${[["activos", "Activos"], ["al_dia", "Al día"], ["por_vencer", "Por vencer"], ["vencida", "Vencidas"], ["bajas", "Bajas"], ["todos", "Todos"]]
            .map(([v, t]) => `<button class="chip ${estadoClientes.filtro === v ? "activo" : ""}" data-v="${v}">${t}</button>`).join("")}
        </div>
      </div>
      <div id="tablaCli"></div>
    </div>`;
  $("#btnNuevoCli").onclick = () => formCliente();
  const cargar = async () => {
    const lista = await api("GET", `/api/clientes?estado=${estadoClientes.filtro}&q=${encodeURIComponent(estadoClientes.q)}`);
    const t = $("#tablaCli");
    if (!t) return;
    if (!lista.length) {
      t.innerHTML = `<div class="vacio"><b>No hay clientes para mostrar</b>${estadoClientes.q ? "Probá con otra búsqueda." : "Cargá tu primer socio con “Nuevo cliente”."}</div>`;
      return;
    }
    t.innerHTML = `<div class="tabla-cont"><table><thead><tr><th>Socio</th><th>DNI</th><th>Teléfono</th><th>Plan</th><th>Vencimiento</th><th>Estado</th><th></th></tr></thead><tbody>
      ${lista.map((c) => `<tr class="clic" data-ficha="${c.id}">
        <td><div style="display:flex;align-items:center;gap:10px">${avatar(c)}<div><div class="nombre-cel">${esc(c.apellido ? c.apellido + ", " + c.nombre : c.nombre)}</div>${c.email ? `<div class="sec">${esc(c.email)}</div>` : ""}</div></div></td>
        <td class="num">${esc(c.dni || "—")}</td><td>${esc(c.telefono || "—")}</td><td>${esc(c.plan_nombre || "—")}</td>
        <td><div class="num">${fmtFecha(c.vencimiento)}</div>${c.vencimiento && c.activo ? `<div class="sec">${textoDias(c.dias_restantes)}</div>` : ""}</td>
        <td>${badge(c.estado)}</td>
        <td class="der"><button class="btn btn-chico" data-cobrar="${c.id}">Cobrar</button></td></tr>`).join("")}
      </tbody></table></div><div class="sec" style="padding:10px 14px;color:var(--texto-3);font-size:13px">${lista.length} cliente${lista.length === 1 ? "" : "s"}</div>`;
    enlazarComunes(t);
  };
  $("#buscaCli").addEventListener("input", debounce((e) => { estadoClientes.q = e.target.value; cargar(); }, 200));
  $$("#filtrosCli .chip").forEach((ch) => ch.onclick = () => {
    estadoClientes.filtro = ch.dataset.v;
    $$("#filtrosCli .chip").forEach((x) => x.classList.toggle("activo", x === ch));
    cargar();
  });
  await cargar();
  if (estadoClientes.q) $("#buscaCli").focus();
};

function opcionesPlanes(seleccionado, incluirVacio = true) {
  return (incluirVacio ? `<option value="">— Sin plan —</option>` : "") +
    PLANES.filter((p) => p.activo || p.id === seleccionado)
      .map((p) => `<option value="${p.id}" ${p.id === seleccionado ? "selected" : ""}>${esc(p.nombre)} — ${dinero(p.precio)}</option>`).join("");
}

function formCliente(cliente = null, inicial = {}) {
  const c = cliente || { fecha_alta: hoyISO(), ...inicial };
  const v = (k) => esc(c[k] || "");
  const m = abrirModal(`${cabModal(cliente ? "Editar cliente" : "Nuevo cliente")}
    <form id="fCli"><div class="modal-cuerpo"><div class="form-grilla">
      <div class="campo"><label class="req">Nombre</label><input type="text" name="nombre" value="${v("nombre")}" autofocus required></div>
      <div class="campo"><label>Apellido</label><input type="text" name="apellido" value="${v("apellido")}"></div>
      <div class="campo"><label>DNI</label><input type="text" name="dni" value="${v("dni")}" inputmode="numeric"><span class="ayuda">Se usa para registrar el ingreso a sala.</span></div>
      <div class="campo"><label>Teléfono / WhatsApp</label><input type="tel" name="telefono" value="${v("telefono")}" placeholder="11 5555-5555"></div>
      <div class="campo"><label>Email</label><input type="email" name="email" value="${v("email")}"></div>
      <div class="campo"><label>Fecha de nacimiento</label><input type="date" name="fecha_nacimiento" value="${v("fecha_nacimiento")}"></div>
      <div class="campo ancho"><label>Dirección</label><input type="text" name="direccion" value="${v("direccion")}"></div>
      <div class="campo"><label>Plan</label><select name="plan_id">${opcionesPlanes(c.plan_id)}</select></div>
      <div class="campo"><label>Fecha de alta</label><input type="date" name="fecha_alta" value="${v("fecha_alta")}"></div>
      <div class="campo"><label>Contacto de emergencia</label><input type="text" name="contacto_emergencia" value="${v("contacto_emergencia")}" placeholder="Nombre y teléfono"></div>
      <div class="campo"><label>Apto médico vence</label><input type="date" name="apto_medico_vence" value="${v("apto_medico_vence")}"></div>
      ${cliente ? `<div class="campo"><label>Vencimiento de la cuota</label><input type="date" name="vencimiento" value="${v("vencimiento")}"><span class="ayuda">Se actualiza solo al cobrar. Cambialo solo para corregir.</span></div>` : ""}
      <div class="campo ancho"><label>Notas</label><textarea name="notas" placeholder="Lesiones, objetivos, observaciones…">${v("notas")}</textarea></div>
    </div></div>
    <div class="modal-pie"><button type="button" class="btn" data-cerrar>Cancelar</button>
      ${cliente ? "" : `<button type="submit" class="btn" data-y-cobrar="1">Guardar y cobrar</button>`}
      <button type="submit" class="btn btn-primario">Guardar</button></div></form>`);
  let yCobrar = false;
  $$("[data-y-cobrar]", m).forEach((b) => b.addEventListener("click", () => (yCobrar = true)));
  $("#fCli", m).addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = leerForm(e.target);
    try {
      const r = cliente ? await api("PUT", `/api/clientes/${cliente.id}`, datos) : await api("POST", "/api/clientes", datos);
      toast(cliente ? "Cambios guardados" : `${nombreCompleto(r)} fue dado de alta`, "ok");
      cerrarModal();
      if (yCobrar) { refrescarFondo(); formCobro(r.id); }
      else if (cliente) { refrescarFondo(); fichaCliente(cliente.id); }
      else refrescar();
    } catch (err) {
      yCobrar = false;
      toast(err.message, "error");
    }
  });
}

async function fichaCliente(id, pestana = "pagos") {
  let c;
  try { c = await api("GET", `/api/clientes/${id}`); } catch (e) { return toast(e.message, "error"); }
  const dato = (t, v) => `<div class="dato"><small>${t}</small><span>${v || "—"}</span></div>`;
  const wa = linkWhatsapp(c.telefono, `Hola ${c.nombre}! Te escribimos de ${CONFIG.nombre_gimnasio}.`);
  const edad = c.fecha_nacimiento ? Math.floor((Date.now() - deISO(c.fecha_nacimiento)) / 31557600000) : null;
  const m = abrirModal(`${cabModal("Ficha del cliente")}
    <div class="modal-cuerpo">
      <div class="ficha-cab">${avatar(c)}<div style="flex:1"><h2>${esc(nombreCompleto(c))}</h2><div style="margin-top:4px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">${badge(c.estado)}
        <span class="sec">${c.vencimiento ? `Cuota hasta el ${fmtFecha(c.vencimiento)} (${textoDias(c.dias_restantes)})` : "Sin pagos registrados"}</span></div></div>
        <button class="btn btn-primario" data-cobrar="${c.id}">${ico("dinero")}Cobrar cuota</button></div>
      <div class="datos">
        ${dato("DNI", esc(c.dni))}${dato("Teléfono", c.telefono ? esc(c.telefono) + (wa ? ` <a href="${wa}" target="_blank" title="WhatsApp">${ico("whatsapp")}</a>` : "") : "")}${dato("Email", esc(c.email))}
        ${dato("Plan", esc(c.plan_nombre))}${dato("Alta", fmtFecha(c.fecha_alta))}${dato("Nacimiento", c.fecha_nacimiento ? fmtFecha(c.fecha_nacimiento) + ` (${edad} años)` : "")}
        ${dato("Dirección", esc(c.direccion))}${dato("Contacto de emergencia", esc(c.contacto_emergencia))}
        ${dato("Apto médico", c.apto_medico_vence ? (c.apto_medico_vence < hoyISO() ? `<span style="color:var(--peligro);font-weight:600">Vencido el ${fmtFecha(c.apto_medico_vence)}</span>` : "Vence el " + fmtFecha(c.apto_medico_vence)) : "")}
        ${c.notas ? `<div class="dato" style="grid-column:1/-1"><small>Notas</small><span style="white-space:pre-wrap">${esc(c.notas)}</span></div>` : ""}
      </div>
      <div class="pestanas"><button data-p="pagos">Pagos (${c.pagos.length})</button><button data-p="asist">Asistencia (${c.asistencias_mes} este mes)</button></div>
      <div id="fichaPest"></div>
    </div>
    <div class="modal-pie"><div class="izq">
        ${c.activo ? `<button class="btn btn-peligro" id="fBaja">Dar de baja</button>` : `<button class="btn" id="fAlta">Reactivar</button>`}
        ${c.pagos.length ? "" : `<button class="btn btn-peligro" id="fBorrar">${ico("borrar")}Eliminar</button>`}
      </div>
      <button class="btn" id="fEditar">${ico("editar")}Editar datos</button><button class="btn" data-cerrar>Cerrar</button></div>`, { ancho: true });
  enlazarComunes(m);

  const pintar = (p) => {
    $$(".pestanas button", m).forEach((b) => b.classList.toggle("activo", b.dataset.p === p));
    const z = $("#fichaPest", m);
    if (p === "pagos") {
      z.innerHTML = c.pagos.length ? `<div class="tabla-cont"><table><thead><tr><th>Fecha</th><th>Plan</th><th>Período</th><th>Medio</th><th class="der">Monto</th><th></th></tr></thead><tbody>
        ${c.pagos.map((pg, i) => `<tr><td class="num">${fmtFecha(pg.fecha)}</td><td>${esc(pg.plan_nombre || "—")}${pg.periodos > 1 ? ` ×${pg.periodos}` : ""}</td>
          <td class="num">${fmtFecha(pg.desde)} al ${fmtFecha(pg.hasta)}</td><td>${esc(pg.medio)}</td><td class="der num monto-ing">${dinero(pg.monto)}</td>
          <td class="der" style="white-space:nowrap"><button class="btn btn-chico btn-texto" data-recibo="${i}" title="Imprimir recibo">${ico("imprimir")}</button>
          <button class="btn btn-chico btn-texto" data-anular="${pg.id}" title="Anular pago">${ico("borrar")}</button></td></tr>`).join("")}
        </tbody></table></div><p class="sec" style="text-align:right;margin:10px 4px 0">Total pagado: <b>${dinero(c.total_pagado)}</b></p>`
        : `<div class="vacio"><b>Sin pagos</b>Todavía no se registró ningún pago para este cliente.</div>`;
      $$("[data-recibo]", z).forEach((b) => b.onclick = () => imprimirRecibo(c, c.pagos[+b.dataset.recibo]));
      $$("[data-anular]", z).forEach((b) => b.onclick = async () => {
        if (!(await confirmar("Anular pago", "Se eliminará el pago y su ingreso en la contabilidad. Si es el último pago, el vencimiento vuelve a la fecha anterior. ¿Continuar?", "Anular pago"))) return fichaCliente(id);
        try { await api("DELETE", `/api/pagos/${b.dataset.anular}`); toast("Pago anulado", "ok"); } catch (e) { toast(e.message, "error"); }
        fichaCliente(id);
      });
    } else {
      z.innerHTML = c.asistencias.length ? `<ul class="lista-mini">${c.asistencias.map((a) => `<li><span>${fmtFechaLarga(a.fecha)}</span><span class="sec num">${esc(a.hora)}</span></li>`).join("")}</ul>`
        : `<div class="vacio"><b>Sin asistencias</b>Todavía no registró ingresos a la sala.</div>`;
    }
  };
  $$(".pestanas button", m).forEach((b) => b.onclick = () => pintar(b.dataset.p));
  pintar(pestana);

  $("#fEditar", m).onclick = () => formCliente(c);
  const cambiarActivo = async (activo) => {
    try { await api("PUT", `/api/clientes/${id}`, { activo }); toast(activo ? "Cliente reactivado" : "Cliente dado de baja", "ok"); } catch (e) { toast(e.message, "error"); }
    fichaCliente(id);
    refrescarFondo();
  };
  if ($("#fBaja", m)) $("#fBaja", m).onclick = async () => {
    if (await confirmar("Dar de baja", `${esc(nombreCompleto(c))} dejará de aparecer entre los socios activos. Sus datos y pagos se conservan y podés reactivarlo cuando quieras.`, "Dar de baja")) cambiarActivo(false);
    else fichaCliente(id);
  };
  if ($("#fAlta", m)) $("#fAlta", m).onclick = () => cambiarActivo(true);
  if ($("#fBorrar", m)) $("#fBorrar", m).onclick = async () => {
    if (!(await confirmar("Eliminar cliente", `Se eliminará definitivamente a <b>${esc(nombreCompleto(c))}</b> y su historial de asistencia. Esta acción no se puede deshacer.`, "Eliminar"))) return fichaCliente(id);
    try { await api("DELETE", `/api/clientes/${id}`); toast("Cliente eliminado", "ok"); refrescar(); } catch (e) { toast(e.message, "error"); }
  };
}
// Refresca la vista de fondo sin cerrar el modal
function refrescarFondo() {
  const vista = (location.hash || "#inicio").slice(1) || "inicio";
  const cont = $("#contenido");
  (VISTAS[vista] || VISTAS.inicio)(cont).catch(() => {});
}

// ---------------------------------------------------------------------------
// COBRAR CUOTA
// ---------------------------------------------------------------------------
async function formCobro(clienteId = null) {
  let cliente = null;
  if (clienteId) {
    try { cliente = await api("GET", `/api/clientes/${clienteId}`); } catch (e) { return toast(e.message, "error"); }
  }
  const medios = CONFIG.medios_pago.map((x) => `<option>${esc(x)}</option>`).join("");
  const m = abrirModal(`${cabModal("Cobrar cuota")}
    <form id="fCobro"><div class="modal-cuerpo">
      <div class="campo"><label class="req">Cliente</label><div id="zonaCliente"></div></div>
      <div class="form-grilla" style="margin-top:14px">
        <div class="campo"><label class="req">Plan</label><select name="plan_id" id="cbPlan" required>${opcionesPlanes(cliente && cliente.plan_id, false)}</select></div>
        <div class="campo"><label>Cantidad de períodos</label><input type="number" name="periodos" id="cbPer" min="1" max="24" value="1"></div>
        <div class="campo"><label class="req">Monto cobrado</label><input type="number" name="monto" id="cbMonto" min="0" step="0.01" required><span class="ayuda">Se completa con el precio del plan. Podés modificarlo (descuentos, recargos).</span></div>
        <div class="campo"><label>Medio de pago</label><select name="medio">${medios}</select></div>
        <div class="campo"><label>Fecha de pago</label><input type="date" name="fecha" id="cbFecha" value="${hoyISO()}"></div>
        <div class="campo"><label>Notas</label><input type="text" name="notas" placeholder="Opcional"></div>
      </div>
      <div class="resumen-cobro" id="cbResumen"></div>
    </div>
    <div class="modal-pie"><button type="button" class="btn" data-cerrar>Cancelar</button><button type="submit" class="btn btn-ok" id="cbOk">${ico("check")}Confirmar cobro</button></div></form>`);

  const zona = $("#zonaCliente", m);
  const pintarCliente = () => {
    if (cliente) {
      zona.innerHTML = `<div class="cliente-elegido">${avatar(cliente)}<div class="info"><b>${esc(nombreCompleto(cliente))}</b>
        <small>${cliente.dni ? "DNI " + esc(cliente.dni) + " · " : ""}${cliente.vencimiento ? "Vence " + fmtFecha(cliente.vencimiento) : "Sin pagos previos"}</small></div>${badge(cliente.estado)}
        <button type="button" class="btn btn-chico btn-texto" id="cbCambiar">Cambiar</button></div>`;
      $("#cbCambiar", m).onclick = () => { cliente = null; pintarCliente(); };
      if (cliente.plan_id && PLANES.some((p) => p.id === cliente.plan_id)) $("#cbPlan", m).value = cliente.plan_id;
      ponerPrecio();
    } else {
      zona.innerHTML = `<div class="ac"><div class="buscador">${ico("buscar")}<input type="text" id="cbBusca" placeholder="Buscar por nombre o DNI…" autocomplete="off"></div><div class="ac-lista" id="cbLista" hidden></div></div>`;
      const inp = $("#cbBusca", m), lista = $("#cbLista", m);
      let ops = [], sel = 0;
      const pintarOps = () => {
        if (!ops.length) { lista.innerHTML = `<div class="ac-op"><small>Sin resultados</small></div>`; lista.hidden = !inp.value.trim(); return; }
        lista.innerHTML = ops.map((c, i) => `<div class="ac-op ${i === sel ? "sel" : ""}" data-i="${i}">${avatar(c)}<div style="flex:1"><b>${esc(nombreCompleto(c))}</b><small>DNI ${esc(c.dni || "—")} · ${c.plan_nombre ? esc(c.plan_nombre) : "sin plan"}</small></div>${badge(c.estado)}</div>`).join("");
        lista.hidden = false;
        $$(".ac-op[data-i]", lista).forEach((o) => o.onmousedown = (e) => { e.preventDefault(); elegir(ops[+o.dataset.i]); });
      };
      const elegir = async (c) => { cliente = await api("GET", `/api/clientes/${c.id}`); pintarCliente(); actualizar(); };
      inp.addEventListener("input", debounce(async () => {
        const t = inp.value.trim();
        if (!t) { lista.hidden = true; return; }
        ops = (await api("GET", `/api/clientes?estado=todos&q=${encodeURIComponent(t)}`)).slice(0, 8);
        sel = 0;
        pintarOps();
      }, 180));
      inp.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" && ops.length) { sel = (sel + 1) % ops.length; pintarOps(); e.preventDefault(); }
        else if (e.key === "ArrowUp" && ops.length) { sel = (sel - 1 + ops.length) % ops.length; pintarOps(); e.preventDefault(); }
        else if (e.key === "Enter") { e.preventDefault(); if (ops[sel]) elegir(ops[sel]); }
      });
      inp.addEventListener("blur", () => setTimeout(() => (lista.hidden = true), 150));
      setTimeout(() => inp.focus(), 40);
    }
    actualizar();
  };

  const plan = () => PLANES.find((p) => p.id === +$("#cbPlan", m).value);
  function ponerPrecio() {
    const p = plan();
    const per = Math.max(1, +$("#cbPer", m).value || 1);
    if (p) $("#cbMonto", m).value = Math.round(p.precio * per * 100) / 100;
    actualizar();
  }
  function actualizar() {
    const p = plan();
    const res = $("#cbResumen", m);
    if (!p) { res.innerHTML = `<span>No hay planes activos. Creá uno en “Planes y precios”.</span>`; return; }
    const per = Math.max(1, +$("#cbPer", m).value || 1);
    const fecha = $("#cbFecha", m).value || hoyISO();
    let desde = fecha;
    if (cliente && cliente.vencimiento && cliente.vencimiento >= fecha) desde = sumarDias(cliente.vencimiento, 1);
    const hasta = sumarDias(desde, p.duracion_dias * per - 1);
    const monto = +$("#cbMonto", m).value || 0;
    res.innerHTML = `<span>Período que cubre</span><b class="num">${fmtFecha(desde)} al ${fmtFecha(hasta)}</b>
      <span>Nuevo vencimiento</span><b class="num">${fmtFecha(hasta)}</b>
      <span style="align-self:center">Total a cobrar</span><span class="total num">${dinero(monto)}</span>`;
    $("#cbOk", m).disabled = !cliente;
  }
  $("#cbPlan", m).addEventListener("change", ponerPrecio);
  $("#cbPer", m).addEventListener("input", ponerPrecio);
  $("#cbMonto", m).addEventListener("input", actualizar);
  $("#cbFecha", m).addEventListener("change", actualizar);
  pintarCliente();
  ponerPrecio();

  $("#fCobro", m).addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!cliente) return toast("Elegí el cliente que paga", "error");
    const datos = leerForm(e.target);
    datos.cliente_id = cliente.id;
    try {
      const r = await api("POST", "/api/pagos", datos);
      const p = plan();
      const pago = { id: r.pago_id, fecha: datos.fecha, monto: +datos.monto, medio: datos.medio, desde: r.desde, hasta: r.hasta, plan_nombre: p ? p.nombre : "", periodos: +datos.periodos, notas: datos.notas };
      const cli = cliente;
      cerrarModal();
      cobroExitoso(cli, pago, r.vencimiento);
      refrescarFondo();
    } catch (err) { toast(err.message, "error"); }
  });
}

function cobroExitoso(c, pago, venc) {
  const wa = linkWhatsapp(c.telefono, `Hola ${c.nombre}! Registramos tu pago de ${dinero(pago.monto)} en ${CONFIG.nombre_gimnasio} (${pago.plan_nombre}). Tu cuota queda cubierta hasta el ${fmtFecha(venc)}. ¡Gracias!`);
  const m = abrirModal(`${cabModal("Pago registrado")}
    <div class="modal-cuerpo" style="text-align:center;padding:28px 22px">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--ok-suave);color:var(--ok);display:grid;place-items:center;margin:0 auto 12px">${ico("check")}</div>
      <h2 style="margin:0 0 6px">${dinero(pago.monto)} cobrados</h2>
      <p style="margin:0;color:var(--texto-2)">${esc(nombreCompleto(c))} tiene la cuota al día hasta el <b>${fmtFecha(venc)}</b>.<br>El ingreso ya se registró en la contabilidad.</p>
    </div>
    <div class="modal-pie"><div class="izq"><button class="btn" id="okRecibo">${ico("imprimir")}Imprimir recibo</button>
      ${wa ? `<a class="btn" href="${wa}" target="_blank">${ico("whatsapp")}Enviar por WhatsApp</a>` : ""}</div>
      <button class="btn btn-primario" data-cerrar autofocus>Listo</button></div>`);
  $("#okRecibo", m).onclick = () => imprimirRecibo(c, pago);
}

function imprimirRecibo(c, pago) {
  const w = window.open("", "_blank", "width=520,height=680");
  if (!w) return toast("El navegador bloqueó la ventana del recibo. Permití ventanas emergentes.", "error");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Recibo ${pago.id || ""}</title>
    <style>body{font-family:"Segoe UI",Ubuntu,system-ui,sans-serif;color:#1C1D21;margin:0;padding:32px}
    .r{max-width:420px;margin:auto;border:1px solid #ddd;border-radius:10px;padding:26px}
    h1{font-size:20px;margin:0}.s{color:#777;font-size:13px}table{width:100%;border-collapse:collapse;margin:18px 0}
    td{padding:7px 0;border-bottom:1px solid #eee;font-size:14px}td:last-child{text-align:right;font-weight:600}
    .t{font-size:26px;font-weight:700;text-align:right}.f{margin-top:30px;font-size:12px;color:#888;text-align:center}
    @media print{body{padding:0}.r{border:none}}</style></head><body><div class="r">
    <h1>${esc(CONFIG.nombre_gimnasio)}</h1><div class="s">Recibo de pago ${pago.id ? "N.º " + String(pago.id).padStart(6, "0") : ""} · ${fmtFecha(pago.fecha)}</div>
    <table><tr><td>Recibimos de</td><td>${esc(nombreCompleto(c))}</td></tr>${c.dni ? `<tr><td>DNI</td><td>${esc(c.dni)}</td></tr>` : ""}
    <tr><td>Concepto</td><td>${esc(pago.plan_nombre || "Cuota")}${pago.periodos > 1 ? " ×" + pago.periodos : ""}</td></tr>
    <tr><td>Período</td><td>${fmtFecha(pago.desde)} al ${fmtFecha(pago.hasta)}</td></tr>
    <tr><td>Medio de pago</td><td>${esc(pago.medio)}</td></tr>${pago.notas ? `<tr><td>Notas</td><td>${esc(pago.notas)}</td></tr>` : ""}</table>
    <div class="t">${dinero(pago.monto)}</div><div class="f">Documento no válido como factura.<br>¡Gracias por entrenar con nosotros!</div></div>
    <script>window.onload=function(){window.print()}<\/script></body></html>`);
  w.document.close();
}

// ---------------------------------------------------------------------------
// CONTABILIDAD
// ---------------------------------------------------------------------------
const estadoConta = { periodo: "mes", desde: "", hasta: "", tipo: "", categoria: "", pestana: "movs" };
function rangoPeriodo(p) {
  const h = new Date();
  const a = h.getFullYear(), mm = h.getMonth();
  if (p === "mes") return [isoDe(new Date(a, mm, 1)), isoDe(new Date(a, mm + 1, 0))];
  if (p === "anterior") return [isoDe(new Date(a, mm - 1, 1)), isoDe(new Date(a, mm, 0))];
  if (p === "anio") return [`${a}-01-01`, `${a}-12-31`];
  if (p === "hoy") return [hoyISO(), hoyISO()];
  return [estadoConta.desde || isoDe(new Date(a, mm, 1)), estadoConta.hasta || hoyISO()];
}

VISTAS.contabilidad = async (cont) => {
  const [desde, hasta] = rangoPeriodo(estadoConta.periodo);
  estadoConta.desde = desde; estadoConta.hasta = hasta;
  const qs = new URLSearchParams({ desde, hasta, tipo: estadoConta.tipo, categoria: estadoConta.categoria }).toString();
  const d = await api("GET", `/api/movimientos?${qs}`);
  const cats = [...new Set([...CONFIG.categorias_ingreso, ...CONFIG.categorias_egreso, ...d.por_categoria.map((x) => x.categoria)])];
  cont.innerHTML = `
    <div class="encabezado"><div><h1>Contabilidad</h1><p>Ingresos y gastos del gimnasio. Los cobros de cuotas se cargan solos.</p></div>
      <div class="acciones"><a class="btn" href="/api/exportar/movimientos.csv?${qs}">${ico("descargar")}Exportar a Excel</a>
      <button class="btn" id="btnIng">${ico("ingreso")}Otro ingreso</button><button class="btn btn-primario" id="btnEgr">${ico("gasto")}Registrar gasto</button></div></div>
    <div class="tarjeta" style="margin-bottom:16px"><div class="tarjeta-cuerpo" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
      <div class="chips" id="periodos">${[["hoy", "Hoy"], ["mes", "Este mes"], ["anterior", "Mes anterior"], ["anio", "Este año"], ["custom", "Elegir fechas"]]
        .map(([v, t]) => `<button class="chip ${estadoConta.periodo === v ? "activo" : ""}" data-v="${v}">${t}</button>`).join("")}</div>
      <div style="display:flex;gap:8px;align-items:center" id="rango">${estadoConta.periodo === "custom" ? `<input type="date" id="cDesde" value="${desde}" style="width:auto"> a <input type="date" id="cHasta" value="${hasta}" style="width:auto">` : `<span class="sec">${fmtFecha(desde)} al ${fmtFecha(hasta)}</span>`}</div>
      <div style="display:flex;gap:8px;margin-left:auto">
        <select id="fTipo" style="width:auto"><option value="">Ingresos y gastos</option><option value="ingreso" ${estadoConta.tipo === "ingreso" ? "selected" : ""}>Solo ingresos</option><option value="egreso" ${estadoConta.tipo === "egreso" ? "selected" : ""}>Solo gastos</option></select>
        <select id="fCat" style="width:auto"><option value="">Todas las categorías</option>${cats.map((c) => `<option ${estadoConta.categoria === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
      </div></div></div>
    <div class="grilla g-3">
      <div class="tarjeta kpi"><div class="kpi-tit">${ico("ingreso")}Ingresos</div><div class="kpi-valor" style="color:var(--ok)">${dinero(d.ingresos)}</div></div>
      <div class="tarjeta kpi"><div class="kpi-tit">${ico("gasto")}Gastos</div><div class="kpi-valor" style="color:var(--peligro)">${dinero(d.egresos)}</div></div>
      <div class="tarjeta kpi ${d.resultado >= 0 ? "verde" : "rojo"}"><div class="kpi-tit">${ico("tendencia")}Resultado (ganancia / pérdida)</div><div class="kpi-valor">${dinero(d.resultado)}</div></div>
    </div>
    <div class="tarjeta mt">
      <div class="pestanas" style="padding:0 12px;margin:0"><button data-p="movs">Movimientos (${d.movimientos.length})</button><button data-p="cats">Por categoría</button><button data-p="medios">Por medio de pago</button><button data-p="evol">Evolución 12 meses</button></div>
      <div id="contaPest"></div>
    </div>`;

  $("#btnIng").onclick = () => formMovimiento("ingreso");
  $("#btnEgr").onclick = () => formMovimiento("egreso");
  $$("#periodos .chip").forEach((ch) => ch.onclick = () => { estadoConta.periodo = ch.dataset.v; refrescar(); });
  if ($("#cDesde")) {
    const cambio = () => { estadoConta.desde = $("#cDesde").value; estadoConta.hasta = $("#cHasta").value; if (estadoConta.desde && estadoConta.hasta) refrescar(); };
    $("#cDesde").onchange = cambio; $("#cHasta").onchange = cambio;
  }
  $("#fTipo").onchange = (e) => { estadoConta.tipo = e.target.value; refrescar(); };
  $("#fCat").onchange = (e) => { estadoConta.categoria = e.target.value; refrescar(); };

  const pintar = (p) => {
    estadoConta.pestana = p;
    $$(".pestanas button", cont).forEach((b) => b.classList.toggle("activo", b.dataset.p === p));
    const z = $("#contaPest");
    if (p === "movs") {
      z.innerHTML = d.movimientos.length ? `<div class="tabla-cont"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Medio</th><th class="der">Monto</th><th></th></tr></thead><tbody>
        ${d.movimientos.map((mv, i) => `<tr><td class="num">${fmtFecha(mv.fecha)}</td><td>${esc(mv.categoria)}</td><td>${esc(mv.descripcion || "—")}</td><td>${esc(mv.medio)}</td>
          <td class="der num ${mv.tipo === "ingreso" ? "monto-ing" : "monto-egr"}">${mv.tipo === "ingreso" ? "+" : "−"} ${dinero(mv.monto)}</td>
          <td class="der" style="white-space:nowrap">${mv.pago_id ? `<span class="sec" title="Generado por un cobro de cuota">automático</span>` : `<button class="btn btn-chico btn-texto" data-ed="${i}" title="Editar">${ico("editar")}</button><button class="btn btn-chico btn-texto" data-del="${mv.id}" title="Eliminar">${ico("borrar")}</button>`}</td></tr>`).join("")}
        </tbody></table></div>` : `<div class="vacio"><b>No hay movimientos en este período</b>Registrá un gasto o cobrá una cuota para empezar.</div>`;
      $$("[data-ed]", z).forEach((b) => b.onclick = () => formMovimiento(d.movimientos[+b.dataset.ed].tipo, d.movimientos[+b.dataset.ed]));
      $$("[data-del]", z).forEach((b) => b.onclick = async () => {
        if (!(await confirmar("Eliminar movimiento", "¿Seguro que querés eliminar este movimiento?", "Eliminar"))) return;
        try { await api("DELETE", `/api/movimientos/${b.dataset.del}`); toast("Movimiento eliminado", "ok"); refrescar(); } catch (e) { toast(e.message, "error"); }
      });
    } else if (p === "cats") {
      const bloque = (tipo, titulo, color) => {
        const items = d.por_categoria.filter((x) => x.tipo === tipo);
        const tot = items.reduce((s, x) => s + x.monto, 0) || 1;
        return `<h3 style="margin:4px 0 8px;font-size:15px">${titulo}</h3>` + (items.length ? items.map((x) => `<div class="barra-cat"><span>${esc(x.categoria)}</span><div class="pista"><div class="relleno" style="width:${(x.monto / tot) * 100}%;background:${color}"></div></div><b class="num">${dinero(x.monto)} <span class="sec">(${Math.round((x.monto / tot) * 100)}%)</span></b></div>`).join("") : `<p class="sec">Sin datos.</p>`);
      };
      z.innerHTML = `<div class="tarjeta-cuerpo grilla g-2">${`<div>${bloque("ingreso", "Ingresos", "#1F8A5B")}</div><div>${bloque("egreso", "Gastos", "#E8572A")}</div>`}</div>`;
    } else if (p === "medios") {
      z.innerHTML = `<div class="tarjeta-cuerpo"><p class="sec" style="margin-top:0">Saldo neto (ingresos − gastos) por medio de pago en el período. Útil para hacer el arqueo de caja.</p>
        ${d.por_medio.length ? `<table><tbody>${d.por_medio.map((x) => `<tr><td>${esc(x.medio)}</td><td class="der num ${x.monto >= 0 ? "monto-ing" : "monto-egr"}">${dinero(x.monto)}</td></tr>`).join("")}</tbody></table>` : `<p class="sec">Sin datos.</p>`}</div>`;
    } else {
      z.innerHTML = `<div class="tarjeta-cuerpo">${graficoBarras(d.serie)}
        <div class="tabla-cont mt"><table><thead><tr><th>Mes</th><th class="der">Ingresos</th><th class="der">Gastos</th><th class="der">Resultado</th></tr></thead><tbody>
        ${d.serie.slice().reverse().map((s) => `<tr><td style="text-transform:capitalize">${MESES[s.mes - 1]} ${s.anio}</td><td class="der num">${dinero(s.ingresos)}</td><td class="der num">${dinero(s.egresos)}</td><td class="der num ${s.ingresos - s.egresos >= 0 ? "monto-ing" : "monto-egr"}">${dinero(s.ingresos - s.egresos)}</td></tr>`).join("")}
        </tbody></table></div></div>`;
    }
  };
  $$(".pestanas button", cont).forEach((b) => b.onclick = () => pintar(b.dataset.p));
  pintar(estadoConta.pestana);
};

function formMovimiento(tipo = "egreso", mov = null) {
  let t = tipo;
  const opcionesCat = (tp, sel) => (tp === "ingreso" ? CONFIG.categorias_ingreso : CONFIG.categorias_egreso).filter((c) => tp === "egreso" || c !== "Cuotas" || sel === "Cuotas")
    .concat(sel && !(tp === "ingreso" ? CONFIG.categorias_ingreso : CONFIG.categorias_egreso).includes(sel) ? [sel] : [])
    .map((c) => `<option ${c === sel ? "selected" : ""}>${esc(c)}</option>`).join("");
  const m = abrirModal(`${cabModal(mov ? "Editar movimiento" : (tipo === "egreso" ? "Registrar gasto" : "Registrar ingreso"))}
    <form id="fMov"><div class="modal-cuerpo">
      <div class="segmento tipo" style="margin-bottom:16px"><button type="button" data-v="ingreso">Ingreso</button><button type="button" data-v="egreso">Gasto</button></div>
      <div class="form-grilla">
        <div class="campo"><label class="req">Monto</label><input type="number" name="monto" min="0" step="0.01" value="${mov ? mov.monto : ""}" required autofocus></div>
        <div class="campo"><label>Fecha</label><input type="date" name="fecha" value="${mov ? mov.fecha : hoyISO()}"></div>
        <div class="campo"><label class="req">Categoría</label><select name="categoria" id="mvCat"></select></div>
        <div class="campo"><label>Medio de pago</label><select name="medio">${CONFIG.medios_pago.map((x) => `<option ${mov && mov.medio === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></div>
        <div class="campo ancho"><label>Descripción</label><input type="text" name="descripcion" value="${mov ? esc(mov.descripcion) : ""}" placeholder="Ej.: Alquiler de noviembre, venta de agua, etc."></div>
      </div></div>
    <div class="modal-pie"><button type="button" class="btn" data-cerrar>Cancelar</button><button type="submit" class="btn btn-primario">Guardar</button></div></form>`);
  const setTipo = (nt) => {
    t = nt;
    $$(".segmento button", m).forEach((b) => b.classList.toggle("activo", b.dataset.v === t));
    $("#mvCat", m).innerHTML = opcionesCat(t, mov && mov.tipo === t ? mov.categoria : "");
  };
  $$(".segmento button", m).forEach((b) => b.onclick = () => setTipo(b.dataset.v));
  setTipo(t);
  $("#fMov", m).addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = { ...leerForm(e.target), tipo: t };
    try {
      if (mov) await api("PUT", `/api/movimientos/${mov.id}`, datos);
      else await api("POST", "/api/movimientos", datos);
      toast(t === "egreso" ? "Gasto registrado" : "Ingreso registrado", "ok");
      cerrarModal();
      refrescar();
    } catch (err) { toast(err.message, "error"); }
  });
}

// ---------------------------------------------------------------------------
// PLANES
// ---------------------------------------------------------------------------
VISTAS.planes = async (cont) => {
  PLANES = await api("GET", "/api/planes");
  const dur = (d) => d === 1 ? "1 día" : d % 30 === 0 ? (d / 30 === 1 ? "1 mes" : `${d / 30} meses`) : d % 7 === 0 ? `${d / 7} semana${d / 7 > 1 ? "s" : ""}` : `${d} días`;
  cont.innerHTML = `
    <div class="encabezado"><div><h1>Planes y precios</h1><p>Definí las membresías que ofrecés. Al cobrar, el vencimiento se calcula con la duración del plan.</p></div>
      <div class="acciones"><button class="btn btn-primario" id="btnPlan">${ico("mas")}Nuevo plan</button></div></div>
    ${PLANES.length ? `<div class="planes-grilla">${PLANES.map((p, i) => `<div class="tarjeta plan ${p.activo ? "" : "inactivo"}">
      <h3>${esc(p.nombre)} ${p.activo ? "" : `<span class="badge b-baja">Inactivo</span>`}</h3>
      <div class="precio num">${dinero(p.precio)}</div>
      <div class="meta">Duración: ${dur(p.duracion_dias)} · ${p.clientes} socio${p.clientes === 1 ? "" : "s"} activo${p.clientes === 1 ? "" : "s"}</div>
      ${p.descripcion ? `<div style="font-size:14px;color:var(--texto-2)">${esc(p.descripcion)}</div>` : ""}
      <div class="acciones"><button class="btn btn-chico" data-ed="${i}">${ico("editar")}Editar</button><button class="btn btn-chico btn-peligro" data-del="${p.id}">${ico("borrar")}${p.activo ? "Eliminar" : "Borrar"}</button></div></div>`).join("")}</div>`
      : `<div class="tarjeta vacio"><b>No hay planes</b>Creá tu primer plan para empezar a cobrar cuotas.</div>`}
    <div class="aviso-caja mt">Cambiar el precio de un plan no modifica los pagos ya registrados: solo se aplica a los cobros nuevos.</div>`;
  $("#btnPlan").onclick = () => formPlan();
  $$("[data-ed]", cont).forEach((b) => b.onclick = () => formPlan(PLANES[+b.dataset.ed]));
  $$("[data-del]", cont).forEach((b) => b.onclick = async () => {
    if (!(await confirmar("Eliminar plan", "Si el plan está en uso se desactivará (no se ofrecerá en cobros nuevos) en lugar de borrarse. ¿Continuar?", "Eliminar"))) return;
    try { const r = await api("DELETE", `/api/planes/${b.dataset.del}`); toast(r.mensaje, "ok"); refrescar(); } catch (e) { toast(e.message, "error"); }
  });
};

function formPlan(p = null) {
  const m = abrirModal(`${cabModal(p ? "Editar plan" : "Nuevo plan")}
    <form id="fPlan"><div class="modal-cuerpo"><div class="form-grilla">
      <div class="campo ancho"><label class="req">Nombre</label><input type="text" name="nombre" value="${p ? esc(p.nombre) : ""}" placeholder="Ej.: Pase libre mensual" required autofocus></div>
      <div class="campo"><label class="req">Precio</label><input type="number" name="precio" min="0" step="0.01" value="${p ? p.precio : ""}" required></div>
      <div class="campo"><label class="req">Duración</label>
        <div style="display:flex;gap:6px"><input type="number" name="duracion_dias" id="plDias" min="1" value="${p ? p.duracion_dias : 30}" required style="flex:1"><span style="align-self:center" class="sec">días</span></div>
        <div class="chips" style="margin-top:4px">${[[1, "1 día"], [7, "Semana"], [30, "Mes"], [90, "Trimestre"], [180, "Semestre"], [365, "Año"]].map(([d, t]) => `<button type="button" class="chip" data-d="${d}" style="padding:3px 9px;font-size:12px">${t}</button>`).join("")}</div></div>
      <div class="campo ancho"><label>Descripción</label><input type="text" name="descripcion" value="${p ? esc(p.descripcion) : ""}" placeholder="Qué incluye"></div>
      ${p ? `<div class="campo ancho"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" name="activo" ${p.activo ? "checked" : ""}> Plan activo (se ofrece al cobrar)</label></div>` : ""}
    </div></div>
    <div class="modal-pie"><button type="button" class="btn" data-cerrar>Cancelar</button><button type="submit" class="btn btn-primario">Guardar</button></div></form>`);
  $$("[data-d]", m).forEach((b) => b.onclick = () => ($("#plDias", m).value = b.dataset.d));
  $("#fPlan", m).addEventListener("submit", async (e) => {
    e.preventDefault();
    const datos = leerForm(e.target);
    if (!p) datos.activo = true;
    try {
      if (p) await api("PUT", `/api/planes/${p.id}`, datos);
      else await api("POST", "/api/planes", datos);
      PLANES = await api("GET", "/api/planes");
      toast("Plan guardado", "ok");
      cerrarModal();
      refrescar();
    } catch (err) { toast(err.message, "error"); }
  });
}

// ---------------------------------------------------------------------------
// AJUSTES
// ---------------------------------------------------------------------------
VISTAS.ajustes = async (cont) => {
  CONFIG = await api("GET", "/api/config");
  cont.innerHTML = `
    <div class="encabezado"><div><h1>Ajustes</h1><p>Datos del gimnasio, listas y copias de seguridad.</p></div></div>
    <form id="fAjustes"><div class="grilla g-2">
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Gimnasio</h2></div><div class="tarjeta-cuerpo" style="display:grid;gap:14px">
        <div class="campo"><label>Nombre del gimnasio</label><input type="text" name="nombre_gimnasio" value="${esc(CONFIG.nombre_gimnasio)}"><span class="ayuda">Aparece en el menú, en los recibos y en los mensajes de WhatsApp.</span></div>
        <div class="campo"><label>Símbolo de moneda</label><input type="text" name="moneda" value="${esc(CONFIG.moneda)}" style="max-width:120px"></div>
        <div class="campo"><label>Avisar cuotas por vencer con</label><div style="display:flex;gap:8px;align-items:center"><input type="number" name="dias_aviso" min="0" max="60" value="${CONFIG.dias_aviso}" style="max-width:100px"><span class="sec">días de anticipación</span></div></div>
      </div></div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Copias de seguridad</h2></div><div class="tarjeta-cuerpo" style="display:grid;gap:12px">
        <div class="aviso-caja">Todos los datos se guardan en tu computadora, en:<br><code style="word-break:break-all">${esc(CONFIG.ruta_datos)}</code><br>Cada día que abrís la aplicación se guarda una copia automática en la carpeta <b>copias</b> (se conservan las últimas 30).</div>
        <div class="acciones"><a class="btn" href="/api/copia-seguridad">${ico("descargar")}Descargar copia ahora</a><a class="btn" href="/api/exportar/clientes.csv">${ico("descargar")}Clientes (Excel)</a></div>
        <span class="ayuda">Guardá copias en un pendrive o en la nube de vez en cuando. Para restaurar una copia, cerrá la aplicación y reemplazá el archivo <b>gimnasio.db</b> por la copia (renombrándola).</span>
      </div></div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Categorías de ingresos</h2></div><div class="tarjeta-cuerpo"><textarea name="categorias_ingreso" rows="6">${esc(CONFIG.categorias_ingreso.join("\n"))}</textarea><span class="ayuda">Una por línea.</span></div></div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Categorías de gastos</h2></div><div class="tarjeta-cuerpo"><textarea name="categorias_egreso" rows="6">${esc(CONFIG.categorias_egreso.join("\n"))}</textarea><span class="ayuda">Una por línea.</span></div></div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Medios de pago</h2></div><div class="tarjeta-cuerpo"><textarea name="medios_pago" rows="5">${esc(CONFIG.medios_pago.join("\n"))}</textarea><span class="ayuda">Una por línea. “Efectivo” se usa para calcular la caja.</span></div></div>
      <div class="tarjeta"><div class="tarjeta-cab"><h2>Acerca de</h2></div><div class="tarjeta-cuerpo" style="font-size:14px;color:var(--texto-2)">GymAdmin versión ${esc(CONFIG.version)}.<br>Para usarlo desde otra PC o tablet del gimnasio, iniciá la aplicación con la opción <code>--red</code> (ver archivo LEEME).</div></div>
    </div>
    <div style="position:sticky;bottom:0;padding:14px 0;background:linear-gradient(transparent,var(--fondo) 30%);display:flex;justify-content:flex-end"><button class="btn btn-primario" type="submit">Guardar ajustes</button></div></form>`;
  $("#fAjustes").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = leerForm(e.target);
    ["categorias_ingreso", "categorias_egreso", "medios_pago"].forEach((k) => (d[k] = d[k].split("\n").map((x) => x.trim()).filter(Boolean)));
    try {
      CONFIG = await api("PUT", "/api/config", d);
      $("#nombreGimnasio").textContent = CONFIG.nombre_gimnasio;
      document.title = `${CONFIG.nombre_gimnasio} · GymAdmin`;
      toast("Ajustes guardados", "ok");
    } catch (err) { toast(err.message, "error"); }
  });
};

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------
(async function iniciar() {
  $$("[data-i]").forEach((el) => (el.outerHTML = ico(el.dataset.i)));
  $("#btnCobrarMenu").onclick = () => formCobro();
  const f = new Date();
  $("#fechaHoy").textContent = f.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  try {
    await cargarBase();
  } catch (e) {
    $("#contenido").innerHTML = `<div class="tarjeta vacio"><b>No se pudo conectar</b>${esc(e.message)}</div>`;
    return;
  }
  render();
})();
