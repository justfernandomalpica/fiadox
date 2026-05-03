import { useState, useEffect } from 'react'

/**
 * hooks/useTheme.js — Tema claro / oscuro
 * FiaDOX · Abarrotes Virrey
 *
 * Migrado desde las funciones getTheme/applyTheme/toggleTheme de app.js vanilla.
 *
 * El tema se persiste en localStorage con la clave 'fiadox-theme'.
 * Se aplica como atributo data-theme en <html>, que el CSS ya conoce:
 *   [data-theme="dark"] { ... }
 *
 * Uso:
 *   const { theme, toggle } = useTheme()
 */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('fiadox-theme') || 'light'
  )

  useEffect(() => {
    // Sincronizar el atributo HTML y localStorage cada vez que cambia el tema
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fiadox-theme', theme)
  }, [theme])

  function toggle() {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggle }
}
