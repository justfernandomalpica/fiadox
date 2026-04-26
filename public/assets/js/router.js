/**
 * router.js — Hash router simple
 * FiaDOX · Abarrotes Virrey
 *
 * Rutas soportadas:
 *   #/login
 *   #/clientes
 *   #/clientes/:id
 *   #/clientes/:id/nueva-transaccion
 *   #/clientes/:id/editar
 *   #/nuevo-cliente
 */

export class Router {
  constructor() {
    this._routes = [];
    this._onNotFound = null;
    window.addEventListener('hashchange', () => this._dispatch());
  }

  /** Registra una ruta.
   * El patrón puede incluir :param (ej. "/clientes/:id/editar").
   */
  on(pattern, handler) {
    // Convierte el patrón a regex: /clientes/:id → /^\/clientes\/(\d+)$/
    const keys = [];
    const regexStr = pattern
      .replace(/:([a-z]+)/gi, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      })
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexStr}$`);
    this._routes.push({ regex, keys, handler });
    return this;
  }

  notFound(handler) {
    this._onNotFound = handler;
    return this;
  }

  /** Dispara la ruta actual. */
  start() {
    this._dispatch();
  }

  /** Navega a un hash sin recargar. */
  go(path) {
    window.location.hash = path;
  }

  _dispatch() {
    const raw = window.location.hash.replace(/^#/, '') || '/';
    const path = raw.split('?')[0]; // ignorar query string en hash

    for (const { regex, keys, handler } of this._routes) {
      const match = path.match(regex);
      if (match) {
        const params = {};
        keys.forEach((k, i) => (params[k] = match[i + 1]));
        handler(params);
        return;
      }
    }

    if (this._onNotFound) this._onNotFound();
  }
}
