# TECHNICAL_SPEC.md — Especificación técnica de CRM-123

> **Para Claude Code Web.**
>
> - **Contrato de datos:** `SCRIPTS-SQL.md`. Es la estructura oficial y **no se modifica**.
> - **Reglas de trabajo y seguridad:** `CLAUDE.md`.
> - **Pantallas:** `DESIGN_BRIEF.md`.
> - **Orden de construcción:** `BUILD_PLAN.md`.
>
> Si algo de este documento contradice a `SCRIPTS-SQL.md`, manda `SCRIPTS-SQL.md`: detente y pregunta al humano.

---

## 1. Contexto y alcance

| Elemento | Decisión |
|---|---|
| Marca | **CRM-123** |
| Negocio | Venta al por mayor de frutas y hortalizas a empresas (B2B); ciclo de venta de uno a varios días |
| País / idioma | España / español de España |
| Moneda | Solo euros (EUR); formato `1.234,56 €` |
| Zona horaria | `Europe/Madrid`, con cambio de horario automático. Toda fecha "de hoy" se calcula en hora de Madrid |
| Fechas | `dd/mm/aaaa`; horas `HH:mm` en 24 h |
| Teléfono | Identificador único del cliente, en formato E.164 (`+34600123456`). Selector de prefijo europeo, +34 por defecto |
| Datos prohibidos | DNI, NIE, NIF/CIF, pasaporte y cualquier identificador personal o fiscal. No se piden, no se guardan, no hay campos para ellos |
| Usuarios | 10 vendedores y 2 supervisores como máximo activos (la base de datos lo impone). Usuario = email; contraseña mínima de 10 caracteres |
| Aplicaciones | `/web`: escritorio para vendedores y supervisores. `/pwa`: aplicación móvil instalable, **solo para supervisores** |
| Fuera de alcance | Catálogo de productos, pedidos con líneas, metas de ventas, modo sin conexión, importación/exportación, multi-moneda, multi-idioma, modo oscuro, autorregistro, recuperación de contraseña por correo |

## 2. Arquitectura

```
 Vendedores (ordenador)          Supervisores (móvil)
          │                               │
   ┌──────▼──────┐                 ┌──────▼──────┐
   │ crm-123-web │                 │ crm-123-pwa │      (Vercel, despliegue manual
   │  Next.js    │                 │  Next.js    │       desde la rama gh-crm-123)
   │  /api/n8n/* │                 │  Server     │
   └──────┬──────┘                 │  Actions    │
          │  Supabase JS (sesión del usuario, RLS)   │
          └───────────────┬────────────────────┘
                   ┌──────▼──────┐
                   │  Supabase   │  proyecto dbcrm123 · Org CRM 123 · UE (Fráncfort)
                   │ Postgres+Auth│
                   └──────▲──────┘
                          │ service_role (solo en el servidor de crm-123-web)
   ┌──────────────────────┴───────┐
   │ n8n LOCAL (Docker, ordenador │ ── cada 5 min: POST /api/n8n/summary/claim
   │ de la empresa) WF-CRM123     │ ── por destinatario: POST api.resend.com/emails
   │ sin puertos abiertos         │ ── por destinatario: POST /api/n8n/summary/report
   └──────────────────────────────┘
```

**Principios**

1. **La seguridad de los datos vive en la base de datos.** RLS, triggers y funciones (ver `SCRIPTS-SQL.md`). La aplicación es una segunda capa, no la única.
2. **Lecturas y escrituras de usuario con la sesión del usuario.** Se usa la clave anónima más la cookie de sesión, así que RLS siempre aplica. La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en estos casos:
   - **Web:** endpoints `/api/n8n/*`.
   - **PWA:** Server Actions de gestión de usuarios (crear usuario en Auth, asignar contraseña temporal, bloquear o desbloquear el acceso, crear perfil).
3. **n8n nunca toca Postgres.** Habla solo con `crm-123-web/api/n8n/*` y con Resend.
4. **n8n local no expone nada a internet.** Solo hace llamadas salientes. El envío manual desde la PWA se deja en cola en la base de datos y n8n lo recoge en ≤ 5 minutos.

## 3. Stack

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | Next.js (versión estable actual, App Router) + TypeScript estricto | Estándar con Vercel; separa servidor y cliente |
| UI | Tailwind CSS + shadcn/ui (componentes copiados al proyecto) | Componentes estándar y accesibles |
| Iconos | lucide-react | Incluido con shadcn/ui |
| Tipografía | Inter (`next/font/google`) | Legible en tablas densas |
| Datos y Auth | `@supabase/supabase-js` + `@supabase/ssr` | Sesión en cookies; RLS |
| Validación | Zod | Valida en el servidor todo lo que llega |
| Formularios | react-hook-form + `@hookform/resolvers/zod` | Estándar con shadcn/ui |
| Fechas | `date-fns` + `@date-fns/tz` (`Europe/Madrid`) | Convertir hora de Madrid ↔ UTC sin errores |
| Teléfono | `libphonenumber-js` (metadatos mínimos) | Validar y normalizar a E.164 por país |
| Correo | Resend, llamado **desde n8n** | La app no envía correo |
| Automatización | n8n local en Docker Desktop | Decisión del cliente |
| Alojamiento | Vercel: proyectos `crm-123-web` (raíz `/web`) y `crm-123-pwa` (raíz `/pwa`) | Despliegue manual |
| Repositorio | GitHub; rama de trabajo única **`gh-crm-123`** | Decisión del cliente |

No se añaden más dependencias sin una razón explícita en el commit. Prohibido: ORMs, librerías de estado global, clientes Postgres directos (`pg`, `postgres`), librerías de analítica o seguimiento.

## 4. Estructura del repositorio (rama `gh-crm-123`)

```
/
├── CLAUDE.md
├── TECHNICAL_SPEC.md
├── DESIGN_BRIEF.md
├── BUILD_PLAN.md
├── SCRIPTS-SQL.md
├── web/                              # Escritorio (vendedores y supervisores)
│   ├── app/
│   │   ├── (auth)/acceso/page.tsx
│   │   ├── (auth)/cambiar-contrasena/page.tsx
│   │   ├── (app)/layout.tsx          # armazón: barra lateral + cabecera
│   │   ├── (app)/page.tsx            # Tablero del día
│   │   ├── (app)/clientes/page.tsx
│   │   ├── (app)/clientes/nuevo/page.tsx
│   │   ├── (app)/clientes/[id]/page.tsx
│   │   ├── (app)/clientes/[id]/editar/page.tsx
│   │   ├── (app)/oportunidades/page.tsx
│   │   ├── (app)/tareas/page.tsx
│   │   ├── (app)/mi-cuenta/page.tsx
│   │   ├── sin-permiso/page.tsx
│   │   ├── api/n8n/health/route.ts
│   │   ├── api/n8n/summary/claim/route.ts
│   │   └── api/n8n/summary/report/route.ts
│   ├── components/                   # ui/ (shadcn) + componentes propios
│   ├── lib/
│   │   ├── supabase/server.ts        # cliente con cookies (sesión del usuario)
│   │   ├── supabase/browser.ts       # cliente navegador (clave anónima)
│   │   ├── supabase/admin.ts         # import 'server-only'; service role
│   │   ├── auth/require-profile.ts   # usuario + perfil desde profiles
│   │   ├── n8n/verify-secret.ts      # import 'server-only'; timingSafeEqual
│   │   ├── summary/render-email.ts   # import 'server-only'; HTML del resumen
│   │   ├── database.types.ts         # tipos escritos a partir de SCRIPTS-SQL.md
│   │   ├── labels.ts                 # textos de los enums (SCRIPTS-SQL §1.1)
│   │   ├── format.ts                 # euros, fechas y horas en Madrid
│   │   ├── errors.ts                 # traducción de errores de Postgres
│   │   └── validation/*.ts           # esquemas Zod
│   ├── middleware.ts                 # (o proxy.ts según la versión de Next.js)
│   ├── n8n/WF-CRM123.json            # flujo para importar en n8n local (Hito 4)
│   ├── vercel.json
│   └── .env.example                  # solo nombres de variables, sin valores
└── pwa/                              # Supervisores (móvil, instalable)
    ├── app/
    │   ├── (auth)/acceso/page.tsx
    │   ├── (auth)/cambiar-contrasena/page.tsx
    │   ├── (app)/layout.tsx          # armazón: barra inferior de pestañas
    │   ├── (app)/page.tsx            # Equipo hoy
    │   ├── (app)/vendedores/[id]/page.tsx
    │   ├── (app)/usuarios/page.tsx
    │   ├── (app)/usuarios/nuevo/page.tsx
    │   ├── (app)/usuarios/[id]/page.tsx
    │   ├── (app)/reasignar/page.tsx
    │   ├── (app)/auditoria/page.tsx
    │   ├── (app)/resumen/page.tsx
    │   ├── (app)/mas/page.tsx
    │   ├── (app)/mi-cuenta/page.tsx
    │   ├── sin-permiso/page.tsx
    │   ├── manifest.ts
    │   └── offline/page.tsx          # (estática) "Sin conexión"
    ├── public/sw.js                  # service worker mínimo (solo página sin conexión)
    ├── public/icons/…                # 192, 512 y maskable
    ├── components/  lib/ (misma organización que web, sin n8n/summary)
    ├── middleware.ts
    ├── vercel.json
    └── .env.example
```

Las dos aplicaciones son **independientes**: el código común se duplica a propósito, por simplicidad y sin herramientas de monorepo.

## 5. Modelo de datos

La definición completa está en **`SCRIPTS-SQL.md` §1 a §9**. Resumen operativo para el código:

| Tabla o vista | Lee | Escribe desde la app |
|---|---|---|
| `profiles` | propio perfil (vendedor); todos (supervisor) | supervisor: `full_name`, `role`, `is_active`. Alta: solo con `create_profile_for_user` vía service role |
| `clients` | `v_clients_list` | insert y update de las columnas concedidas; archivar y reasignar, solo el supervisor |
| `opportunities` | `v_opportunities_list` | insert y update (título, descripción, importe, etapa, fecha prevista, motivo y nota de pérdida); archivar, solo el supervisor |
| `tasks` | `v_tasks_list` | insert y update (título, vencimiento, estado, oportunidad) |
| `activities` | tabla `activities` | **solo insert** |
| `audit_log` | supervisor | nunca (la escriben triggers y funciones) |
| `settings` | todos los autenticados | supervisor: `summary_enabled`, `summary_hour` |
| `summary_runs` / `summary_deliveries` | supervisor | nunca directamente (RPC y endpoints n8n) |
| `v_seller_kpis` | indicadores (RLS: vendedor = su fila) | — |

**Tipos TypeScript:** `lib/database.types.ts` se escribe a mano a partir de `SCRIPTS-SQL.md`, con tablas, vistas, enums y argumentos de las RPC, en ambas apps. Debe coincidir exactamente en nombres y tipos.

**Textos en pantalla de los enums:** `SCRIPTS-SQL.md` §1.1, centralizados en `lib/labels.ts`.

## 6. Reglas de seguridad por fila (RLS)

Las implementa la base de datos. La app debe conocerlas para no ofrecer acciones imposibles:

| Regla | Efecto en la interfaz |
|---|---|
| El vendedor solo ve sus clientes, y las oportunidades y tareas suyas o de sus clientes | No hay filtro por vendedor para él |
| El vendedor no reasigna, no archiva y no modifica oportunidades cerradas ni tareas hechas o canceladas | Ocultar esas acciones; los cerrados se muestran en solo lectura |
| Cliente archivado: el vendedor no puede editarlo ni crear nada en él | El vendedor no ve archivados (filtro `is_archived = false`) |
| `activities` y `audit_log` solo de inserción | No existe "editar actividad" |
| Nadie borra nada | No existe ninguna acción de borrado. Verbos permitidos: Archivar, Restaurar, Desactivar, Reactivar, Cancelar, Marcar como hecha |
| Un vendedor desactivado no ve nada | El middleware cierra su sesión y muestra "Tu acceso está desactivado. Contacta con tu supervisor" |
| Límites: 10 vendedores y 2 supervisores activos; debe quedar ≥ 1 supervisor activo; no se puede desactivar a un vendedor con clientes activos; nadie cambia su propio rol ni se desactiva | Mostrar el mensaje de error de la base de datos tal cual (está en español) |
| Teléfono único (incluidos los archivados) | Antes de guardar, llamar a `phone_status` y mostrar el aviso correspondiente |

## 7. Autenticación, sesión y control de acceso

1. **Acceso:** `supabase.auth.signInWithPassword({ email, password })`. Ante cualquier error se muestra un mensaje genérico, "Email o contraseña incorrectos", sin detallar la causa.
2. **En cada petición al servidor**, ya sea middleware, página de servidor, Server Action o Route Handler:
   - Validar al usuario con `supabase.auth.getUser()`. Nunca con `getSession()` en el servidor.
   - **Leer el rol y el estado de la tabla `profiles`** (`select role, is_active, must_change_password, full_name from profiles where id = user.id`). Nunca del JWT, de `user_metadata` ni de nada enviado por el cliente.
3. **Middleware de `/web`:**
   - Sin sesión → `/acceso`.
   - Sin perfil o `is_active = false` → cerrar sesión y redirigir a `/acceso?motivo=desactivado`.
   - `must_change_password = true` → `/cambiar-contrasena` (única ruta permitida, junto con salir).
   - Roles permitidos: `vendedor` y `supervisor`.
4. **Middleware de `/pwa`:** igual que el de `/web`, pero **solo `supervisor`**. Un vendedor que inicia sesión ve `/sin-permiso` ("Esta aplicación es solo para supervisores. Usa CRM-123 en el ordenador.") y se cierra su sesión.
5. **Cambio de contraseña:** primer acceso y "Mi cuenta".
   - Pedir la contraseña actual y verificarla con `signInWithPassword`.
   - Validar la nueva: mínimo 10 caracteres, distinta de la actual, repetida igual.
   - `supabase.auth.updateUser({ password })` y después `rpc('mark_password_changed')`.
6. **Doble verificación en las Server Actions:** cada acción repite la comprobación de rol leyendo `profiles`, aunque el middleware ya la haya hecho.
7. **Configuración de Supabase Auth** (la hace el humano en el Hito 1):
   - Registro público desactivado.
   - Longitud mínima de contraseña: 10.
   - Proveedor Email activo.
   - No se usan correos de confirmación ni de recuperación.
8. **Privacidad:** sin analítica, sin cookies de terceros. Solo las cookies de sesión de Supabase. En `/acceso`, el texto "Uso interno de CRM-123. Acceso solo para personal autorizado."

## 8. Funcionalidad y endpoints por aplicación

Convenciones:

- Las **mutaciones** se hacen con **Server Actions** que validan con Zod, comprueban el rol leyendo `profiles` y usan el cliente con la sesión del usuario.
- Las **lecturas** se hacen en componentes de servidor, con el cliente de sesión.
- Paginación del servidor: **50 filas** por página.
- Todas las respuestas de error al usuario pasan por `lib/errors.ts`.

### 8.1 `/web` — escritorio

| Ruta | Datos | Acciones (Server Actions) |
|---|---|---|
| `/acceso` | — | `signIn` |
| `/cambiar-contrasena` | — | `changePassword` |
| `/` Tablero del día | `v_seller_kpis` (vendedor: su fila; supervisor: suma de todas o la del vendedor filtrado); `v_tasks_list` con `bucket in ('hoy','vencida')`, ordenado por `due_at`; `v_opportunities_list` con `is_open` y `expected_close_date` entre hoy y hoy + 7 | `completeTask(id)` |
| `/clientes` | `v_clients_list`; búsqueda por `trade_name` (ilike) o por dígitos de `phone`; filtro de tipo de negocio; supervisor: filtro de vendedor y casilla "Mostrar archivados" | — |
| `/clientes/nuevo` | — | `checkPhone(phone)` → `rpc('phone_status')`; `createClient(data)` (supervisor: `owner_id` obligatorio, elegido entre vendedores activos) |
| `/clientes/[id]` | cliente; sus oportunidades (`v_opportunities_list`); tareas (`v_tasks_list`); actividades (`activities` ordenadas por `occurred_at desc`, con el nombre del autor si es visible) | `createOpportunity`, `updateOpportunity`, `changeStage(id, stage, loss_reason?, loss_note?)`, `createTask`, `completeTask`, `cancelTask`, `createActivity`. Solo supervisor: `archiveClient`, `restoreClient(id, owner_id)`, `archiveOpportunity`, `restoreOpportunity` |
| `/clientes/[id]/editar` | cliente | `updateClient` (revalida el teléfono si cambia) |
| `/oportunidades` | `v_opportunities_list`; filtros de etapa (por defecto: abiertas), fecha prevista y vendedor (supervisor); orden por fecha prevista | `changeStage`, `updateOpportunity` |
| `/tareas` | `v_tasks_list`; pestañas Hoy (`bucket = 'hoy'`), Vencidas (`'vencida'`) y Próximas (`'proxima'`) | `createTask`, `completeTask`, `cancelTask` |
| `/mi-cuenta` | perfil | `changePassword` |

Reglas de negocio en la interfaz:

- **"Perdida"** abre un diálogo con el **motivo obligatorio** (`loss_reason`) y una nota opcional.
- **Fecha y hora de las tareas:** se introducen en hora de Madrid y se convierten a UTC con `@date-fns/tz` antes de guardar.
- **Importes:** se aceptan `1234,5` o `1.234,50` y se normalizan a número con 2 decimales.
- **Teléfono:**
  - Selector de país europeo, +34 por defecto, más el número nacional.
  - Se valida con `libphonenumber-js` y se guarda en E.164.
  - Al salir del campo se consulta `phone_status`:

| Respuesta | Qué muestra la interfaz |
|---|---|
| `propio` | "Este cliente ya está en tu cartera", con enlace a buscarlo |
| `otro_vendedor` | "Este cliente ya está asignado. Contacta con tu supervisor" |
| `archivado` | "Este teléfono pertenece a un cliente archivado. Contacta con tu supervisor" |
| `formato_invalido` | "Teléfono no válido" |

### 8.2 `/pwa` — supervisor

| Ruta | Datos | Acciones |
|---|---|---|
| `/` Equipo hoy | `v_seller_kpis` (totales y una fila por vendedor activo); estado del último `summary_runs` | — |
| `/vendedores/[id]` | `v_seller_kpis` de ese vendedor; `v_opportunities_list` abiertas por etapa; `v_tasks_list` de hoy y vencidas | — |
| `/usuarios` | `profiles` (activos e inactivos), con rol y estado | — |
| `/usuarios/nuevo` | — | `createUser` (ver §8.3) |
| `/usuarios/[id]` | perfil | `updateUserName`, `changeRole`, `deactivateUser`, `reactivateUser`, `setTemporaryPassword` |
| `/reasignar` | vendedores activos; clientes del vendedor de origen (`v_clients_list`, no archivados) | `reassignClients(from, to, clientIds \| null)` → `rpc('reassign_clients')` |
| `/auditoria` | `audit_log` (50 por página), con filtros de acción, usuario y rango de fechas; nombres resueltos desde `profiles` | — |
| `/resumen` | `settings`; los 10 últimos `summary_runs`; detalle de `summary_deliveries` de una ejecución | `updateSummarySettings(enabled, hour)`; `requestManualSummary(target \| null)` → `rpc('request_manual_summary')` |
| `/mas` | enlaces a Reasignar, Auditoría, Mi cuenta y Salir | `signOut` |

### 8.3 Gestión de usuarios (PWA, Server Actions con service role)

Todas las acciones empiezan igual: `getUser()`, lectura de `profiles` y verificación de que el usuario es `supervisor` activo. Si no lo es, se responde 403.

| Acción | Pasos |
|---|---|
| `createUser(full_name, email, role)` | 1. Validar con Zod (email en minúsculas). 2. Comprobar con la sesión del usuario que no existe un perfil con ese email. 3. Generar una contraseña temporal aleatoria de 14 caracteres con `crypto.randomInt`. 4. `admin.auth.admin.createUser({ email, password, email_confirm: true })`. 5. `admin.rpc('create_profile_for_user', { p_user_id, p_full_name, p_email, p_role, p_actor_id: supervisor.id })`. 6. **Si el paso 5 falla**, no se borra nada: se bloquea el usuario de Auth con `admin.auth.admin.updateUserById(id, { ban_duration: '876000h' })` y se muestra el error. 7. Mostrar **una sola vez** la contraseña temporal, con un botón "Copiar". Nunca se guarda ni se registra en logs |
| `setTemporaryPassword(user_id)` | 1. `admin.rpc('log_password_reset', { p_actor_id, p_user_id })`. 2. `admin.auth.admin.updateUserById(user_id, { password })`. 3. Mostrar la contraseña una sola vez |
| `deactivateUser(user_id)` | 1. Con la **sesión del usuario**, `update profiles set is_active=false`. La base de datos valida las reglas y audita. 2. `admin.auth.admin.updateUserById(user_id, { ban_duration: '876000h' })` |
| `reactivateUser(user_id)` | 1. Con la sesión, `update profiles set is_active=true`. 2. `admin.auth.admin.updateUserById(user_id, { ban_duration: 'none' })` |
| `changeRole` / `updateUserName` | Con la sesión del usuario; la base de datos valida y audita |

### 8.4 Endpoints para n8n (solo en `/web`)

Reglas comunes a todos los endpoints:

| Regla | Detalle |
|---|---|
| Ubicación | `app/api/n8n/**/route.ts`, con `export const runtime = 'nodejs'` y `export const dynamic = 'force-dynamic'` |
| Autenticación | Cabecera **`x-crm123-secret`** comparada con `N8N_SHARED_SECRET` mediante `crypto.timingSafeEqual` sobre los SHA-256 de ambos valores. Así se igualan las longitudes y nunca se usa `===`. Si falla: **401** `{"error":"No autorizado"}`, sin más detalle |
| Cuerpo | Solo `Content-Type: application/json`. Tamaño máximo 10 KB (→ 413). Validación Zod (→ 400) |
| Acceso a datos | Cliente **service role** de `lib/supabase/admin.ts` (`import 'server-only'`), solo con las RPC indicadas. Ninguna consulta libre a tablas |
| Respuesta | Cabecera `Cache-Control: no-store`. Los errores internos se registran en el servidor sin secretos ni datos personales y responden **500** `{"error":"Error interno"}` |
| Métodos | Cualquier otro método responde **405** |

**`GET /api/n8n/health`**: prueba de conexión desde n8n. Responde `200 {"ok":true,"time":"<ISO>"}`.

**`POST /api/n8n/summary/claim`**

- **Cuerpo:** `{}` (se ignora su contenido).
- **Proceso:**
  1. Llamar a `rpc('claim_summary_run')`.
  2. Por cada destinatario, generar `subject` y `html` con `lib/summary/render-email.ts` y añadir `from = RESEND_FROM`.
- **Respuesta 200 sin trabajo:** `{"run_id": null, "recipients": []}`
- **Respuesta 200 con trabajo:**
```json
{
  "run_id": "uuid",
  "trigger_type": "programado",
  "run_date": "02/11/2026",
  "recipients": [
    {
      "run_id": "uuid",
      "profile_id": "uuid",
      "email": "vendedor@empresa.es",
      "from": "CRM-123 <onboarding@resend.dev>",
      "subject": "CRM-123 · Tu resumen del lunes 02/11/2026",
      "html": "<!doctype html>…"
    }
  ]
}
```
- **Contenido del HTML:**
  - Saludo "Buenos días, {full_name}".
  - Secciones:
    - "Tareas de hoy" (hora · título · cliente).
    - "Tareas vencidas" (fecha · título · cliente), en rojo.
    - "Cierres previstos en 7 días" (fecha · título · cliente · importe en €).
    - "Total en oportunidades abiertas: X €".
  - Si no hay nada: **"Sin pendientes hoy"**.
  - Botón "Abrir CRM-123" que enlaza a `CRM_WEB_URL`.
  - Pie: "Mensaje automático de CRM-123. No respondas a este correo."
  - **Todo texto procedente de datos se escapa en HTML.** CSS en línea, ancho máximo de 600 px, sin imágenes externas.

**`POST /api/n8n/summary/report`**

- **Cuerpo:**
```json
{ "run_id": "uuid", "profile_id": "uuid", "ok": true, "provider_message_id": "re_… | null", "error_message": "texto | null" }
```
- **Proceso:** `rpc('record_summary_delivery', { p_run_id, p_profile_id, p_ok, p_provider_message_id, p_error })`.
- **Respuestas:**
  - **200** `{"run_id","enviados","fallidos","estado"}`.
  - **409** `{"error":"<mensaje de la base de datos>"}` si la ejecución no está en proceso o el destinatario ya se informó (error `P0001` de la base de datos).

## 9. Resumen matutino: lógica

| Parámetro (en `settings`) | Valor |
|---|---|
| Activado | `summary_enabled` (PWA) |
| Hora | `summary_hour`, de 5 a 11, en horas en punto, hora de Madrid (PWA) |
| Días | `summary_days` = L–S (fijo en esta versión; no se muestra en la PWA) |
| Ventana de recuperación | hasta `recovery_until_hour` = 12:00 |
| Espera entre envíos manuales | `manual_cooldown_minutes` = 10 |
| Destinatarios | Vendedores activos (los supervisores no reciben) |

Funcionamiento (todo está en `claim_summary_run`, ver `SCRIPTS-SQL.md`):

1. n8n pregunta cada 5 minutos.
2. Primero se atienden los envíos **manuales** en cola.
3. Si no hay ninguno: si el resumen está activado, el día está incluido, la hora de Madrid es ≥ `summary_hour` y aún no hay un envío programado ese día, se crea uno. Si ya son las 12:00 o más, se registra como **Omitido** y no se envía.
4. Nunca hay dos envíos programados el mismo día (índice único en la base de datos).
5. Una ejecución que no recibe confirmación de n8n en 30 minutos pasa a **Fallido**.
6. El envío manual funciona aunque el programado esté desactivado.

## 10. Disparo manual de la automatización: protección paso a paso

| # | Dónde | Qué ocurre y cómo se protege |
|---|---|---|
| 1 | PWA, `/resumen` | El supervisor pulsa "Enviar resumen ahora", elige "Todos los vendedores" o uno, y **confirma** en un diálogo. El botón queda desactivado mientras se procesa (evita doble pulsación) |
| 2 | PWA, Server Action `requestManualSummary` | Corre **solo en el servidor**. La PWA no conoce ninguna clave de n8n ni la service role para esta acción |
| 3 | Server Action | `supabase.auth.getUser()` valida la sesión contra Supabase. Sin usuario → 401 |
| 4 | Server Action | Lee `role` e `is_active` de **`profiles`**. Si no es supervisor activo → 403. Nunca confía en el JWT ni en datos del cliente |
| 5 | Server Action | Zod valida `target`: uuid o `null` (todos) |
| 6 | Base de datos, `rpc('request_manual_summary')` con la **sesión del usuario** | La función (security definer, `search_path = public`): **(a)** vuelve a comprobar que es supervisor con `is_supervisor()`, que lee `profiles`; **(b)** bloquea la fila de `settings` para serializar solicitudes simultáneas; **(c)** valida que el destinatario sea un vendedor activo; **(d)** exige **10 minutos** desde el último envío manual; **(e)** inserta la ejecución `manual`/`pendiente`; **(f)** escribe `resumen.solicitado` en `audit_log` |
| 7 | PWA | Muestra "En cola · se enviará en un máximo de 5 minutos" y refresca el estado cada 15 s mientras esté en cola o en proceso |
| 8 | n8n local → `POST /api/n8n/summary/claim` | Petición **saliente** desde la red de la empresa; n8n no expone puertos. Lleva la cabecera `x-crm123-secret` |
| 9 | Web, Route Handler | Compara el secreto con `crypto.timingSafeEqual` (SHA-256 de ambos). Solo acepta POST JSON de ≤ 10 KB. Usa la service role **solo en el servidor** y solo para `claim_summary_run` |
| 10 | Base de datos, `claim_summary_run` (solo `service_role`) | Toma la ejecución con `for update skip locked` (nunca dos veces), crea un registro de entrega `pendiente` por destinatario, la marca `en_proceso` y devuelve los datos |
| 11 | n8n → Resend | n8n envía cada correo con **su propia** API key de Resend, guardada solo en una credencial de n8n, nunca en Vercel ni en el repositorio. Un envío cada 0,7 s |
| 12 | n8n → `POST /api/n8n/summary/report` | Mismo secreto. `record_summary_delivery` solo acepta destinatarios de esa ejecución que sigan `pendiente`, así que una repetición o un intento de falsificación se rechaza con 409. La ejecución se cierra como Completado, Con errores o Fallido, y se audita como `resumen.finalizado` |
| 13 | PWA | Muestra el estado final (enviados y fallidos) y el detalle por vendedor |

**Rotación del secreto:** cambiar `N8N_SHARED_SECRET` en Vercel (`crm-123-web`), redesplegar y actualizar la credencial en n8n. Se recomienda rotarlo cada 6 meses o ante cualquier sospecha.

## 11. Flujo n8n `WF-CRM123`

Se entrega en el Hito 4 como `web/n8n/WF-CRM123.json`, para importarlo manualmente en el n8n local.

| # | Nodo (nombre exacto) | Tipo | Configuración |
|---|---|---|---|
| 1 | `Cada 5 minutos` | Schedule Trigger | cada 5 minutos; zona horaria del flujo `Europe/Madrid` |
| 2 | `Pedir envío pendiente` | HTTP Request | POST `{CRM_WEB_URL}/api/n8n/summary/claim`; autenticación Header Auth con la credencial **"CRM-123 secreto n8n"** (nombre `x-crm123-secret`); cuerpo JSON `{"source":"WF-CRM123"}`; timeout de 30 s |
| 3 | `¿Hay destinatarios?` | IF | `{{ ($json.recipients \|\| []).length }}` > 0 |
| 4 | `Separar destinatarios` | Split Out | campo `recipients` |
| 5 | `Enviar con Resend` | HTTP Request | POST `https://api.resend.com/emails`; Header Auth con la credencial **"Resend API"** (nombre `Authorization`, valor `Bearer re_…`); cuerpo `{ from, to:[email], subject, html }`; lotes de 1 cada 700 ms; respuesta "Never Error" para poder informar los fallos |
| 6 | `Informar resultado` | HTTP Request | POST `{CRM_WEB_URL}/api/n8n/summary/report`; credencial "CRM-123 secreto n8n"; cuerpo con `run_id` y `profile_id` (tomados de `Separar destinatarios`), `ok` = existe `id` en la respuesta de Resend, `provider_message_id` = `id`, `error_message` = `message` de Resend |

JSON de referencia. Claude Code lo genera con esta estructura y sustituye `REEMPLAZAR_CRM_WEB_URL` solo con un marcador evidente. El humano pone la URL real al importar:

```json
{
  "name": "WF-CRM123",
  "nodes": [
    { "parameters": { "rule": { "interval": [ { "field": "minutes", "minutesInterval": 5 } ] } },
      "id": "a1f0c001-0000-4000-8000-000000000001", "name": "Cada 5 minutos",
      "type": "n8n-nodes-base.scheduleTrigger", "typeVersion": 1.2, "position": [0, 0] },
    { "parameters": { "method": "POST", "url": "https://REEMPLAZAR_CRM_WEB_URL/api/n8n/summary/claim",
        "authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth",
        "sendBody": true, "specifyBody": "json", "jsonBody": "{\"source\":\"WF-CRM123\"}",
        "options": { "timeout": 30000 } },
      "id": "a1f0c001-0000-4000-8000-000000000002", "name": "Pedir envío pendiente",
      "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [240, 0] },
    { "parameters": { "conditions": { "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "loose" },
          "conditions": [ { "id": "c0000001-0000-4000-8000-000000000001",
            "leftValue": "={{ ($json.recipients || []).length }}", "rightValue": 0,
            "operator": { "type": "number", "operation": "gt" } } ], "combinator": "and" }, "options": {} },
      "id": "a1f0c001-0000-4000-8000-000000000003", "name": "¿Hay destinatarios?",
      "type": "n8n-nodes-base.if", "typeVersion": 2, "position": [480, 0] },
    { "parameters": { "fieldToSplitOut": "recipients", "options": {} },
      "id": "a1f0c001-0000-4000-8000-000000000004", "name": "Separar destinatarios",
      "type": "n8n-nodes-base.splitOut", "typeVersion": 1, "position": [720, -20] },
    { "parameters": { "method": "POST", "url": "https://api.resend.com/emails",
        "authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth",
        "sendBody": true, "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ from: $json.from, to: [$json.email], subject: $json.subject, html: $json.html }) }}",
        "options": { "batching": { "batch": { "batchSize": 1, "batchInterval": 700 } },
                     "response": { "response": { "neverError": true } }, "timeout": 30000 } },
      "id": "a1f0c001-0000-4000-8000-000000000005", "name": "Enviar con Resend",
      "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [960, -20] },
    { "parameters": { "method": "POST", "url": "https://REEMPLAZAR_CRM_WEB_URL/api/n8n/summary/report",
        "authentication": "genericCredentialType", "genericAuthType": "httpHeaderAuth",
        "sendBody": true, "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ run_id: $('Separar destinatarios').item.json.run_id, profile_id: $('Separar destinatarios').item.json.profile_id, ok: Boolean($json.id), provider_message_id: $json.id || null, error_message: $json.id ? null : String($json.message || $json.error || 'Error desconocido').slice(0, 500) }) }}",
        "options": { "timeout": 30000 } },
      "id": "a1f0c001-0000-4000-8000-000000000006", "name": "Informar resultado",
      "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [1200, -20] }
  ],
  "connections": {
    "Cada 5 minutos": { "main": [ [ { "node": "Pedir envío pendiente", "type": "main", "index": 0 } ] ] },
    "Pedir envío pendiente": { "main": [ [ { "node": "¿Hay destinatarios?", "type": "main", "index": 0 } ] ] },
    "¿Hay destinatarios?": { "main": [ [ { "node": "Separar destinatarios", "type": "main", "index": 0 } ], [] ] },
    "Separar destinatarios": { "main": [ [ { "node": "Enviar con Resend", "type": "main", "index": 0 } ] ] },
    "Enviar con Resend": { "main": [ [ { "node": "Informar resultado", "type": "main", "index": 0 } ] ] }
  },
  "active": false,
  "settings": { "executionOrder": "v1", "timezone": "Europe/Madrid" },
  "pinData": {}
}
```

El JSON **no contiene secretos**. Las dos credenciales se crean a mano en n8n y se seleccionan en los nodos 2, 5 y 6 tras importar.

**n8n local con Docker Desktop:**

1. Instalar Docker Desktop y activar "Start Docker Desktop when you sign in".
2. Ejecutar en una terminal:
```
docker volume create n8n_data
docker run -d --name n8n --restart unless-stopped -p 127.0.0.1:5678:5678 \
  -e GENERIC_TIMEZONE=Europe/Madrid -e TZ=Europe/Madrid \
  -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```
3. Abrir `http://localhost:5678`. El puerto queda ligado solo a `127.0.0.1`, así que no es accesible desde otros equipos.

## 12. Variables de entorno

| Variable | App | Tipo | Valor / cómo se obtiene | Desde |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | web, pwa | pública | Supabase → Project Settings → Data API → Project URL. En el Hito 1 la entrega Claude.ai con `get_project_url` | Hito 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web, pwa | pública (protegida por RLS) | Supabase → Project Settings → API Keys → clave `anon` (o la *publishable* `sb_publishable_…`). Claude.ai la entrega con `get_publishable_keys` / `get_anon_key` | Hito 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | web, pwa | **secreta, solo servidor** | Supabase → Project Settings → API Keys → `service_role` (o la *secret* `sb_secret_…`). La copia el humano; nunca se pega en un chat | Hito 4 |
| `N8N_SHARED_SECRET` | web | **secreta** | Cadena aleatoria de ≥ 48 caracteres (letras y números) creada con un gestor de contraseñas. El mismo valor va en la credencial "CRM-123 secreto n8n" | Hito 4 |
| `RESEND_FROM` | web | configuración | `CRM-123 <onboarding@resend.dev>`. En producción, cambiar por un remitente del dominio verificado, sin tocar código | Hito 4 |
| `CRM_WEB_URL` | web | configuración | URL de producción de `crm-123-web`, por ejemplo `https://crm-123-web.vercel.app`, sin barra final | Hito 4 |

**Fuera de Vercel (credenciales de n8n):**

- "CRM-123 secreto n8n": Header Auth, `x-crm123-secret` = `N8N_SHARED_SECRET`.
- "Resend API": Header Auth, `Authorization` = `Bearer re_…`. Se obtiene en resend.com → API Keys → Create API Key, con permiso *Sending access*.

**Reglas:**

- `.env.example` solo lleva nombres, sin valores.
- `.env*` va en `.gitignore`.
- Las variables `NEXT_PUBLIC_*` nunca contienen secretos.
- La app comprueba al arrancar en el servidor que existen las variables que necesita y falla con un mensaje claro si falta alguna, sin imprimir sus valores.

## 13. Formatos, validaciones y mensajes

- **Euros:** `new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' })` → `1.234,56 €`.
- **Fechas y horas:** siempre en `Europe/Madrid`, en formato `dd/MM/yyyy` y `HH:mm`.
- **Zod:** espejo exacto de las restricciones de `SCRIPTS-SQL.md`: longitudes, formato de email en minúsculas, teléfono E.164, `amount ≥ 0` con 2 decimales, motivo obligatorio para "Perdida".
- **Traducción de errores** (`lib/errors.ts`):

| Código de Postgres | Mensaje al usuario |
|---|---|
| `23505` en `clients_phone_key` | "Ya existe un cliente con este teléfono" |
| `23505` en `profiles_email_key` | "Ya existe un usuario con este email" |
| `23514` (check) | "Revisa los datos del formulario" |
| `42501` | El mensaje de la base de datos si está en español; si no, "No tienes permiso para esta acción" |
| `P0001` | El mensaje de la base de datos (ya está en español) |
| Otro | "No se ha podido completar la acción. Inténtalo de nuevo" |

- **Palabras prohibidas en la interfaz:** "eliminar", "borrar", "suprimir".

## 14. PWA

- **`manifest.ts`:**
  - `name`: "CRM-123 Supervisor"
  - `short_name`: "CRM-123"
  - `lang`: "es-ES"
  - `start_url`: "/"
  - `display`: "standalone"
  - `theme_color`: `#1E6B45`
  - `background_color`: `#F7F8F7`
  - Iconos de 192 y 512 px, más uno maskable.
- **`public/sw.js`:**
  - Precarga solo `/offline`.
  - En navegación, si la red falla, devuelve `/offline`.
  - **No guarda datos** ni respuestas de Supabase.
  - Se registra desde un componente de cliente.
- Diseño móvil: área táctil ≥ 44 px y barra de pestañas inferior (ver `DESIGN_BRIEF.md`).

## 15. Despliegue (manual)

- Dos proyectos de Vercel conectados al mismo repositorio de GitHub:
  - `crm-123-web`, con Root Directory `web`.
  - `crm-123-pwa`, con Root Directory `pwa`.
- Production Branch: `gh-crm-123`.
- `vercel.json` en cada carpeta, con `{"git": {"deploymentEnabled": false}}`, para que un push **no** despliegue automáticamente.
- Para desplegar: Vercel → proyecto → *Deployments* → *Create Deployment* → rama `gh-crm-123` (o el último commit). Alternativa: un *Deploy Hook* de la rama `gh-crm-123`.
- Las variables se crean en el entorno **Production**. Tras cambiar una variable hay que **redesplegar**.

## 16. Pruebas mínimas por hito

- Las de `BUILD_PLAN.md`.
- En cada hito, además:
  - `npm run lint`, `npm run typecheck` (`tsc --noEmit`) y `npm run build` sin errores en `web` y `pwa`.
  - Búsqueda de seguridad: `SUPABASE_SERVICE_ROLE_KEY` solo aparece en `lib/supabase/admin.ts` y en `.env.example`.
  - Ningún archivo con `'use client'` importa `lib/supabase/admin.ts`, `lib/n8n/*` ni `lib/summary/*`.
  - `grep -rniE "eliminar|borrar|suprimir"` en `app/` y `components/` no devuelve textos visibles.

## 17. Puesta en producción del correo

`onboarding@resend.dev` solo entrega correos al email del titular de la cuenta de Resend. Para que reciban todos los vendedores:

1. Verificar un dominio propio en Resend (registros DNS).
2. Cambiar `RESEND_FROM` en `crm-123-web`, por ejemplo a `CRM-123 <avisos@vuestrodominio.es>`.
3. Redesplegar.

No requiere cambios de código.
