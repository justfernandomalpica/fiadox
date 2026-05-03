import AppRouter from './router/AppRouter.jsx'

// App no tiene lógica propia: su única responsabilidad es montar el router.
// Si en el futuro se necesita un Context global (tema, sesión), se agrega aquí
// envolviendo <AppRouter /> sin tocar ninguna otra parte del árbol.
export default function App() {
  return <AppRouter />
}
