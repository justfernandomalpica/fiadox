/**
 * app.js — Aplicación principal FiaDOX
 * Abarrotes Virrey
 *
 * Estructura:
 *  - Utilidades (formato, errores, UI helpers)
 *  - Componentes globales (header, modal, toast)
 *  - Vistas (renderLogin, renderClients, renderNewClient,
 *             renderClientDetail, renderSummary, renderNewTransaction,
 *             renderEditClient)
 *  - Init / bootstrap
 */

import { api } from './api.js';
import { Router } from './router.js';

// ════════════════════════════════════════════════════════════════
// UTILIDADES
// ════════════════════════════════════════════════════════════════

/** Formatea un número como moneda mexicana: $1,234.00 */
function formatMXN(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

/** Convierte "2026-04-25 15:15:19" → "25/04/2026" */
function formatDateShort(str) {
  if (!str) return '—';
  const [date] = str.split(' ');
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

/** Traduce tipo de transacción */
function txLabel(type) {
  return type === 'payment' ? 'Pago' : 'Cargo';
}

/**
 * Formatea el error del backend para mostrarlo en pantalla.
 * El error puede ser:
 *  - string simple
 *  - objeto { "Argumento Inválido": ["msg1", "msg2"] }
 */
function formatApiError(err) {
  // err es el Error lanzado por api.js
  if (!err) return 'Error desconocido.';

  // Si el payload original trae un objeto de errores detallados
  if (err.data && err.data.error && typeof err.data.error === 'object') {
    const groups = err.data.error;
    const items = Object.entries(groups)
      .flatMap(([, msgs]) => (Array.isArray(msgs) ? msgs : [msgs]));

    if (items.length === 1) return items[0];

    return `<ul>${items.map(m => `<li>${m}</li>`).join('')}</ul>`;
  }

  return err.message || 'Error desconocido.';
}

// ════════════════════════════════════════════════════════════════
// TEMA (claro / oscuro)
// ════════════════════════════════════════════════════════════════

function getTheme() {
  return localStorage.getItem('fiadox-theme') || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('fiadox-theme', theme);
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  // Actualizar ícono si el botón existe
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.setAttribute('aria-label',
    next === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  );
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = getTheme() === 'dark';
  btn.textContent = isDark ? '☀️' : '🌙';
  btn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

// ════════════════════════════════════════════════════════════════
// ESTRUCTURA HTML BASE
// ════════════════════════════════════════════════════════════════

const $app = document.getElementById('app');

/** Reemplaza el contenido de #app */
function setContent(html) {
  $app.innerHTML = html;
}

/** Renderiza el header autenticado */
function renderHeader() {
  return `
  <header class="app-header" role="banner">
    <div class="header-inner">
      <div class="header-brand">
        <span class="brand-name">FiaDOX</span>
        <span class="brand-store">Abarrotes Virrey</span>
      </div>
      <div class="header-actions">
        <button
          id="theme-toggle"
          class="btn btn-ghost theme-btn"
          type="button"
          aria-label="Cambiar modo de color"
          title="Cambiar modo de color"
        ></button>
        <button
          id="logout-btn"
          class="btn btn-secondary"
          type="button"
          aria-label="Cerrar sesión"
        >Salir</button>
      </div>
    </div>
  </header>`;
}

/** Inyecta el header y enlaza sus eventos */
function mountHeader() {
  updateThemeIcon();
  document.getElementById('theme-toggle')
    ?.addEventListener('click', toggleTheme);
  document.getElementById('logout-btn')
    ?.addEventListener('click', confirmLogout);
}

// ════════════════════════════════════════════════════════════════
// MODAL DE CONFIRMACIÓN
// ════════════════════════════════════════════════════════════════

function showModal({ title, body, confirmLabel = 'Confirmar', confirmClass = 'btn-danger', onConfirm }) {
  const existing = document.getElementById('confirm-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-modal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modal-title');
  overlay.innerHTML = `
    <div class="modal-box">
      <h2 class="modal-title" id="modal-title">${title}</h2>
      <p class="modal-body">${body}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="modal-cancel" type="button">Cancelar</button>
        <button class="btn ${confirmClass}" id="modal-confirm" type="button">${confirmLabel}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  document.getElementById('modal-cancel').addEventListener('click', close);
  document.getElementById('modal-confirm').addEventListener('click', () => {
    close();
    onConfirm();
  });

  // Cerrar con ESC
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  // Focus al botón de cancelar por defecto
  document.getElementById('modal-cancel').focus();
}

// ════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════

function showToast(msg, duration = 4000) {
  const old = document.getElementById('app-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.className = 'toast';
  toast.setAttribute('role', 'alert');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ════════════════════════════════════════════════════════════════
// LOGOUT
// ════════════════════════════════════════════════════════════════

function confirmLogout() {
  showModal({
    title: 'Cerrar sesión',
    body: '¿Seguro que quieres cerrar sesión?',
    confirmLabel: 'Sí, salir',
    confirmClass: 'btn-danger',
    onConfirm: async () => {
      try { await api.logout(); } catch { /* Ignorar error, salir de todas formas */ }
      router.go('#/login');
    },
  });
}

// ════════════════════════════════════════════════════════════════
// VISTA: LOGIN
// ════════════════════════════════════════════════════════════════

function renderLogin(msg = '') {
  setContent(`
  <div class="login-wrap">
    <main class="login-card" id="login-card">
      <div class="login-header">
        <h1 class="login-title">FiaDOX</h1>
        <p class="login-subtitle">Abarrotes Virrey</p>
      </div>

      ${msg ? `<div class="alert alert-warning" role="alert">${msg}</div>` : ''}

      <div id="login-error" class="alert alert-error" role="alert" style="display:none"></div>

      <form id="login-form" novalidate>
        <div class="form-group">
          <label for="email">Correo electrónico<span class="required-mark" aria-hidden="true">*</span></label>
          <input
            type="email"
            id="email"
            name="email"
            autocomplete="email"
            required
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña<span class="required-mark" aria-hidden="true">*</span></label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-block" id="login-btn">
          Iniciar sesión
        </button>
      </form>
    </main>
  </div>`);

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;

    errBox.style.display = 'none';

    if (!email || !pass) {
      errBox.textContent = 'Por favor ingresa tu correo y contraseña.';
      errBox.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Iniciando sesión…';

    try {
      await api.login(email, pass);
      router.go('#/clientes');
    } catch (err) {
      errBox.innerHTML = formatApiError(err);
      errBox.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Iniciar sesión';
    }
  });
}

// ════════════════════════════════════════════════════════════════
// VISTA: LISTA DE CLIENTES
// ════════════════════════════════════════════════════════════════

let clientsState = { page: 1, name: '' };

async function renderClients() {
  setContent(`
  ${renderHeader()}
  <main class="page" id="clients-page">
    <div class="section-header">
      <div>
        <h1 class="section-title">Clientes</h1>
      </div>
      <div class="section-actions">
        <a href="#/resumen" class="btn btn-secondary">
          Resumen global
        </a>
        <a href="#/nuevo-cliente" class="btn btn-primary btn-lg">
          ＋ Nuevo cliente
        </a>
      </div>
    </div>

    <div class="search-bar" role="search">
      <label for="search-input" class="sr-only">Buscar cliente por nombre</label>
      <input
        type="text"
        id="search-input"
        placeholder="Buscar por nombre…"
        autocomplete="off"
        aria-label="Buscar cliente por nombre"
        value="${escapeHtml(clientsState.name)}"
      />
      <button class="btn btn-secondary" id="search-btn" type="button">Buscar</button>
      <button class="btn btn-ghost"     id="clear-btn"  type="button" title="Limpiar búsqueda">✕</button>
    </div>

    <div id="clients-list-wrap">
      <div class="spinner-wrap" aria-live="polite" aria-label="Cargando clientes">
        <div class="spinner" role="status"></div>
        <p>Cargando…</p>
      </div>
    </div>

    <div id="pagination" class="pagination" aria-label="Paginación"></div>
  </main>`);

  mountHeader();
  attachClientSearch();
  await loadClients();
}

function attachClientSearch() {
  document.getElementById('search-btn').addEventListener('click', () => {
    clientsState.name = document.getElementById('search-input').value;
    clientsState.page = 1;
    loadClients();
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    clientsState.name = '';
    clientsState.page = 1;
    loadClients();
  });

  document.getElementById('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clientsState.name = e.target.value;
      clientsState.page = 1;
      loadClients();
    }
  });
}

async function loadClients() {
  const wrap = document.getElementById('clients-list-wrap');
  const pag  = document.getElementById('pagination');
  if (!wrap) return;

  wrap.innerHTML = `<div class="spinner-wrap" aria-live="polite"><div class="spinner" role="status"></div><p>Cargando…</p></div>`;
  if (pag) pag.innerHTML = '';

  try {
    const res = await api.getClients({ page: clientsState.page, perPage: 10, name: clientsState.name });
    const clients = res.data?.clients ?? [];

    if (!clients.length) {
      wrap.innerHTML = emptyState('Aún no hay nada que mostrar.');
      return;
    }

    wrap.innerHTML = `
      <div class="clients-list" role="list" aria-label="Lista de clientes">
        ${clients.map(c => clientRow(c)).join('')}
      </div>`;

    // Eventos de filas
    wrap.querySelectorAll('[data-action="ver"]').forEach(btn => {
      btn.addEventListener('click', () => router.go(`#/clientes/${btn.dataset.id}`));
    });
    wrap.querySelectorAll('[data-action="nueva-tx"]').forEach(btn => {
      btn.addEventListener('click', () => router.go(`#/clientes/${btn.dataset.id}/nueva-transaccion`));
    });

    // Paginación simple
    if (pag) renderPagination(pag, clientsState.page, clients.length, 10, (p) => {
      clientsState.page = p;
      loadClients();
    });

  } catch (err) {
    if (err.status === 401) { handleUnauthorized(); return; }
    // 404 = sin resultados (el backend retorna 404 cuando no hay clientes)
    if (err.status === 404) {
      wrap.innerHTML = emptyState('Aún no hay nada que mostrar.');
      return;
    }
    wrap.innerHTML = `<div class="alert alert-error" role="alert">${formatApiError(err)}</div>`;
  }
}

function clientRow(c) {
  const phone = c.phone ? `<span class="client-phone">📞 ${c.phone}</span>` : '';
  return `
  <article class="client-row" role="listitem">
    <div class="client-info">
      <span class="client-name">${escapeHtml(c.name)}</span>
      ${phone}
    </div>
    <div class="client-actions">
      <button class="btn btn-secondary" data-action="ver" data-id="${c.id}" type="button">
        Ver cliente
      </button>
      <button class="btn btn-primary" data-action="nueva-tx" data-id="${c.id}" type="button">
        Nueva transacción
      </button>
    </div>
  </article>`;
}

// ════════════════════════════════════════════════════════════════
// VISTA: NUEVO CLIENTE
// ════════════════════════════════════════════════════════════════

function renderNewClient() {
  setContent(`
  ${renderHeader()}
  <main class="page">
    <div class="back-bar">
      <a href="#/clientes" class="btn btn-ghost">← Volver</a>
    </div>

    <div class="form-card">
      <h1 class="form-title">Nuevo cliente</h1>

      <div id="nc-error" class="alert alert-error" role="alert" style="display:none"></div>

      <form id="new-client-form" novalidate>
        <div class="form-group">
          <label for="nc-name">Nombre del cliente<span class="required-mark" aria-hidden="true">*</span></label>
          <input type="text" id="nc-name" name="name" autocomplete="name" required placeholder="Nombre completo" />
        </div>

        <div class="form-group">
          <label for="nc-phone">Teléfono</label>
          <input type="tel" id="nc-phone" name="phone" autocomplete="tel" placeholder="10 dígitos (opcional)" />
          <span class="form-hint">Solo números. Opcional.</span>
        </div>

        <div class="form-group">
          <label for="nc-debt">Primer fiado<span class="required-mark" aria-hidden="true">*</span></label>
          <input type="number" id="nc-debt" name="firstDebt" min="0.01" step="0.01" placeholder="0.00" required />
          <span class="form-hint">Monto inicial del primer cargo al cliente.</span>
        </div>

        <div class="form-group">
          <label for="nc-note">Nota (opcional)</label>
          <input type="text" id="nc-note" name="description" placeholder="Descripción del primer cargo…" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-block" id="nc-btn">
          Guardar cliente
        </button>
      </form>
    </div>
  </main>`);

  mountHeader();

  document.getElementById('new-client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('nc-error');
    const btn    = document.getElementById('nc-btn');
    errBox.style.display = 'none';

    const name     = document.getElementById('nc-name').value.trim();
    const phone    = document.getElementById('nc-phone').value.trim();
    const debt     = parseFloat(document.getElementById('nc-debt').value);
    const note     = document.getElementById('nc-note').value.trim();

    // Validación frontend
    let errors = [];
    if (!name) errors.push('El nombre del cliente es obligatorio.');
    if (!document.getElementById('nc-debt').value.trim()) errors.push('El primer fiado es obligatorio.');
    else if (isNaN(debt) || debt <= 0) errors.push('El primer fiado debe ser un número mayor a 0.');

    if (errors.length) {
      errBox.innerHTML = errors.length === 1 ? errors[0] : `<ul>${errors.map(m => `<li>${m}</li>`).join('')}</ul>`;
      errBox.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando…';

    try {
      // 1. Crear cliente
      const clientRes = await api.createClient({ name, phone });
      const clientId  = clientRes.data.client.id;

      // 2. Crear primer cargo
      await api.createTransaction({
        clientId,
        type: 'charge',
        amount: debt,
        description: note || 'Primer fiado',
      });

      // 3. Navegar al detalle
      router.go(`#/clientes/${clientId}`);
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      errBox.innerHTML = formatApiError(err);
      errBox.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar cliente';
    }
  });
}

// ════════════════════════════════════════════════════════════════
// VISTA: DETALLE DE CLIENTE
// ════════════════════════════════════════════════════════════════

let txState = {};  // { [clientId]: { page } }

async function renderClientDetail({ id }) {
  if (!txState[id]) txState[id] = { page: 1 };

  setContent(`
  ${renderHeader()}
  <main class="page" id="detail-page">
    <div class="back-bar">
      <a href="#/clientes" class="btn btn-ghost">← Clientes</a>
    </div>
    <div id="detail-wrap">
      <div class="spinner-wrap"><div class="spinner" role="status"></div><p>Cargando…</p></div>
    </div>
  </main>`);

  mountHeader();
  await loadClientDetail(id);
}

async function loadClientDetail(id) {
  const wrap = document.getElementById('detail-wrap');
  if (!wrap) return;

  try {
    const [clientRes] = await Promise.all([
      api.getClient(id),
    ]);
    const { client, balance } = clientRes.data;
    const saldo      = balance['Gran total'] ?? 0;
    const totalFiado = balance['Total fiado'] ?? 0;
    const totalPago  = balance['Total pagado'] ?? 0;

    wrap.innerHTML = `
    <section class="detail-card" aria-label="Información del cliente">
      <h1 class="client-detail-name">${escapeHtml(client.name)}</h1>
      ${client.phone ? `<p class="client-detail-phone">📞 ${client.phone}</p>` : ''}

      <div class="balance-grid" aria-label="Resumen de cuenta">
        <div class="balance-item">
          <div class="balance-label">Total fiado</div>
          <div class="balance-value">${formatMXN(totalFiado)}</div>
        </div>
        <div class="balance-item">
          <div class="balance-label">Total pagado</div>
          <div class="balance-value">${formatMXN(totalPago)}</div>
        </div>
        <div class="balance-item highlight">
          <div class="balance-label">Saldo pendiente</div>
          <div class="balance-value">${formatMXN(saldo)}</div>
        </div>
      </div>

      <div class="detail-actions">
        <a href="#/clientes/${client.id}/nueva-transaccion" class="btn btn-primary btn-lg">
          ＋ Agregar transacción
        </a>
        <a href="#/clientes/${client.id}/editar" class="btn btn-secondary">
          ✏️ Editar cliente
        </a>
        <button class="btn btn-danger-outline" id="delete-btn" type="button">
          🗑 Eliminar cliente
        </button>
      </div>
    </section>

    <h2 class="tx-section-title">Transacciones</h2>
    <div id="tx-wrap">
      <div class="spinner-wrap"><div class="spinner" role="status"></div><p>Cargando…</p></div>
    </div>
    <div id="tx-pagination" class="pagination"></div>`;

    document.getElementById('delete-btn').addEventListener('click', () => {
      showModal({
        title: 'Eliminar cliente',
        body: `¿Seguro que quieres eliminar a <strong>${escapeHtml(client.name)}</strong>?<br>Esta acción no se puede deshacer.`,
        confirmLabel: 'Sí, eliminar',
        confirmClass: 'btn-danger',
        onConfirm: () => deleteClient(client.id),
      });
    });

    await loadTransactions(id);

  } catch (err) {
    if (err.status === 401) { handleUnauthorized(); return; }
    wrap.innerHTML = `<div class="alert alert-error" role="alert">${formatApiError(err)}</div>`;
  }
}

async function loadTransactions(id) {
  const wrap = document.getElementById('tx-wrap');
  const pag  = document.getElementById('tx-pagination');
  if (!wrap) return;

  wrap.innerHTML = `<div class="spinner-wrap"><div class="spinner" role="status"></div><p>Cargando…</p></div>`;

  try {
    const res = await api.getClientTransactions(id, { page: txState[id].page, perPage: 10 });
    const txs = res.data?.transactions ?? [];

    if (!txs.length) {
      wrap.innerHTML = emptyState('Este cliente no tiene transacciones aún.');
      return;
    }

    wrap.innerHTML = `
    <div class="tx-list" role="list" aria-label="Lista de transacciones">
      ${txs.map(tx => txRow(tx)).join('')}
    </div>`;

    if (pag) renderPagination(pag, txState[id].page, txs.length, 10, (p) => {
      txState[id].page = p;
      loadTransactions(id);
    });

  } catch (err) {
    if (err.status === 401) { handleUnauthorized(); return; }
    if (err.status === 404) {
      wrap.innerHTML = emptyState('Este cliente no tiene transacciones aún.');
      return;
    }
    wrap.innerHTML = `<div class="alert alert-error" role="alert">${formatApiError(err)}</div>`;
  }
}

function txRow(tx) {
  const isCharge = tx.type === 'charge';
  const label    = txLabel(tx.type);
  const badge    = isCharge ? 'tx-charge' : 'tx-payment';
  const amt      = isCharge ? 'charge' : 'payment';
  const desc     = tx.description ? `<div class="tx-description">${escapeHtml(tx.description)}</div>` : '';
  return `
  <article class="tx-row" role="listitem">
    <div>
      <span class="tx-type-badge ${badge}" aria-label="Tipo: ${label}">
        ${isCharge ? '↑' : '↓'} ${label}
      </span>
    </div>
    <div class="tx-info">
      <div class="tx-date">${formatDateShort(tx.time)}</div>
      ${desc}
    </div>
    <div class="tx-amount ${amt}" aria-label="${label} de ${formatMXN(tx.amount)}">
      ${isCharge ? '+' : '−'}${formatMXN(tx.amount)}
    </div>
  </article>`;
}

async function deleteClient(id) {
  try {
    await api.deleteClient(id);
    router.go('#/clientes');
  } catch (err) {
    if (err.status === 401) { handleUnauthorized(); return; }
    showToast(
      err.status === 404 || err.status === 405
        ? 'No se pudo eliminar el cliente. Esta función puede no estar disponible todavía.'
        : `Error al eliminar: ${formatApiError(err)}`,
      6000
    );
  }
}

// ════════════════════════════════════════════════════════════════
// VISTA: RESUMEN GLOBAL
// ════════════════════════════════════════════════════════════════

async function renderSummary() {
  setContent(`
  ${renderHeader()}
  <main class="page" id="summary-page">
    <div class="back-bar">
      <a href="#/clientes" class="btn btn-ghost">← Volver a clientes</a>
    </div>

    <div class="section-header">
      <div>
        <h1 class="section-title">Resumen global</h1>
        <p class="section-subtitle">Balance total de fiados</p>
      </div>
    </div>

    <div id="summary-wrap">
      <div class="spinner-wrap" aria-live="polite" aria-label="Cargando resumen global">
        <div class="spinner" role="status"></div>
        <p>Cargando…</p>
      </div>
    </div>
  </main>`);

  mountHeader();
  await loadTransactionsSummary();
}

async function loadTransactionsSummary() {
  const wrap = document.getElementById('summary-wrap');
  if (!wrap) return;

  wrap.innerHTML = `<div class="spinner-wrap" aria-live="polite"><div class="spinner" role="status"></div><p>Cargando…</p></div>`;

  try {
    const res = await api.getTransactionsSummary();
    const summary = res.data ?? {};
    const totalFiado = summary['Total fiado'] ?? 0;
    const totalPago  = summary['Total pagado'] ?? 0;
    const granTotal  = summary['Gran total'] ?? 0;

    wrap.innerHTML = `
    <section class="detail-card" aria-label="Resumen global de transacciones">
      <div class="balance-grid" aria-label="Balance total de fiados">
        <div class="balance-item">
          <div class="balance-label">Total fiado</div>
          <div class="balance-value">${formatMXN(totalFiado)}</div>
        </div>
        <div class="balance-item">
          <div class="balance-label">Total pagado</div>
          <div class="balance-value">${formatMXN(totalPago)}</div>
        </div>
        <div class="balance-item highlight">
          <div class="balance-label">Gran total</div>
          <div class="balance-value">${formatMXN(granTotal)}</div>
        </div>
      </div>
    </section>`;
  } catch (err) {
    if (err.status === 401) { handleUnauthorized(); return; }
    wrap.innerHTML = `<div class="alert alert-error" role="alert">${formatApiError(err)}</div>`;
  }
}

// ════════════════════════════════════════════════════════════════
// VISTA: NUEVA TRANSACCIÓN
// ════════════════════════════════════════════════════════════════

async function renderNewTransaction({ id }) {
  setContent(`
  ${renderHeader()}
  <main class="page">
    <div class="back-bar">
      <a href="#/clientes/${id}" class="btn btn-ghost">← Volver al cliente</a>
    </div>
    <div class="form-card">
      <h1 class="form-title" id="tx-form-title">Nueva transacción</h1>
      <div id="tx-client-name" class="section-subtitle" style="margin-bottom:1.25rem">Cargando…</div>

      <div id="tx-error" class="alert alert-error" role="alert" style="display:none"></div>

      <form id="tx-form" novalidate>
        <div class="form-group">
          <label for="tx-type">Tipo de transacción<span class="required-mark" aria-hidden="true">*</span></label>
          <select id="tx-type" name="type" required>
            <option value="charge">Cargo (fiado)</option>
            <option value="payment">Pago</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tx-amount">Monto<span class="required-mark" aria-hidden="true">*</span></label>
          <input type="number" id="tx-amount" name="amount" min="0.01" step="0.01" placeholder="0.00" required />
        </div>

        <div class="form-group">
          <label for="tx-note">Nota (opcional)</label>
          <input type="text" id="tx-note" name="description" placeholder="Descripción de la transacción…" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-block" id="tx-btn">
          Guardar transacción
        </button>
      </form>
    </div>
  </main>`);

  mountHeader();

  // Cargar nombre del cliente
  try {
    const res = await api.getClient(id);
    const name = res.data?.client?.name ?? '';
    const el = document.getElementById('tx-client-name');
    if (el && name) el.textContent = `Cliente: ${name}`;
  } catch { /* No critical */ }

  document.getElementById('tx-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = document.getElementById('tx-error');
    const btn    = document.getElementById('tx-btn');
    errBox.style.display = 'none';

    const type   = document.getElementById('tx-type').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const note   = document.getElementById('tx-note').value.trim();

    let errors = [];
    if (!document.getElementById('tx-amount').value.trim()) errors.push('El monto es obligatorio.');
    else if (isNaN(amount) || amount <= 0) errors.push('El monto debe ser un número mayor a 0.');

    if (errors.length) {
      errBox.innerHTML = errors[0];
      errBox.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando…';

    try {
      await api.createTransaction({ clientId: id, type, amount, description: note });
      router.go(`#/clientes/${id}`);
    } catch (err) {
      if (err.status === 401) { handleUnauthorized(); return; }
      errBox.innerHTML = formatApiError(err);
      errBox.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Guardar transacción';
    }
  });
}

// ════════════════════════════════════════════════════════════════
// VISTA: EDITAR CLIENTE
// ════════════════════════════════════════════════════════════════

async function renderEditClient({ id }) {
  setContent(`
  ${renderHeader()}
  <main class="page">
    <div class="back-bar">
      <a href="#/clientes/${id}" class="btn btn-ghost">← Volver al cliente</a>
    </div>
    <div class="form-card">
      <h1 class="form-title">Editar cliente</h1>
      <div id="edit-load">
        <div class="spinner-wrap"><div class="spinner" role="status"></div><p>Cargando…</p></div>
      </div>
    </div>
  </main>`);

  mountHeader();

  try {
    const res = await api.getClient(id);
    const client = res.data.client;

    document.getElementById('edit-load').innerHTML = `
      <div id="edit-error" class="alert alert-error" role="alert" style="display:none"></div>
      <form id="edit-form" novalidate>
        <div class="form-group">
          <label for="edit-name">Nombre del cliente<span class="required-mark" aria-hidden="true">*</span></label>
          <input type="text" id="edit-name" name="name" autocomplete="name" required value="${escapeHtml(client.name)}" />
        </div>

        <div class="form-group">
          <label for="edit-phone">Teléfono</label>
          <input type="tel" id="edit-phone" name="phone" autocomplete="tel" placeholder="Solo números (opcional)" value="${escapeHtml(client.phone ?? '')}" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-block" id="edit-btn">
          Guardar cambios
        </button>
      </form>`;

    document.getElementById('edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('edit-error');
      const btn    = document.getElementById('edit-btn');
      errBox.style.display = 'none';

      const name  = document.getElementById('edit-name').value.trim();
      const phone = document.getElementById('edit-phone').value.trim();

      if (!name) {
        errBox.textContent = 'El nombre del cliente es obligatorio.';
        errBox.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Guardando…';

      try {
        await api.updateClient(id, { name, phone });
        router.go(`#/clientes/${id}`);
      } catch (err) {
        if (err.status === 401) { handleUnauthorized(); return; }
        if (err.status === 404 || err.status === 405 || err.status === 500) {
          errBox.textContent = 'No se pudo editar el cliente. Esta función puede no estar disponible todavía.';
        } else {
          errBox.innerHTML = formatApiError(err);
        }
        errBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar cambios';
      }
    });

  } catch (err) {
    if (err.status === 401) { handleUnauthorized(); return; }
    document.getElementById('edit-load').innerHTML =
      `<div class="alert alert-error" role="alert">${formatApiError(err)}</div>`;
  }
}

// ════════════════════════════════════════════════════════════════
// PAGINACIÓN
// ════════════════════════════════════════════════════════════════

function renderPagination(container, page, resultCount, perPage, onChange) {
  const hasPrev = page > 1;
  const hasNext = resultCount === perPage; // si vino lleno, probablemente hay más

  if (!hasPrev && !hasNext) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <button class="btn btn-secondary" id="pag-prev" type="button" ${hasPrev ? '' : 'disabled'}>
      ← Anterior
    </button>
    <span class="page-info">Página ${page}</span>
    <button class="btn btn-secondary" id="pag-next" type="button" ${hasNext ? '' : 'disabled'}>
      Siguiente →
    </button>`;

  if (hasPrev) container.querySelector('#pag-prev').addEventListener('click', () => onChange(page - 1));
  if (hasNext) container.querySelector('#pag-next').addEventListener('click', () => onChange(page + 1));
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function emptyState(msg) {
  return `
  <div class="empty-state" role="status">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
    <p>${msg}</p>
  </div>`;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function handleUnauthorized() {
  router.go('#/login');
  showToast('Tu sesión expiró. Inicia sesión nuevamente.');
}

// ════════════════════════════════════════════════════════════════
// ROUTER & GUARDS
// ════════════════════════════════════════════════════════════════

const router = new Router();

/** Rutas privadas — comprueba sesión antes de renderizar */
async function guard(renderFn, params) {
  const ok = await api.checkSession();
  if (!ok) {
    router.go('#/login');
    return;
  }
  renderFn(params);
}

router
  .on('/login',                                  () => renderLogin())
  .on('/clientes',                               (p) => guard(renderClients, p))
  .on('/clientes/:id',                           (p) => guard(() => renderClientDetail(p), p))
  .on('/clientes/:id/nueva-transaccion',         (p) => guard(() => renderNewTransaction(p), p))
  .on('/clientes/:id/editar',                    (p) => guard(() => renderEditClient(p), p))
  .on('/nuevo-cliente',                          (p) => guard(renderNewClient, p))
  .on('/resumen',                                (p) => guard(renderSummary, p))
  .notFound(() => router.go('#/clientes'));

// ════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ════════════════════════════════════════════════════════════════

(async function init() {
  // Aplicar tema guardado
  applyTheme(getTheme());

  // Si no hay hash, mandar a /clientes para que el guard decida
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/clientes';
    return; // hashchange se disparará y el router se encargará
  }

  router.start();
})();
