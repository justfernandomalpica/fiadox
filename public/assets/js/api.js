/**
 * api.js — Capa de comunicación con el backend PHP
 * FiaDOX · Abarrotes Virrey
 *
 * Todas las peticiones van al mismo dominio (sesión PHP).
 * No se usa JWT.
 */

// ── Manejador central de respuestas ──────────────────────────────────────────

/**
 * Ejecuta un fetch y normaliza la respuesta.
 * Lanza un Error si el servidor responde con un estado HTTP de error o
 * si success === false en el JSON.
 * El error tiene `.status` (código HTTP) y `.data` (body JSON completo).
 */
async function request(url, options = {}) {
  const res = await fetch(url, options);

  // Sin contenido (logout, etc.)
  if (res.status === 204) return { success: true, data: null, error: null };

  let json;
  try {
    json = await res.json();
  } catch {
    const err = new Error(`Error del servidor (${res.status})`);
    err.status = res.status;
    throw err;
  }

  if (!json.success) {
    const err = new Error(
      typeof json.error === 'string'
        ? json.error
        : 'Error en la petición'
    );
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

// ── Autenticación ─────────────────────────────────────────────────────────────

export const api = {
  /**
   * POST /auth/login — FormData (email, password)
   */
  async login(email, password) {
    const body = new FormData();
    body.append('email', email);
    body.append('password', password);
    return request('/auth/login', { method: 'POST', body });
  },

  /**
   * POST /auth/logout
   */
  async logout() {
    return request('/auth/logout', { method: 'POST' });
  },

  /**
   * Verifica sesión activa golpeando un endpoint protegido.
   * El backend tiene `/auth/me` como ruta de prueba.
   * Si responde 401 → no hay sesión.
   */
  async checkSession() {
    // Llamamos a un endpoint protegido; si hay sesión responde 200/404,
    // si no hay sesión responde 401.
    const res = await fetch('/auth/me');
    if (res.status === 401) return false;
    return true;
  },

  // ── Clientes ────────────────────────────────────────────────────────────────

  /**
   * GET /api/clients?page=&per_page=&name=
   */
  async getClients({ page = 1, perPage = 10, name = '' } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (name.trim()) params.set('name', name.trim());
    return request(`/api/clients?${params}`);
  },

  /**
   * GET /api/clients/{id}?page=1&per_page=10
   */
  async getClient(id, { page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    return request(`/api/clients/${id}?${params}`);
  },

  /**
   * GET /api/clients/{id}/transactions?page=&per_page=
   */
  async getClientTransactions(id, { page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({ page, per_page: perPage });
    return request(`/api/clients/${id}/transactions?${params}`);
  },

  /**
   * POST /api/clients — FormData (name, phone?)
   */
  async createClient({ name, phone }) {
    const body = new FormData();
    body.append('name', name);
    if (phone && String(phone).trim()) body.append('phone', phone);
    return request('/api/clients', { method: 'POST', body });
  },

  /**
   * PUT /api/clients/{id} — JSON (name, phone?)
   * Puede no estar implementado; se captura el error arriba en la vista.
   */
  async updateClient(id, { name, phone }) {
    return request(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone || null }),
    });
  },

  /**
   * DELETE /api/clients/{id}
   */
  async deleteClient(id) {
    return request(`/api/clients/${id}`, { method: 'DELETE' });
  },

  // ── Transacciones ───────────────────────────────────────────────────────────

  /**
   * POST /api/transactions — FormData (client_id, type, amount, description?)
   */
  async createTransaction({ clientId, type, amount, description }) {
    const body = new FormData();
    body.append('client_id', clientId);
    body.append('type', type);
    body.append('amount', amount);
    if (description && description.trim()) body.append('description', description.trim());
    return request('/api/transactions', { method: 'POST', body });
  },
};
