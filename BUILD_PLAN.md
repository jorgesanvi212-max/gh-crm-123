# BUILD_PLAN.md — Plan de construcción de CRM-123 en 4 hitos

| Hito | Quién lo ejecuta | Qué construye |
|---|---|---|
| 1 | **Claude.ai Chat**, en otra conversación, con el **conector MCP de Supabase** | Base de datos completa, verificada y probada. Nada de interfaz |
| 2 | **Claude Code Web** (repositorio de GitHub, rama `gh-crm-123`) | Ingreso, armazón de navegación y tablero del día vacío, en las dos aplicaciones, desplegadas |
| 3 | **Claude Code Web** | Núcleo comercial del vendedor |
| 4 | **Claude Code Web** | Panel del equipo en la PWA, gestión, resumen matutino y flujo `WF-CRM123` para n8n local |

**Regla de oro:** **no se avanza al siguiente hito sin la confirmación explícita del humano.** Cada hito termina entregando:

- El procedimiento de despliegue.
- Las variables de Vercel.
- Las pruebas de aceptación.

Después, espera.

**Documentos de referencia en cada hito:**

| Hito | Documentos |
|---|---|
| 1 | `SCRIPTS-SQL.md` (principal), `CLAUDE.md` (§3, seguridad) y `TECHNICAL_SPEC.md` (§5–§12) |
| 2–4 | `CLAUDE.md` y `TECHNICAL_SPEC.md`, siempre con `SCRIPTS-SQL.md` como estructura intocable y `DESIGN_BRIEF.md` para las pantallas |

---

## Tabla maestra de variables de entorno

| Variable | crm-123-web | crm-123-pwa | Necesaria desde | Cómo se obtiene |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✔ | ✔ | Hito 2 | Supabase → Project Settings → Data API → Project URL. En el Hito 1, Claude.ai la entrega con `get_project_url` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✔ | ✔ | Hito 2 | Supabase → Project Settings → API Keys → `anon` (o *publishable*). En el Hito 1, con `get_publishable_keys` / `get_anon_key` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✔ | ✔ | Hito 4 | Supabase → Project Settings → API Keys → `service_role` (o *secret*) → Reveal → copiar. **Solo la manipula el humano**, directamente en Vercel |
| `N8N_SHARED_SECRET` | ✔ | — | Hito 4 | Generarla con un gestor de contraseñas: ≥ 48 caracteres, letras y números, sin símbolos. Guardarla también en la credencial de n8n |
| `RESEND_FROM` | ✔ | — | Hito 4 | Valor fijo: `CRM-123 <onboarding@resend.dev>` |
| `CRM_WEB_URL` | ✔ | — | Hito 4 | Vercel → proyecto `crm-123-web` → Domains → dominio de producción, con `https://` y sin barra final |

**Fuera de Vercel, en n8n:**

- Credencial "CRM-123 secreto n8n": `x-crm123-secret` = `N8N_SHARED_SECRET`.
- Credencial "Resend API": `Authorization` = `Bearer re_…`.

**Cómo crear o editar una variable en Vercel:**

1. Proyecto → *Settings* → *Environment Variables* → *Add New*.
2. Escribir el nombre exacto y el valor, marcar **Production** y pulsar *Save*.
3. Después hay que **redesplegar** para que surta efecto.

---

## Hito 1 — Base de datos

> **Ejecuta:** Claude.ai Chat, en una conversación nueva, con el conector MCP de Supabase activado. El humano adjunta a esa conversación `SCRIPTS-SQL.md`, `CLAUDE.md`, `TECHNICAL_SPEC.md` y este `BUILD_PLAN.md`.
>
> **Qué construye:** el script de la base de datos, entregado y aplicado, más todas las pruebas de creación y validación. **Nada de interfaz.**

### 1.0 Variables de entorno (lo primero del hito)

Claude.ai informa al humano de la tabla maestra completa y aclara:

- En este hito **se obtienen** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
  - Con `get_project_url` y `get_publishable_keys` (o `get_anon_key`) cuando el proyecto exista.
  - Se entregan al humano para que las guarde en un lugar seguro, por ejemplo un gestor de contraseñas.
- `SUPABASE_SERVICE_ROLE_KEY`: se explica dónde está, pero **el humano no la pega en el chat**. La copiará directamente en Vercel en el Hito 4.
- **Verificación en las aplicaciones:** todavía no existen, así que no aplica. Se verificará al inicio del Hito 2.

### 1.1 Procedimiento

**Paso 1 — Proyecto.**

- Con `list_organizations`, localizar **`Org CRM 123`**.
- Si el proyecto **`dbcrm123`** no existe:
  - Consultar el coste con `get_cost` y **pedir confirmación al humano** antes de `confirm_cost`.
  - Crearlo con `create_project` (nombre `dbcrm123`, región `eu-central-1`).
  - Esperar con `get_project` hasta el estado `ACTIVE_HEALTHY`.
- Si ya existe, usarlo y confirmar con el humano que está vacío (`list_tables` en `public`).

**Paso 2 — 👉 Acción del humano: configurar Auth.** En el panel de Supabase:

1. *Authentication → Sign In / Providers*: **desactivar** "Allow new users to sign up"; mantener Email activo.
2. *Authentication → (Policies o Passwords)*: longitud mínima de contraseña **10**.
3. Confirmar a Claude.ai cuando esté hecho.

**Paso 3 — Estructura.**

- Aplicar con `apply_migration`, **en orden y por separado**, los scripts 01 a 09 de `SCRIPTS-SQL.md`, con sus nombres exactos (`crm123_01_tipos` … `crm123_09_datos_iniciales`).
- Tras cada uno, confirmar el éxito. Ante cualquier error: detenerse, mostrar el error literal y **no improvisar cambios**.
- Al final, `list_migrations` debe mostrar las 9.

**Paso 4 — 👉 Acción del humano: crear los 4 usuarios.** Seguir `SCRIPTS-SQL.md` §11:

- 2 supervisores.
- Vendedor de prueba 1, con **el email del titular de la cuenta de Resend**.
- Vendedor de prueba 2.

Todos con *Auto Confirm User* y una contraseña temporal de ≥ 10 caracteres. El humano comunica los emails y los nombres, nunca las contraseñas.

**Paso 5 — Perfiles.** Ejecutar el script 10 con `execute_sql`, sustituyendo los valores, y mostrar la consulta de comprobación (4 filas).

**Paso 6 — Verificación estructural.**

- Ejecutar V01 a V17 y presentar una tabla con las columnas **Verificación · Esperado · Obtenido · OK/FALLO**.
- Ejecutar V18 (`get_advisors`, seguridad) y resumir los avisos.

**Paso 7 — Pruebas funcionales.**

- Ejecutar P0 a P5 y presentar una tabla **Prueba · Resultado**.
- Confirmar con la consulta final que no queda ningún dato de prueba (`0 | 0`).

**Paso 8 — Entrega final al humano:**

- Resumen en lenguaje de negocio de lo creado.
- Los valores de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para guardar.
- Recordatorio de dónde está la service role (sin mostrarla).
- Lista de pendientes, si los hubiera.

### 1.2 Criterios de aceptación

- [ ] Proyecto `dbcrm123` en `Org CRM 123`, en la UE, activo.
- [ ] 9 migraciones aplicadas sin errores.
- [ ] V01–V17 OK; V18 sin avisos de nivel ERROR.
- [ ] P0–P5 sin fallos; ningún dato de prueba restante.
- [ ] 4 perfiles creados (2 supervisores y 2 vendedores de prueba), con `must_change_password = true`.
- [ ] Registro público desactivado y contraseña mínima de 10 caracteres en Auth.

**Variables que debe actualizar el humano:** ninguna en este hito, porque las aplicaciones aún no existen. Guardar URL y anon key.

**⛔ No se avanza al Hito 2 hasta que el humano confirme.**

---

## Hito 2 — Entrar y desplegar

> **Ejecuta:** Claude Code Web.
>
> **Qué construye:** del proyecto, **solo** el ingreso, el armazón de navegación y el tablero del día vacío, en `/web` y `/pwa`, desplegados en Vercel.

### 2.0 Variables de entorno (lo primero del hito)

Claude Code informa al humano de la tabla maestra completa y marca lo que necesita este hito:

| Variable | web | pwa | Estado esperado al terminar el Hito 2 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✔ | ✔ | **Configurada** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✔ | ✔ | **Configurada** |
| Resto | — | — | Pendientes (Hito 4) |

Claude Code explica de dónde salen los valores (los guardados en el Hito 1) y **verifica**:

- Que `.env.example` las lista.
- Que el código falla con un mensaje claro si faltan.
- Que, tras el despliegue, la pantalla de acceso conecta con Supabase.

### 2.1 Preparación (👉 acciones del humano, guiadas por Claude Code)

1. **GitHub:**
   - Crear un repositorio **privado**. Nombre propuesto: `crm-123`.
   - Crear la rama **`gh-crm-123`** y fijarla como rama por defecto.
   - Subir a la raíz los 5 documentos (`CLAUDE.md`, `TECHNICAL_SPEC.md`, `DESIGN_BRIEF.md`, `BUILD_PLAN.md`, `SCRIPTS-SQL.md`).
2. **Claude Code Web:** conectar el repositorio y trabajar sobre `gh-crm-123`.

### 2.2 Qué construye Claude Code

- **Estructura del repositorio:**
  - `/web` y `/pwa` con Next.js + TypeScript + Tailwind + shadcn/ui.
  - Fuente Inter y colores del `DESIGN_BRIEF.md`.
  - `lib/database.types.ts` escrito a partir de `SCRIPTS-SQL.md`.
  - `lib/labels.ts`, `lib/format.ts` y `lib/errors.ts`.
  - Clientes de Supabase de sesión (servidor y navegador).
  - `vercel.json` con despliegue automático desactivado.
  - `.env.example`.
- **Autenticación en ambas apps:**
  - `/acceso`.
  - `/cambiar-contrasena` (obligatoria si `must_change_password`).
  - Middleware con lectura de rol y estado desde `profiles`.
  - Cierre de sesión de usuarios desactivados.
  - PWA solo para supervisores (`/sin-permiso`).
  - Salir.
- **Armazón:**
  - **Web:** barra lateral (Tablero, Clientes, Oportunidades, Tareas, Mi cuenta, Salir). Las secciones aún no construidas muestran el estado vacío "Disponible próximamente".
  - **PWA:** barra inferior (Equipo, Usuarios, Resumen, Más), con el mismo estado vacío.
- **Tablero del día vacío (web):**
  - Estructura completa del `DESIGN_BRIEF.md` §5.4 con los 4 indicadores a 0 y las dos listas en estado vacío.
  - Sin consultas de datos todavía. Solo se lee el perfil para mostrar nombre y rol.
- **Equipo hoy vacío (PWA)**, con su estado vacío.
- **PWA instalable:**
  - `manifest.ts` e iconos.
  - `sw.js` mínimo con la página `/offline`.
- **Mi cuenta** con cambio de contraseña, en ambas apps.

### 2.3 Procedimiento de despliegue (👉 humano, guiado por Claude Code)

1. **Vercel → Add New → Project →** importar el repositorio de GitHub dos veces:
   - **`crm-123-web`**, con *Root Directory* = `web`.
   - **`crm-123-pwa`**, con *Root Directory* = `pwa`.
2. En cada proyecto: *Settings → Git → Production Branch* = `gh-crm-123`.
3. En cada proyecto, crear las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en **Production**.
4. **Desplegar manualmente:** *Deployments → Create Deployment →* rama `gh-crm-123`. Si Vercel no ofrece esa opción, crear un *Deploy Hook* para `gh-crm-123` en *Settings → Git* y abrirlo.
5. Anotar las dos URL de producción.

**👉 Variables que el humano debe crear antes de las pruebas:** `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, en los dos proyectos.

### 2.4 Pruebas de aceptación

1. Web: entrar con el **Vendedor de prueba 1** → obliga a cambiar la contraseña → tras cambiarla, aparece el Tablero vacío con su nombre y rol "Vendedor".
2. Web: email o contraseña incorrectos → mensaje genérico.
3. PWA: entrar con el **Vendedor de prueba 2** (tras cambiar su contraseña en la web) → "Esta aplicación es solo para supervisores" y se cierra la sesión.
4. PWA: entrar con el **Supervisor 1** → cambio de contraseña → Equipo hoy vacío y barra inferior.
5. Web: entrar con el Supervisor 1 → Tablero vacío con el selector "Vendedor: Todos".
6. PWA: en el móvil, "Añadir a pantalla de inicio" → se abre como aplicación. En modo avión, muestra "Sin conexión".
7. Salir funciona en las dos apps; recargar una página interna sin sesión lleva a `/acceso`.
8. Claude Code muestra el resultado de lint, typecheck, build y las comprobaciones de seguridad.

**⛔ No se avanza al Hito 3 hasta que el humano confirme.**

---

## Hito 3 — Núcleo comercial

> **Ejecuta:** Claude Code Web.
>
> **Qué construye:** añade a la funcionalidad existente lo que un vendedor usa todos los días, en la web de escritorio.

### 3.0 Variables de entorno (lo primero del hito)

- Se repasa la tabla maestra.
- **Este hito no necesita variables nuevas:** sigue usando la URL y la anon key, porque todas las operaciones van con la sesión del usuario y RLS.
- Claude Code **verifica** con el humano que las dos siguen configuradas en `crm-123-web` (Vercel → Settings → Environment Variables).
- Resto: pendientes para el Hito 4.

### 3.1 Qué construye Claude Code (solo `/web`)

- **Tablero del día con datos reales:**
  - Indicadores desde `v_seller_kpis`.
  - Tareas de hoy y vencidas desde `v_tasks_list`, con la acción "Marcar como hecha".
  - Cierres en 7 días desde `v_opportunities_list`.
- **Clientes:**
  - Lista con buscador y filtros.
  - Alta con comprobación del teléfono (`phone_status`) y selector de prefijo europeo.
  - Edición.
  - Ficha completa.
- **Oportunidades:**
  - Crear y editar.
  - Cambiar etapa, con motivo obligatorio para "Perdida".
  - Lista con filtros y totales.
- **Tareas:**
  - Crear (desde la ficha y desde la lista).
  - Marcar como hecha.
  - Cancelar.
  - Pestañas Hoy / Vencidas / Próximas.
- **Actividades:** registrar e historial en la ficha, sin edición.
- **Funciones de supervisor en el escritorio:**
  - Filtro "Vendedor: Todos / uno".
  - "Mostrar archivados".
  - Archivar y restaurar clientes y oportunidades.
  - Alta de clientes con vendedor asignado.
- Todos los estados (vacío, cargando, error, proceso) de `DESIGN_BRIEF.md`.

### 3.2 Procedimiento de despliegue

1. Claude Code integra los cambios en `gh-crm-123`.
2. 👉 El humano despliega **`crm-123-web`** manualmente (*Create Deployment* → `gh-crm-123`).
3. `crm-123-pwa` no cambia en este hito.

**👉 Variables que el humano debe actualizar:** ninguna.

### 3.3 Pruebas de aceptación

1. **Vendedor 1:**
   - Crea el cliente "Frutería Prueba" con +34 600 000 101.
   - Crea una oportunidad de 450 € → la pasa a Ganada → "Ganado este mes" muestra 450,00 €.
2. **Vendedor 1:** crea una tarea para hoy → aparece en el Tablero → la marca como hecha → desaparece.
3. **Vendedor 1:** registra una actividad "Llamada" → aparece en el historial sin opción de editar.
4. **Vendedor 1:** intenta pasar una oportunidad a Perdida sin motivo → no deja guardar.
5. **Vendedor 2:**
   - No ve el cliente del Vendedor 1.
   - Al dar de alta +34 600 000 101 → "Este cliente ya está asignado. Contacta con tu supervisor", sin ver ningún dato.
6. **Supervisor (web):**
   - Ve los clientes de ambos con el filtro "Todos".
   - Archiva "Frutería Prueba" → el Vendedor 1 deja de verlo.
   - La restaura.
7. Ningún texto de la interfaz contiene "eliminar", "borrar" ni "suprimir".
8. Resultado de lint, typecheck, build y comprobaciones de seguridad.

> **Datos de prueba:** al terminar, el supervisor **archiva** los clientes de prueba. No se borran.

**⛔ No se avanza al Hito 4 hasta que el humano confirme.**

---

## Hito 4 — Supervisión y una automatización

> **Ejecuta:** Claude Code Web.
>
> **Qué construye:** añade a la funcionalidad existente el panel del equipo de la PWA, la gestión de usuarios, la reasignación, la auditoría, el resumen matutino (ajustes, envío manual y estado), los endpoints `/api/n8n/*` en la web y el flujo **`WF-CRM123`** en JSON para importarlo manualmente en el **n8n local**.

### 4.0 Variables de entorno (lo primero del hito)

Claude Code informa de la tabla maestra completa. En este hito **todas** deben quedar configuradas:

| Variable | web | pwa | Cómo obtenerla (resumen) |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✔ ya | ✔ ya | Hito 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✔ ya | ✔ ya | Hito 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | **nueva** | **nueva** | Supabase → Project Settings → API Keys → `service_role` / *secret* → Reveal → copiar y pegar **directamente en Vercel**, nunca en un chat |
| `N8N_SHARED_SECRET` | **nueva** | — | Gestor de contraseñas: ≥ 48 caracteres, letras y números. Guardar también para n8n |
| `RESEND_FROM` | **nueva** | — | `CRM-123 <onboarding@resend.dev>` |
| `CRM_WEB_URL` | **nueva** | — | URL de producción de `crm-123-web` |

Credenciales de n8n (se crean en el paso 4.3): "CRM-123 secreto n8n" y "Resend API".

Claude Code **verifica** al final, con la ayuda del humano, que existen en Vercel. El endpoint `GET /api/n8n/health` sirve de prueba de que el secreto y la URL coinciden.

### 4.1 Qué construye Claude Code

- **PWA:**
  - Equipo hoy con datos.
  - Detalle de vendedor.
  - Usuarios: alta con contraseña temporal mostrada una vez, cambio de nombre y rol, contraseña temporal, desactivar y reactivar, con bloqueo en Auth.
  - Reasignar clientes.
  - Auditoría.
  - Resumen matutino: ajustes, envío manual con confirmación y espera de 10 minutos, estado en vivo, historial y detalle por vendedor.
  - Aviso de "Modo pruebas" del remitente.
- **Web:**
  - `GET /api/n8n/health`.
  - `POST /api/n8n/summary/claim`, con el HTML del correo generado en el servidor.
  - `POST /api/n8n/summary/report`.
  - Todo según `TECHNICAL_SPEC.md` §8.4, §9 y §10.
- **Flujo `web/n8n/WF-CRM123.json`**, según `TECHNICAL_SPEC.md` §11. Sin secretos y con el marcador `REEMPLAZAR_CRM_WEB_URL`.
- **Guía paso a paso para el humano** (en el mensaje final): instalación de n8n local, credenciales e importación.

### 4.2 Procedimiento de despliegue

1. Claude Code integra en `gh-crm-123`.
2. 👉 El humano crea **las variables nuevas** de 4.0 en Vercel (Production) en los dos proyectos según corresponda.
3. 👉 El humano despliega manualmente **`crm-123-web`** y **`crm-123-pwa`**.

### 4.3 Puesta en marcha de n8n local y Resend (👉 humano, guiado)

1. **Resend:**
   - Crear la cuenta en resend.com con **el email del Vendedor de prueba 1**.
   - *API Keys → Create API Key* con permiso "Sending access" → copiar la clave `re_…`.
2. **Docker Desktop:**
   - Instalarlo y activar el arranque al iniciar sesión.
   - Ejecutar los comandos de `TECHNICAL_SPEC.md` §11.
   - Abrir `http://localhost:5678` y crear el usuario propietario de n8n.
3. **Credenciales en n8n** (*Credentials → Add credential → Header Auth*):

| Nombre | Name | Value |
|---|---|---|
| "CRM-123 secreto n8n" | `x-crm123-secret` | el `N8N_SHARED_SECRET` |
| "Resend API" | `Authorization` | `Bearer re_…` |

4. **Importar el flujo:**
   - *Workflows → Import from File* → `WF-CRM123.json`.
   - Sustituir `REEMPLAZAR_CRM_WEB_URL` en los nodos "Pedir envío pendiente" e "Informar resultado".
   - Seleccionar las credenciales en los 3 nodos HTTP.
   - Guardar.
5. **Prueba de conexión:** crear temporalmente un nodo HTTP GET a `{CRM_WEB_URL}/api/n8n/health` con la credencial del secreto → debe responder `{"ok":true}`. Después, quitar ese nodo.
6. **Activar** el flujo (interruptor *Active*).

**👉 Variables y credenciales que el humano debe tener actualizadas antes de las pruebas:**

- Las 4 variables nuevas de Vercel.
- Los dos redespliegues.
- Las 2 credenciales de n8n.
- La URL en los nodos.

### 4.4 Pruebas de aceptación

1. **PWA · Equipo hoy:** muestra los totales y una tarjeta por vendedor con datos coherentes con el escritorio.
2. **PWA · Usuarios:**
   - Crear un vendedor nuevo → se muestra la contraseña temporal una vez → ese usuario entra en la web y se le obliga a cambiarla.
   - El contador muestra n/10.
3. **PWA · Desactivar:** desactivar al Vendedor 2 con clientes → aviso "reasigna antes" → Reasignar → Desactivar → el Vendedor 2 ya no puede entrar.
4. **PWA · Auditoría:** aparecen el alta, la reasignación, la desactivación y los cambios de etapa del Hito 3.
5. **Resumen manual:**
   - Enviar ahora a **Vendedor de prueba 1** → "En cola" → en ≤ 5 minutos "En proceso" → "Completado · 1 enviado".
   - El correo llega al email del titular de Resend con el formato esperado (o "Sin pendientes hoy").
6. **Espera de 10 minutos:** un segundo envío inmediato está desactivado ("Disponible en n min").
7. **Envío a todos en modo pruebas:** los vendedores que no son el titular de Resend aparecen como "Fallido" con el motivo de Resend. Es el comportamiento esperado con `onboarding@resend.dev`, y el estado final es "Con errores".
8. **Programado:** fijar la hora a la siguiente hora en punto → a esa hora, como mucho 5 minutos después, se crea un envío "Programado". No se repite ese día.
9. **Seguridad:**
   - Llamar a `/api/n8n/summary/claim` sin la cabecera o con un secreto erróneo → 401.
   - La anon key no puede ejecutar `claim_summary_run` (lo verificó el Hito 1).
   - Lint, typecheck, build y comprobaciones de seguridad superadas.

### 4.5 Cierre del proyecto (tareas de puesta en marcha)

1. Crear los vendedores reales desde la PWA, hasta 10.
2. **Desactivar** los vendedores de prueba y **archivar** sus clientes de prueba.
3. **Correo para todos:** verificar un dominio propio en Resend y cambiar `RESEND_FROM` en `crm-123-web` → redesplegar (`TECHNICAL_SPEC.md` §17).
4. Mantener encendido el ordenador de n8n en horario laboral. Si estuvo apagado, el resumen sale al volver, hasta las 12:00.

**⛔ Fin del plan. Cualquier mejora posterior se trata como un proyecto nuevo, con su propia versión de los documentos.**
