# README.handoff — CRM-123 (escritorio + PWA supervisor)

Documento de traspaso de diseño para **Claude Code Web**. Es autosuficiente: describe qué se diseñó, con qué valores exactos, qué se apartó del brief y qué falta conectar.

---

## 0. Qué es esto y cómo usarlo

- Los dos archivos `.dc.html` de esta carpeta son **referencias de diseño hechas en HTML**: prototipos navegables que muestran aspecto y comportamiento. **No son código de producción** y no deben copiarse tal cual.
- La tarea es **recrear estas pantallas** en las aplicaciones reales `crm-123-web` (escritorio) y `crm-123-pwa` (supervisor, móvil), con el stack del proyecto (React + componentes de estilo **shadcn/ui** sobre Tailwind, según el brief) y conectadas a Supabase.
- **Fidelidad: alta (hi-fi).** Colores, tipografía, tamaños, espaciados, textos y estados son los finales. Recrear con precisión.
- Fuentes de verdad, por orden: `SCRIPTS-SQL.md` (datos; **no se puede añadir, quitar ni renombrar nada**) → `DESIGN_BRIEF.md` (pantallas y textos) → este documento (valores visuales finales y desviaciones).
- Para abrir los prototipos: abrir el `.dc.html` en un navegador con `support.js` en la misma carpeta. Cada archivo tiene un panel de *Tweaks* (props) para cambiar rol, estado de datos y pantalla inicial (ver §9).

---

## 1. Archivos

| Archivo | Contenido |
|---|---|
| `CRM-123 Escritorio.dc.html` | App de escritorio completa (vendedor y supervisor): acceso, armazón, 8 pantallas, 7 diálogos/paneles |
| `CRM-123 PWA Supervisor.dc.html` | PWA del supervisor dentro de un marco de móvil de 390 × 844: 14 pantallas + hoja de confirmación |
| `support.js` | Runtime necesario solo para abrir los prototipos. No forma parte del producto |
| `reference/DESIGN_BRIEF.md`, `reference/SCRIPTS-SQL.md` | Copias de los documentos de partida, solo como referencia |

Dentro de cada archivo, cada pantalla lleva un atributo `data-screen-label` (nombre de la pantalla) y en la lógica se identifica por una clave interna (`screen`). Ambos se listan abajo para localizar cada pantalla en el código del prototipo.

---

## 2. Pantallas construidas

### 2.1 Escritorio — `CRM-123 Escritorio.dc.html`

| # | Pantalla (brief) | `data-screen-label` | Clave `screen` | Componente sugerido en `crm-123-web` |
|---|---|---|---|---|
| 5.1 | Acceso | `Acceso` | `acceso` | `LoginPage` |
| 5.2 | Cambiar contraseña (primer acceso) | `Cambiar contraseña (primer acceso)` | `pwd` | `FirstPasswordPage` |
| 5.3 | Armazón (barra lateral + cabecera) | — (estructura `aside` + `main`) | — | `AppShell`, `Sidebar`, `PageHeader` |
| 5.4 | Tablero del día | `Tablero del día` | `tablero` | `DashboardPage` |
| 5.5 | Clientes (lista) | `Clientes` | `clientes` | `ClientsPage` |
| 5.6 | Cliente nuevo / Editar cliente | `Cliente nuevo / Editar cliente` | `nuevo` (+ `editing: true/false`) | `ClientFormPage` |
| 5.7 | Ficha de cliente | `Ficha de cliente` | `ficha` | `ClientDetailPage` |
| 5.8 | Nueva / Editar oportunidad (panel lateral) | — (`role="dialog"`, panel derecho) | `dialog: 'opp'` | `OpportunitySheet` |
| 5.8 | Cambiar etapa / Marcar perdida | — (diálogo centrado) | `dialog: 'stage'` | `StageDialog` |
| 5.8 | Nueva tarea (desde ficha o desde Tareas) | — | `dialog: 'task'` | `TaskDialog` |
| 5.8 | Registrar actividad | — | `dialog: 'act'` | `ActivityDialog` |
| 5.8 | Archivar cliente / oportunidad · Restaurar oportunidad | — | `dialog: 'archive'` / `'restore_opp'` | `ArchiveDialog` |
| 5.8 | Restaurar cliente | — | `dialog: 'restore'` | `RestoreClientDialog` |
| 5.8 | Cancelar tarea | — | `dialog: 'cancelTask'` | `CancelTaskDialog` |
| 5.9 | Oportunidades (lista) | `Oportunidades` | `oportunidades` | `OpportunitiesPage` |
| 5.10 | Tareas | `Tareas` | `tareas` | `TasksPage` |
| 5.11 | Mi cuenta | `Mi cuenta` | `cuenta` | `AccountPage` |
| §3 | Sin permiso | `Sin permiso` | prop `estadoDatos = sin_permiso` | `ForbiddenPage` |

### 2.2 PWA — `CRM-123 PWA Supervisor.dc.html`

| # | Pantalla (brief) | `data-screen-label` | Clave `screen` | Componente sugerido en `crm-123-pwa` |
|---|---|---|---|---|
| 6.1 | Acceso | `Acceso PWA` | `acceso` | `LoginScreen` |
| 6.1 | Solo supervisores (entra un vendedor) | `Solo supervisores` | `soloSupervisores` | `SupervisorsOnlyScreen` |
| 6.1 | Cambiar contraseña (primer acceso) | `Cambiar contraseña PWA` | `pwd` | `FirstPasswordScreen` |
| 6.2 | Equipo hoy (inicio) | `Equipo hoy` | `equipo` | `TeamTodayScreen` |
| 6.3 | Detalle de vendedor | `Detalle de vendedor` | `vendedor` | `SellerDetailScreen` |
| 6.4 | Usuarios | `Usuarios` | `usuarios` | `UsersScreen` |
| 6.4 | Nuevo usuario | `Nuevo usuario` | `nuevoUsuario` | `NewUserScreen` |
| 6.4 | Contraseña temporal (mostrar una vez) | `Contraseña temporal` | `tempPwd` | `TempPasswordScreen` |
| 6.4 | Detalle de usuario | `Detalle de usuario` | `usuario` | `UserDetailScreen` |
| 6.5 | Reasignar clientes | `Reasignar clientes` | `reasignar` | `ReassignScreen` |
| 6.6 | Resumen matutino | `Resumen matutino` | `resumen` | `MorningSummaryScreen` |
| 6.6 | Detalle de un envío (historial) | `Detalle de ejecución` | `ejecucion` | `SummaryRunDetailScreen` |
| 6.7 | Auditoría | `Auditoría` | `auditoria` | `AuditScreen` |
| 6.8 | Más | `Más` | `mas` | `MoreScreen` |
| 6.x | Mi cuenta | `Mi cuenta PWA` | `cuenta` | `AccountScreen` |
| §3 | Sin conexión | `Sin conexión` | prop `conexion = false` | `OfflineScreen` |
| — | Hoja de confirmación (enviar resumen, desactivar, reasignar) | — (`role="dialog"`) | `confirm: 'send' \| 'deactivate' \| 'reassign'` | `ConfirmSheet` |

---

## 3. Valores visuales finales (design tokens)

Solo **modo claro**. Todos los colores son de uso literal; conviene definirlos como variables CSS / tokens de Tailwind con estos nombres.

### 3.1 Colores

| Token propuesto | Hex | Uso |
|---|---|---|
| `primary` | `#1E6B45` | Botón principal, enlaces, logotipo, éxito, toast, foco, etapa Ganada (texto), interruptor activo |
| `primary-hover` | `#175636` | Hover del botón principal y del enlace; texto sobre `primary-soft` |
| `primary-soft` | `#E8F2EC` | Fondo de nav activo, hover de botones fantasma verdes, etiqueta Ganada, barra de totales, tipo de negocio |
| `primary-soft-border` | `#CFE3D6` | Borde del banner "Empieza añadiendo tu primer cliente" |
| `bg` | `#F7F8F7` | Fondo de página; cabecera de tabla |
| `surface` | `#FFFFFF` | Tarjetas, tablas, barra lateral, diálogos |
| `border` | `#E3E6E3` | Bordes de tarjetas, separadores de filas y de secciones |
| `border-input` | `#CFD5D1` | Borde de campos y selectores (ver §5, desviación) |
| `text` | `#1C2420` | Texto principal |
| `text-muted` | `#5B655F` | Texto secundario, etiquetas de KPI, fechas |
| `hover-neutral` | `#F2F4F2` | Hover de botones secundarios y de menús |
| `row-hover` | `#FAFBFA` | Hover de fila de tabla; filas desplegadas |
| `skeleton` | `#ECEFEC` | Barras de esqueleto; botones desactivados en la PWA |
| `neutral-soft` | `#EEF0EE` | Etiqueta Nueva, Archivado/Archivada, Omitido, Desactivado, banner de cliente archivado, campos de solo lectura |
| `neutral-strong` | `#3F4943` | Texto sobre `neutral-soft` |
| `neutral-border` | `#DDE1DE` | Borde del banner "Cliente archivado" |
| `danger` | `#C62828` | Vencido, error, contador de vencidas, texto del botón de peligro |
| `danger-soft` | `#FDECEC` | Fondo de error, etiqueta Vencida, fondo del botón de peligro atenuado |
| `danger-border` | `#F2C4C4` / `#F5C9C9` | Borde de la tarjeta KPI de vencidas y del botón de peligro / del banner de error |
| `danger-row` | `#FFFAFA` | Fondo de fila de tarea vencida en el Tablero |
| `warning` | `#B26A00` | Borde del campo Teléfono cuando está "ya asignado" o "archivado" |
| `warning-text` | `#8F5500` | Texto ámbar sobre `warning-soft` (etiqueta Negociación, Con errores, avisos) |
| `warning-text-strong` | `#7A4A00` | Texto del aviso de contraseña temporal y del aviso "Antes reasigna sus clientes" |
| `warning-soft` | `#FFF4E0` | Fondo ámbar |
| `info` | `#1F5FA8` | Etiqueta Oferta enviada, En cola, En proceso, rol Supervisor, avisos informativos |
| `info-soft` | `#E9F0FA` | Fondo azul |
| `info-border` | `#BFD3EC` | Borde de la tarjeta de estado mientras el envío está En cola / En proceso |
| `lost-soft` / `lost-text` | `#F9EDED` / `#9E3A3A` | Etiqueta Perdida ("rojo atenuado") |
| `switch-off` | `#B9C1BC` | Interruptor desactivado |
| `overlay` | `rgba(28,36,32,.32)` (escritorio) · `rgba(28,36,32,.4)` (PWA) | Fondo de diálogos y paneles |

**Etiquetas de etapa** (`opportunity_stage`): fondo / texto

| Valor | Texto | Fondo | Texto |
|---|---|---|---|
| `nueva` | Nueva | `#EEF0EE` | `#3F4943` |
| `oferta_enviada` | Oferta enviada | `#E9F0FA` | `#1F5FA8` |
| `negociacion` | Negociación | `#FFF4E0` | `#8F5500` |
| `ganada` | Ganada | `#E8F2EC` | `#1E6B45` |
| `perdida` | Perdida | `#F9EDED` | `#9E3A3A` |

**Estado de ejecución del resumen** (`summary_run_status`): `pendiente` → "En cola" azul (`#E9F0FA`/`#1F5FA8`) · `en_proceso` → "En proceso" azul · `completado` → verde (`#E8F2EC`/`#1E6B45`) · `con_errores` → ámbar (`#FFF4E0`/`#8F5500`) · `fallido` → rojo (`#FDECEC`/`#C62828`) · `omitido` → gris (`#EEF0EE`/`#3F4943`).
**Entrega** (`delivery_status`): `pendiente` gris · `enviado` verde · `fallido` rojo (mismos pares).
**Rol**: Vendedor `#E8F2EC`/`#175636` · Supervisor `#E9F0FA`/`#1F5FA8`. **Estado de usuario**: Activo `#E8F2EC`/`#175636` · Desactivado `#EEF0EE`/`#5B655F`.

### 3.2 Tipografía

- Familia única: **Inter** (Google Fonts, pesos 400 / 500 / 600 / 700). Alternativa: `system-ui, sans-serif`.
- Cifras, importes, fechas y teléfonos: `font-variant-numeric: tabular-nums`.
- Párrafos: `text-wrap: pretty`.

| Elemento | Escritorio | PWA |
|---|---|---|
| Texto base | 14 px / 400 | 16 px / 400 |
| Logotipo "CRM-123" | 20 px / 600 `#1E6B45` (22 px en Acceso) | 24 px / 600 en Acceso; 20 px en Cambiar contraseña |
| Título de pantalla (h1) | 20 px / 600, `letter-spacing: -0.01em` | 22 px / 600, `-0.01em` |
| Título de sección / tarjeta (h2/h3) | 16 px / 600 | 16 px / 600 (18 px en hoja de confirmación) |
| Fecha en cabecera | 13 px / 400 `#5B655F` ("Lunes, 02/11/2026") | 14 px / 500 `#5B655F` ("Lun 02/11") |
| Cifra de KPI | 28 px / 600, sin salto de línea | 32 px / 600 (recuentos); 22 px / 600 (importes en €; 20 px en Detalle de vendedor) |
| Etiqueta de KPI | 13 px / 500 `#5B655F`, una línea con "…" | 14 px / 500 `#5B655F` |
| Etiqueta de campo | 13 px / 500 | 15 px / 500 |
| Texto de ayuda / error bajo campo | 12 px (error `#C62828`) | 14 px |
| Cabecera de tabla | 12 px / 600 `#5B655F` | — |
| Badge / etiqueta | 12 px / 600 | 12–13 px / 600 |
| Botón | 14 px / 500 (600 en Acceso) | 16 px / 600 |
| Pestañas inferiores | — | 12 px; activa 600 `#1E6B45`, inactiva 500 `#5B655F` |
| Contraseña temporal | — | `ui-monospace, Menlo, monospace` 28 px / 600, `letter-spacing: 0.04em` |

### 3.3 Radios, sombras y foco

- Radios: tarjetas, tablas, banners, toasts y diálogos **8 px**; controles (botones, campos, selectores, menús) **6 px** en escritorio y **8 px** en la PWA; badges en píldora (altura 22 → radio 11; altura 24 → 12); FAB 26 px; hoja inferior `16px 16px 0 0`; marco del móvil 44 / 36 px (solo prototipo).
- Sombras (mínimas): menú desplegable `0 6px 20px rgba(28,36,32,.10)` · diálogo `0 12px 32px rgba(28,36,32,.14)` · toast `0 8px 24px rgba(28,36,32,.18)` (PWA `.2`) · FAB `0 6px 16px rgba(28,36,32,.22)`. Las tarjetas **no tienen sombra**: se separan por borde de 1 px `#E3E6E3`.
- Foco: `:focus-visible { outline: 2px solid #1E6B45; outline-offset: 2px; }` en todos los elementos interactivos.
- Enlaces: `#1E6B45`; hover `#175636` + subrayado.

### 3.4 Espaciados y medidas — escritorio

| Elemento | Medida |
|---|---|
| Barra lateral | 220 px fija, fondo `#FFFFFF`, borde derecho 1 px, padding `16px 12px`, gap 4 |
| Ítem de navegación | alto 36, padding `0 10px`, gap icono-texto 10, radio 6, icono 18. Activo: fondo `#E8F2EC`, texto `#175636` 600 |
| Contador de vencidas (nav) | 20 × min 20, radio 10, `#C62828`, texto blanco 12/600 |
| Pie de barra lateral | borde superior 1 px, padding-top 12; nombre 14/600 y rol 12 px; Mi cuenta y Salir de alto 34 |
| Cabecera de contenido | padding `18px 28px 14px`, gap 16, flex con wrap |
| Contenido | padding `0 28px 32px`, gap vertical 16 |
| Tarjeta KPI | padding 16, gap interno 6, borde 1 px (vencidas > 0 → borde `#F2C4C4`) |
| Fila de KPIs | rejilla con gap 12: **4 columnas si el contenedor mide ≥ 780 px; 2 × 2 si es menor** (nunca 3 + 1). Fórmula usada: `repeat(auto-fit, minmax(max(calc(25% - 9px), min(calc(50% - 6px), calc((780px - 100%) * 999))), 1fr))` |
| Dos columnas del Tablero | flex con wrap: 60 % (base 520 px) / 40 % (base 340 px), gap 16; se apilan si no caben |
| Dos columnas de la Ficha | flex con wrap: 65 % (base 560 px) / 35 % (base 300 px), gap 16 |
| Fila de tabla | alto mínimo 38 (36–40 según brief), padding `0 16px`, borde superior 1 px, gap de columnas 10–12 |
| Cabecera de tabla | alto 36, `position: sticky; top: 0`, fondo `#F7F8F7`, borde inferior 1 px |
| Contenedor de tabla | `overflow: auto`, `max-height: calc(100vh - 220px)` (Clientes) / `- 260px` (Oportunidades); padding inferior 10 para la barra de desplazamiento |
| Botón principal / secundario | alto 34–36, padding `0 14–16px`, gap icono 6, icono 15–16 |
| Botón fantasma en fila | alto 28, padding `0 8px`, 13 px / 500 |
| Campo / selector | alto 34 (filtros) o 36 (formularios), padding `0 10px`, borde 1 px `#CFD5D1` (error → `#C62828`) |
| Formulario de cliente | tarjeta max-width 880, padding 24, gap entre secciones 22; rejilla `repeat(auto-fit, minmax(260px, 1fr))`, gap `14px 20px` |
| Tarjeta de Acceso | 380 px, padding 32, gap 18; campos de alto 38 |
| Tarjeta de Cambiar contraseña | 420 px, padding 32 |
| Panel lateral (oportunidad) | 440 px a la derecha, cabecera y pie con padding `18px 20px` / `14px 20px` |
| Diálogo centrado | 480 px, `max-height: calc(100vh - 48px)`, padding `18px 20px` |
| Menú desplegable ("Más", "⋯") | min-width 170–180, padding 4, ítems de alto 34 |
| Badge | alto 22, padding `0 8px`, radio 11 |
| Toast | abajo a la derecha (24 px), padding `12px 16px`, 3 s |
| Esqueletos | barras de 10 px de alto, radio 4, `#ECEFEC`; tablas con 10 filas, listas con 4 |

**Columnas de la tabla Clientes**: `minmax(160px,1.6fr) minmax(120px,1.1fr) minmax(110px,1fr) 140px minmax(90px,.9fr) 90px 110px` + `minmax(100px,.9fr)` (Vendedor, solo supervisor) + `96px` (Estado, solo si "Mostrar archivados"). min-width 960 (vendedor) / 1080 (supervisor).
**Columnas de Oportunidades**: `110px minmax(140px,1.2fr) minmax(160px,1.6fr) 120px 140px 130px` + `minmax(100px,.9fr)` (Vendedor). min-width 860.
**Columnas de Tareas**: `40px 140px minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) 90px`. min-width 760.
**Oportunidades en la Ficha**: `minmax(120px,1fr) 104px 118px 84px 30px` (la última columna es el botón "⋯").
**Tareas del Tablero**: `24px 92px minmax(0,1fr) minmax(0,170px) 76px`.

### 3.5 Espaciados y medidas — PWA

| Elemento | Medida |
|---|---|
| Lienzo de referencia | 390 × 844 (barra de estado de 44 px, solo en el prototipo) |
| Cabecera | alto mínimo 56, padding `6px 16px 10px`; botón Volver de 44 × 44 |
| Contenido | padding `0 16px 24px`, gap 12 |
| Tarjeta | radio 8, padding 16, borde 1 px |
| Tarjeta de totales | rejilla 2 × 2 con separadores internos de 1 px; cada celda con padding 16 (14 16 en Detalle de vendedor) |
| Tarjeta de vendedor / usuario / fila de historial | alto mínimo 72 / 64 / 60, padding `10–12px 14–16px` |
| Campo / selector / botón | alto **48**, radio 8, padding `0 14px` |
| Filtros de Auditoría | alto 44 |
| Sección plegable | cabecera de alto 52 |
| Casillas (Reasignar) | 22 × 22, filas de alto 52 |
| Interruptor | 52 × 32, pomo de 26 |
| Barra de pestañas | 4 columnas, ítems de alto mínimo 52, icono 22, padding `4px 4px 22px` (zona segura inferior) |
| FAB "Añadir usuario" | alto 52, padding `0 20px`, radio 26, a 20 px de la derecha y 96 px del borde inferior |
| Hoja de confirmación | anclada abajo, padding `20px 16px 30px`, gap 12 |
| Toast | ancho completo menos 16 px por lado, 96 px sobre el borde inferior |

Las áreas táctiles son siempre de 44 px o más.

### 3.6 Iconos

Lucide (SVG lineal, `stroke-width: 2`, `stroke-linecap/linejoin: round`), de 16–20 px en escritorio y 18–22 px en la PWA. Usar `lucide-react` con estos nombres:

- Navegación de escritorio: `LayoutDashboard` (Tablero), `Users` (Clientes), `TrendingUp` (Oportunidades), `SquareCheck` (Tareas), `CircleUser`/`User` (Mi cuenta), `LogOut` (Salir).
- Acciones: `Plus`, `Pencil`, `Archive`, `Copy`, `Search`, `X`, `ChevronLeft`, `ChevronRight`, `ChevronDown`, `Ellipsis` (menú "⋯"), `Check`.
- Estados: `CircleAlert` (error y KPI vencidas), `Clock` (Vencida), `TriangleAlert` (teléfono ya asignado), `Info` (avisos), `Lock` (sin permiso), `WifiOff` (sin conexión), `Monitor` (solo supervisores).
- Tipos de actividad: `Phone` (Llamada), `MapPin` (Visita), `MessageCircle` (WhatsApp), `Mail` (Email), `FileText` (Nota).
- PWA: `Users` (Equipo), `User` (Usuarios), `Mail` (Resumen), `Ellipsis` (Más), `ArrowLeftRight` (Reasignar), `Shield` (Auditoría).

No hay imágenes ni ilustraciones. Los estados vacíos llevan solo texto + acción (la ilustración es opcional en el brief y no se dibujó).

---

## 4. Componentes: shadcn/ui y sistema de diseño

**Importante:** el prototipo **no importa** ningún componente de shadcn/ui ni del sistema de diseño **Organic**, que estaba asociado al proyecto pero no se aplicó (ver §5). Todo está hecho con HTML nativo y estilos en línea que imitan el estilo shadcn/ui del brief. En `crm-123-web` y `crm-123-pwa` **hay que usar los componentes shadcn/ui** de esta tabla y aplicarles los tokens de §3, sin crear botones ni campos propios.

| Elemento del prototipo | Componente shadcn/ui | Variante / notas |
|---|---|---|
| Botón verde sólido (Guardar, Añadir cliente, Entrar…) | `Button` | `default` → `bg #1E6B45`, hover `#175636` |
| Botón blanco con borde (Cancelar, Editar, Reintentar…) | `Button` | `outline` → hover `#F2F4F2` |
| Botón de peligro atenuado (Desactivar usuario, Cancelar tarea) | `Button` | variante nueva `destructive-soft`: fondo `#FDECEC`, texto `#C62828`, borde `#F2C4C4` |
| Botón de texto verde (Ver todas, Mostrar/Ocultar) | `Button` | `ghost` con texto `#1E6B45`, hover `#E8F2EC` · `link` para "Ver cliente" |
| Botón de icono (copiar, cerrar, "⋯") | `Button` | `size="icon"`, `outline` o `ghost` |
| Campo de texto / email / contraseña | `Input` | Contraseña con botón Mostrar/Ocultar dentro |
| Área de texto (Notas, Detalle de la venta, Descripción) | `Textarea` | |
| Selector (Tipo de negocio, Etapa, Motivo, Vendedor, Hora…) | `Select` | |
| Fecha prevista de cierre | `Popover` + `Calendar` (selector de fecha) | En el prototipo es `<input type="date">` |
| Fecha y hora (tarea y actividad) | `Popover` + `Calendar` + campo de hora | En el prototipo es `<input type="datetime-local">`; hora de Madrid |
| Prefijo de teléfono con bandera | `Select` (o `Command` en `Popover`) | 10 prefijos europeos, +34 por defecto |
| Casilla (Marcar como hecha, Mostrar archivados, Reasignar) | `Checkbox` | color `#1E6B45` |
| Interruptor (Resumen automático activado) | `Switch` | |
| Botones segmentados (Tipo de actividad, Rol, filtro de fecha) | `ToggleGroup` | `type="single"`; activo `#1E6B45` sobre blanco (actividad/rol) o `#E8F2EC` (filtro de fecha) |
| Tablas | `Table` | Cabecera sticky; filas de 38 px |
| Tarjetas (KPI, secciones, listas móviles) | `Card` | Sin sombra, borde `#E3E6E3`, radio 8 |
| Etiquetas (etapa, Vencida, Archivado, rol, estado) | `Badge` | Variantes por color de §3.1 |
| Panel lateral de oportunidad | `Sheet` | `side="right"`, 440 px |
| Diálogos (Cambiar etapa, Nueva tarea, Registrar actividad, Archivar, Restaurar, Cancelar tarea) | `Dialog` / `AlertDialog` | `AlertDialog` para Archivar, Cancelar tarea, Desactivar y Enviar resumen |
| Hoja de confirmación en la PWA | `Drawer` (vaul) | Anclada abajo |
| Menú "Más" de la ficha y "⋯" por oportunidad | `DropdownMenu` | |
| Pestañas Hoy / Vencidas / Próximas | `Tabs` | La pestaña Vencidas va en rojo con icono `Clock` si n > 0 |
| Secciones plegables (Detalle de vendedor, Auditoría) | `Collapsible` / `Accordion` | |
| Avisos emergentes | `Sonner` (toast) | Verde, 3 s |
| Banners (error, archivado, primer uso, modo pruebas, cooldown) | `Alert` | Variantes `destructive`, `warning`, `info`, `neutral` |
| Esqueletos | `Skeleton` | `#ECEFEC` |
| Etiquetas de campo | `Label` + patrón `Form` (react-hook-form + zod) | Validación según los límites de `SCRIPTS-SQL.md` |
| Barra de progreso del envío | `Progress` | Azul `#1F5FA8` sobre `#E9F0FA` |

---

## 5. Dónde se apartó del brief y por qué

1. **No se usó el sistema de diseño Organic** (crema, terracota, Caprasimo/Figtree), aunque estaba asociado al proyecto. El brief define de forma explícita una dirección visual (verde `#1E6B45`, Inter, radios de 8/6 px, neutros fríos) y tiene prioridad. Si se quisiera Organic, habría que rehacer los tokens de §3.
2. **Colores añadidos que no están en el brief**, siempre derivados de su paleta:
   - Borde de campos `#CFD5D1` en lugar de `#E3E6E3`, para que el borde del control llegue a un contraste ≥ 3:1 (WCAG 1.4.11).
   - Texto ámbar `#8F5500` / `#7A4A00` en lugar de `#B26A00` cuando va sobre `#FFF4E0`, porque `#B26A00` no alcanza 4,5:1 sobre ese fondo. `#B26A00` se mantiene para bordes e iconos.
   - Gris de etapa "Nueva" (`#EEF0EE`/`#3F4943`) y "rojo atenuado" de Perdida (`#F9EDED`/`#9E3A3A`): el brief solo decía "gris" y "rojo atenuado".
   - Hovers neutros (`#F2F4F2`, `#FAFBFA`), esqueleto (`#ECEFEC`), fondo de fila vencida (`#FFFAFA`) y bordes suaves de banners.
3. **Cifras en € de la PWA a 22 px (20 px en Detalle de vendedor)** en lugar de 32 px: en una tarjeta 2 × 2 sobre 390 px de ancho, un importe como "16.425,90 €" no cabe a 32 px. Los recuentos sí van a 32 px.
4. **Cambio rápido de etapa en Oportunidades (5.9)**: al pulsar la etiqueta se abre el diálogo "Cambiar etapa" en lugar de un menú, porque elegir **Perdida** exige el motivo obligatorio (`loss_reason`), que no cabe en un menú.
5. **Acciones de oportunidad en la Ficha (5.7)** dentro de un menú "⋯" (`DropdownMenu`), como pide el brief. Las acciones en línea dejaban sin espacio la columna Título.
6. **Filtro de fecha prevista (5.9)**: se añadió la opción "Cualquier fecha" (seleccionada por defecto) a Esta semana / Este mes / Rango, para que la vista inicial "Abiertas" no oculte nada por fecha.
7. **Filtro Tipo de negocio (5.5)** con la opción "Tipo de negocio: todos" como valor vacío.
8. **Tablero (5.4)**: en "Mis tareas de hoy y vencidas" las vencidas muestran la fecha (`dd/mm/aaaa`) y las de hoy la hora (`HH:mm`). Se añadió el enlace "Ver todas" a Tareas. Con supervisor y "Todos", el título pasa a "Tareas de hoy y vencidas del equipo". El botón principal del Tablero es "Añadir cliente".
9. **Restaurar oportunidad**: el brief solo detalla "Restaurar cliente" (con vendedor). Para oportunidades se usa una confirmación simple ("La oportunidad volverá a verse en las listas del vendedor.") con el botón **Restaurar**.
10. **Cancelar tarea**: texto de confirmación "Se cancelará la tarea «…». Seguirá visible en «Ver cerradas».", con los botones **Cancelar tarea** (peligro atenuado) y **Volver**, para no tener dos botones "Cancelar".
11. **Ficha archivada**: además del banner, se ocultan las acciones Editar / Nueva oportunidad / Nueva tarea / Registrar actividad (solo lectura total).
12. **Detalle de usuario (6.4)**: el nombre se guarda al salir del campo y el rol al cambiarlo (con toast), porque el brief no define un botón Guardar. Hay que confirmarlo con negocio; la alternativa es añadir un botón **Guardar**.
13. **Reasignar (6.5)**: el selector **De** incluye a los vendedores desactivados, marcados "(desactivado)", para poder vaciar la cartera de alguien ya dado de baja. **A** solo muestra activos y distintos del origen, como pide el brief.
14. **Confirmaciones en la PWA** en hoja inferior (`Drawer`) en lugar de diálogo centrado, por ergonomía móvil.
15. **Usuarios (6.4)**: el FAB se desactiva solo cuando **ambos** roles están al límite. Si solo uno está lleno, en Nuevo usuario se desactiva esa opción de rol con el texto "Supervisor no disponible. Límite alcanzado: máximo 2 supervisores activos" (o el equivalente para vendedores).
16. **Indicador "En proceso"**: punto de color + barra de progreso ("Enviando… 4 de 10") en lugar de un spinner.
17. **Detalle del envío (6.6, punto 4)**: se diseñó como pantalla propia ("Detalle del envío") con estado, tipo, solicitado, finalizado, cifras y la lista por vendedor.
18. **Textos de detalle de Auditoría** ("Etapa: Negociación → Ganada · 450,00 €", "Vendedor: Sergio Molina → Ana Martín", "Hora de envío: 08:00 → 07:00"…): son ejemplos de cómo presentar `audit_log.details` (jsonb). El formato real depende de lo que escriban los triggers de `SCRIPTS-SQL.md`.
19. **Prefijos de teléfono**: 10 prefijos europeos (+34 ES, +351 PT, +33 FR, +39 IT, +49 DE, +44 GB, +31 NL, +32 BE, +41 CH, +353 IE) con bandera emoji. La lista final es decisión de producto; el dato guardado siempre es E.164 (`^\+[1-9][0-9]{7,14}$`).

Lo que **no** cambió: ningún campo, lista, estado ni valor se añadió, quitó o renombró respecto a `SCRIPTS-SQL.md`. No hay DNI/NIE/NIF/CIF/pasaporte. La interfaz no usa "eliminar", "borrar" ni "suprimir".

---

## 6. Qué quedó como maqueta (falta conectar)

Todo el prototipo funciona con **datos de ejemplo en memoria** y una fecha fija: **lunes 02/11/2026, 10:15 (Europe/Madrid)**. Nada persiste al recargar. Pendiente de implementar:

### 6.1 Autenticación y sesión
- Acceso con **Supabase Auth** (email + contraseña). En el prototipo, cualquier contraseña de 4 o más caracteres entra, y un email que contenga "desactivad" muestra el aviso de acceso desactivado. Hay que sustituirlo por: error genérico de Auth → "Email o contraseña incorrectos"; `profiles.is_active = false` → "Tu acceso está desactivado. Contacta con tu supervisor".
- Redirección a Cambiar contraseña si `profiles.must_change_password = true`; al guardar, cambiar la contraseña en Auth y llamar a la RPC `mark_password_changed()`. Bloquear cualquier otra ruta mientras sea `true` (solo **Salir**).
- PWA: si `role = 'vendedor'`, mostrar "Esta aplicación es solo para supervisores…" y cerrar sesión con **Salir**.
- "Contraseña actual" incorrecta → mensaje de error (en el prototipo solo se comprueba que no esté vacía).
- Rol (vendedor/supervisor) y permisos según `is_supervisor()` / RLS. En el prototipo, el rol sale de una prop.

### 6.2 Lecturas (vistas de `SCRIPTS-SQL.md`)
| Pantalla | Fuente real |
|---|---|
| KPIs de Tablero, Equipo hoy y Detalle de vendedor | `v_seller_kpis` (`tasks_today`, `tasks_overdue`, `open_opps_count`, `open_opps_amount`, `won_month_amount`); sumar filas para "Todos" / equipo |
| Lista de Clientes | `v_clients_list` (`owner_name`, `open_opps_count`, `last_activity_at`) |
| Oportunidades, Cierres en 7 días, por etapa | `v_opportunities_list` (`client_name`, `client_phone`, `owner_name`, `is_open`) |
| Tareas, Tablero y pestañas | `v_tasks_list` (`bucket`: `hoy` / `vencida` / `proxima` / `cerrada`, calculado en hora de Madrid) |
| Actividad de la ficha | `activities` (solo inserción) |
| Usuarios | `profiles` |
| Resumen | `settings` (fila 1), `summary_runs` (10 últimas), `summary_deliveries` |
| Auditoría | `audit_log`, con nombre del actor desde `profiles` (`actor_id` nulo → "Sistema") |

En el prototipo, el **"Detalle de vendedor"** de la PWA solo tiene datos reales de ejemplo para Ana Martín; para el resto se generan a partir de sus KPIs.

### 6.3 Escrituras y RPC
- Crear y editar cliente, oportunidad, tarea y actividad (`insert`/`update` con RLS). Las actividades no se editan nunca.
- Cambiar etapa: `closed_at` y `loss_reason` los imponen los `check` de la tabla; enviar `loss_reason` solo con `perdida`.
- Marcar tarea como hecha o cancelada (`status`); `completed_at` es automático.
- Archivar / restaurar cliente y oportunidad (solo supervisor; `is_archived`; `archived_at`/`archived_by` automáticos). Restaurar cliente con `owner_id` (vendedor activo).
- **Comprobación del teléfono**: RPC `phone_status(p_phone)` al salir del campo. El prototipo la simula con los datos locales (`libre`, `propio`, `otro_vendedor`, `archivado`, `formato_invalido`). Teléfonos de prueba: +34 611 234 567 (propio), +34 666 789 012 (otro vendedor), +34 699 012 345 (archivado). Además, gestionar el error de unicidad `clients_phone_key` al guardar.
- Reasignar: RPC `reassign_clients(p_from, p_to, p_client_ids)`.
- Envío manual: RPC `request_manual_summary(p_target)` (nulo = todos). La espera mínima sale de `settings.manual_cooldown_minutes`; en el prototipo, el "Disponible en n min" se calcula una vez y no cuenta hacia atrás.
- Ajustes del resumen: `update settings set summary_enabled, summary_hour` (5–11).
- Alta de usuario, cambio de rol, desactivar/reactivar y contraseña temporal: necesitan un **endpoint de servidor con `service_role`** (Supabase Admin API + `create_profile_for_user` / `log_password_reset`). La contraseña temporal del prototipo se genera en el navegador (`XXXX-XXXX-XXXX`); en producción debe generarla el servidor y mostrarse una sola vez.
- Errores reales a mostrar: "Ya existe un usuario con este email" (`profiles_email_key`) y los límites de 10 vendedores / 2 supervisores activos.

### 6.4 Comportamiento no implementado o simulado
- **Estado en vivo del envío** (En cola → En proceso → Completado): en el prototipo es un temporizador. Conectar con Supabase Realtime sobre `summary_runs` o sondeo cada pocos segundos.
- **Paginación de 50 filas**: los botones Anterior / Siguiente están siempre desactivados; falta paginar en servidor.
- **Filtro por rango de fechas** (Oportunidades y Auditoría): los campos de fecha son decorativos.
- **"Cargar más" de Auditoría**: pagina sobre datos locales.
- **Selector "Vendedor: Todos / [nombre]"** del supervisor: filtra los datos locales; en producción debe aplicarse a todas las consultas y mantenerse entre pantallas.
- **Orden de columnas**: solo el orden por defecto (nombre A–Z; fecha prevista ascendente). Las columnas no se pueden reordenar pulsando la cabecera.
- **Deslizar para refrescar (PWA)**: implementación mínima con eventos táctiles; no hay indicador de arrastre.
- **Sin conexión (PWA)**: se activa con una prop. Falta detectar `navigator.onLine` y los errores de red.
- **PWA instalable**: faltan `manifest.webmanifest`, service worker e iconos (cuadrado con "123" en blanco sobre `#1E6B45`; el diseño de ese icono aparece en la pantalla de Acceso de la PWA).
- **Copiar teléfono / contraseña**: usa `navigator.clipboard` sin comprobar permisos.
- **Accesibilidad de teclado**: falta atrapar el foco en diálogos, cerrar con Esc, navegar menús con flechas y cerrar "Más" / "⋯" al pulsar fuera. Los componentes de shadcn/ui (Radix) ya lo resuelven.
- **Zona horaria**: las fechas del prototipo son fechas locales de JS. En producción, introducir y mostrar `due_at` / `occurred_at` en `Europe/Madrid` y guardar `timestamptz`.
- **Validación "no se admite fecha futura"** en actividades: el prototipo compara con la hora fija de la demo; el `check` real admite hasta +5 minutos.
- **Estados de error, vacío, cargando y sin permiso**: se fuerzan con la prop `estadoDatos`; en producción deben depender de las consultas reales.

---

## 7. Interacciones y estados (resumen para implementar)

- **Proceso en ejecución**: el botón cambia a gerundio ("Guardando…", "Archivando…", "Restaurando…", "Cancelando…", "Entrando…", "Creando…", "Reasignando…", "Desactivando…", "Reactivando…", "Asignando…") y se desactiva; los campos quedan bloqueados (`fieldset disabled`).
- **Marcar tarea como hecha**: la fila baja a opacidad 0,5 con "Guardando…" y desaparece tras unos 0,9 s con el toast "Tarea marcada como hecha".
- **Validación de formularios**: al enviar, resumen arriba ("Revisa los campos marcados.") + mensaje bajo cada campo + borde rojo. Mensajes usados: "Escribe el nombre comercial (mínimo 2 caracteres)", "Elige el tipo de negocio", "Escribe la persona de contacto (mínimo 2 caracteres)", "Escribe el teléfono", "Email no válido", "Elige un vendedor", "Escribe un título de al menos 2 caracteres", "Indica un importe igual o mayor que 0", "Elige la fecha prevista de cierre", "Elige el motivo de la pérdida", "Elige un cliente", "Elige fecha y hora", "Escribe una descripción", "La fecha no puede ser futura", "Escribe el nombre completo (mínimo 2 caracteres)".
- **Teléfono**: al salir del campo aparece "Comprobando…" y luego el resultado. Los casos "otro vendedor", "archivado" y "formato inválido" desactivan **Guardar cliente** (opacidad 0,45). Nunca se muestran datos del otro cliente ni del otro vendedor.
- **Toasts usados**: "Cliente guardado", "Oportunidad guardada", "Oportunidad ganada", "Etapa actualizada", "Tarea guardada", "Tarea cancelada", "Tarea marcada como hecha", "Actividad registrada", "Cliente archivado", "Cliente restaurado", "Oportunidad archivada", "Oportunidad restaurada", "Teléfono copiado", "Contraseña actualizada", "Resumen en cola", "Ajustes guardados", "Usuario desactivado", "Usuario reactivado", "Nombre guardado", "Rol actualizado", "Contraseña copiada", "N clientes reasignados a [nombre]".
- **Solo lectura**: oportunidades cerradas (Ganada/Perdida) para el vendedor (filas a opacidad 0,6; el panel muestra "Oportunidad cerrada el dd/mm/aaaa. Solo lectura."); clientes archivados.
- **Vencido**: siempre en rojo **+ icono `Clock` + texto "Vencida"**; el color nunca es la única señal.
- **Responsive (escritorio)**: los KPIs pasan de 4 a 2 × 2, las dos columnas del Tablero y de la Ficha se apilan, y las tablas se desplazan en horizontal dentro de su tarjeta.
- **Animaciones**: ninguna, salvo los cambios de estado. Si se añaden, que sean de 150–200 ms con `ease-out`.

---

## 8. Formatos (helpers a implementar)

- **Euros**: `1.234,56 €`, con separador de miles siempre, también en cifras de 4 dígitos (cuidado: `Intl.NumberFormat('es-ES')` no agrupa los números de 4 cifras por defecto; usar `useGrouping: 'always'` o un formateador propio).
- **Fecha**: `dd/mm/aaaa`; **hora**: `HH:mm`; cabecera de escritorio "Lunes, 02/11/2026"; cabecera de PWA "Lun 02/11".
- **Teléfono**: guardado en E.164 (`+34600123456`) y mostrado en grupos de 3 tras el prefijo (`+34 600 123 456`).
- **Textos de los enumerados**: usar exactamente la tabla 1.1 de `SCRIPTS-SQL.md` (por ejemplo, `pendiente` → "En cola" en `summary_run_status`, pero → "Pendiente" en `task_status` y `delivery_status`).

---

## 9. Props del prototipo (solo para revisar el diseño)

- **Escritorio**: `rol` (`vendedor` | `supervisor`), `estadoDatos` (`datos` | `vacio` | `cargando` | `error` | `sin_permiso`), `pantallaInicial` (`tablero` | `clientes` | `ficha` | `nuevo` | `oportunidades` | `tareas` | `cuenta` | `acceso`), `primerAcceso` (boolean). `estadoDatos = vacio` es la versión del **Hito 2** (indicadores a 0 y listas vacías).
- **PWA**: `pantallaInicial`, `estadoDatos` (`datos` | `vacio` | `cargando` | `error`), `conexion` (boolean), `modoPruebas` (boolean: aviso "Modo pruebas: el correo solo llega al email del titular de la cuenta de Resend."), `primerAcceso` (boolean).

Estas props no existen en el producto: allí los estados salen de los datos reales.
