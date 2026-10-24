// Icono de la PWA: cuadrado verde con "123" en blanco (el mismo de la pantalla de inicio del móvil).
export function AppTile() {
  return (
    <div
      aria-hidden="true"
      className="flex size-14 items-center justify-center rounded-[12px] bg-primary text-xl font-bold text-primary-foreground"
    >
      123
    </div>
  )
}
