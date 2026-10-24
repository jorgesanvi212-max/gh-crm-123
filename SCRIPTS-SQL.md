# SCRIPTS-SQL.md — Estructura oficial de la base de datos de CRM-123

> **Documento fuente de verdad.** Esta es la única estructura oficial de datos de CRM-123.
>
> | Documento | Cómo usa esta estructura |
> |---|---|
> | `DESIGN_BRIEF.md` | La toma como referencia de campos y estados |
> | `TECHNICAL_SPEC.md` | La toma como contrato |
> | `CLAUDE.md` | Prohíbe modificarla |
>
> Nadie (ni Claude Design, ni Claude Code Web, ni Claude.ai Chat) puede añadir, quitar ni renombrar tablas, columnas, tipos, funciones, vistas o políticas sin aprobación expresa del humano y una nueva versión de este documento.

**Datos del proyecto**

- **Organización de Supabase:** `Org CRM 123`
- **Proyecto (base de datos):** `dbcrm123`
- **Región:** UE, Fráncfort (`eu-central-1`)
- **Esquema:** `public`
- **Zona horaria de negocio:** `Europe/Madrid`
- **Moneda:** EUR
- **Versión del documento:** 1.0, 24/10/2026

---

## 0. Cómo ejecutar este documento (instrucciones para Claude.ai Chat con el conector MCP de Supabase)

1. **Ejecutar los scripts 01 a 09 en orden**, cada uno como una migración independiente con `apply_migration`. Usar exactamente el nombre indicado en cada bloque, por ejemplo `crm123_01_tipos`. No ejecutar nunca un script parcialmente. Si uno falla, detenerse, informar del error literal al humano y no continuar.
2. **Pedir al humano que cree los usuarios en el panel de Supabase.** Seguir las instrucciones de la sección 10. Después, ejecutar el script 10 con `execute_sql`, sustituyendo los emails reales que dé el humano.
3. **Ejecutar las verificaciones estructurales de la sección 11** con `execute_sql`. Comparar cada resultado con el valor esperado y presentar una tabla con las columnas Verificación, Esperado, Obtenido y OK/FALLO.
4. **Ejecutar las pruebas funcionales de la sección 12** con `execute_sql`, bloque a bloque. Cada bloque termina en `rollback`, así que no deja datos. Un bloque correcto termina sin error; un error cuyo texto empieza por `FALLO` indica qué prueba falló.
5. **Ejecutar `get_advisors` con el tipo `security`** y presentar el resultado. No puede quedar ningún aviso de nivel ERROR.
6. **No crear objetos adicionales** (tablas auxiliares de pruebas, funciones de ayuda, extensiones) ni modificar nada fuera de lo descrito.

---

## 1. Modelo de datos (resumen legible)

| Tabla | Para qué sirve | Quién la ve | Quién la modifica |
|---|---|---|---|
| `profiles` | Usuarios del CRM: nombre, email, rol, activo | Cada usuario su propia fila; el supervisor, todas | Solo el supervisor (nombre, rol, activo); el servidor, con funciones controladas |
| `clients` | Empresas cliente. El teléfono es su identificador único | El vendedor, sus clientes; el supervisor, todos | Vendedor (sus clientes, sin reasignar ni archivar); supervisor (todo) |
| `opportunities` | Ventas en curso o cerradas, con importe en € | El vendedor, las suyas y las de sus clientes; el supervisor, todas | Vendedor (las suyas abiertas); supervisor (todo) |
| `tasks` | Seguimientos con fecha y hora | El vendedor, las suyas y las de sus clientes; el supervisor, todas | Vendedor (las suyas pendientes); supervisor (todo) |
| `activities` | Historial: llamada, visita, WhatsApp, email, nota | El vendedor, las de sus clientes; el supervisor, todas | **Solo inserción.** Nadie modifica ni borra |
| `audit_log` | Registro de auditoría | Solo el supervisor | **Solo inserción**, mediante triggers y funciones del servidor |
| `settings` | Configuración única (fila 1) del resumen matutino | Todo usuario autenticado | Solo el supervisor (activar el resumen y fijar la hora) |
| `summary_runs` | Cada ejecución del resumen (programada o manual) | Solo el supervisor | Funciones controladas: solicitud del supervisor y servidor de n8n |
| `summary_deliveries` | Resultado del envío por destinatario | Solo el supervisor | Solo el servidor, mediante funciones |

**Relaciones**

- `profiles.id` → `auth.users.id`, relación 1:1.
- `clients.owner_id` → `profiles.id`: cada cliente tiene un vendedor fijo.
- `opportunities.client_id` → `clients.id`.
- `opportunities.owner_id` → `profiles.id`. Siempre es igual al vendedor del cliente mientras la oportunidad está abierta.
- `tasks.client_id` → `clients.id`. Opcionalmente, `tasks.opportunity_id` → `opportunities.id`, que debe ser del mismo cliente.
- `activities.client_id` → `clients.id`. Opcionalmente, `activities.opportunity_id` → `opportunities.id`, del mismo cliente.
- `summary_deliveries.run_id` → `summary_runs.id`.
- Todas las claves foráneas usan `on delete restrict`. **No existe borrado físico.**

**Datos prohibidos:** no existe, ni puede añadirse, ninguna columna para DNI, NIE, NIF/CIF, pasaporte ni ningún otro identificador personal o fiscal.

### 1.1 Valores de los tipos enumerados y su texto en pantalla

| Tipo | Valor en base de datos → Texto en pantalla |
|---|---|
| `user_role` | `vendedor` → Vendedor · `supervisor` → Supervisor |
| `business_type` | `fruteria` → Frutería · `hosteleria` → Hostelería / Restaurante · `supermercado` → Supermercado · `mercado_mayorista` → Mercado / Mayorista · `otro` → Otro |
| `opportunity_stage` | `nueva` → Nueva · `oferta_enviada` → Oferta enviada · `negociacion` → Negociación · `ganada` → Ganada · `perdida` → Perdida |
| `loss_reason` | `precio` → Precio · `calidad` → Calidad / producto · `plazo` → Plazo de entrega · `competencia` → Competencia · `otro` → Otro |
| `activity_type` | `llamada` → Llamada · `visita` → Visita · `whatsapp` → WhatsApp · `email` → Email · `nota` → Nota |
| `task_status` | `pendiente` → Pendiente · `hecha` → Hecha · `cancelada` → Cancelada |
| `summary_trigger` | `programado` → Programado · `manual` → Manual |
| `summary_run_status` | `pendiente` → En cola · `en_proceso` → En proceso · `completado` → Completado · `con_errores` → Con errores · `fallido` → Fallido · `omitido` → Omitido |
| `delivery_status` | `pendiente` → Pendiente · `enviado` → Enviado · `fallido` → Fallido |

### 1.2 Diccionario de columnas

**`profiles`**

| Columna | Tipo | Obligatoria | Reglas |
|---|---|---|---|
| id | uuid PK | sí | = `auth.users.id` |
| full_name | text | sí | 2–120 caracteres |
| email | text | sí | minúsculas, formato email, único, inmutable |
| role | user_role | sí | por defecto `vendedor` |
| is_active | boolean | sí | por defecto `true` |
| must_change_password | boolean | sí | por defecto `true`; solo lo cambian funciones del servidor |
| created_at / updated_at | timestamptz | sí | automáticas |

Límites del equipo: máximo **10 vendedores activos** y **2 supervisores activos**.

**`clients`**

| Columna | Tipo | Obligatoria | Reglas |
|---|---|---|---|
| id | uuid PK | sí | automática |
| trade_name | text | sí | Nombre comercial, 2–150 |
| business_type | business_type | sí | |
| contact_name | text | sí | Persona de contacto, 2–120 |
| phone | text | sí | Formato internacional E.164 (`+` y 8–15 dígitos), **único**, incluidos los archivados |
| email | text | no | minúsculas, formato email |
| delivery_address | text | no | ≤ 250 |
| city | text | no | Población, ≤ 100 |
| province | text | no | Provincia, ≤ 100 |
| notes | text | no | ≤ 2000 |
| owner_id | uuid FK profiles | sí | Debe ser un vendedor activo |
| is_archived | boolean | sí | por defecto `false` |
| archived_at / archived_by | timestamptz / uuid | — | automáticas al archivar |
| created_by | uuid FK profiles | sí | = usuario que crea |
| created_at / updated_at | timestamptz | sí | automáticas |

**`opportunities`**

| Columna | Tipo | Obligatoria | Reglas |
|---|---|---|---|
| id | uuid PK | sí | |
| client_id | uuid FK clients | sí | inmutable |
| owner_id | uuid FK profiles | sí | si no se indica, toma el vendedor del cliente |
| title | text | sí | Resumen breve, 2–150 |
| description | text | no | Detalle libre de la venta (productos, kg, cajas…), ≤ 2000 |
| amount | numeric(12,2) | sí | ≥ 0, en € |
| stage | opportunity_stage | sí | por defecto `nueva` |
| expected_close_date | date | sí | Fecha prevista de cierre |
| loss_reason | loss_reason | solo si `perdida` | obligatorio cuando la etapa es `perdida` y nulo en las demás |
| loss_note | text | no | ≤ 500; solo con `perdida` |
| closed_at | timestamptz | — | automática al pasar a `ganada` o `perdida` |
| is_archived, archived_at, archived_by | | | solo el supervisor archiva |
| created_by, created_at, updated_at | | | automáticas |

**`tasks`**

| Columna | Tipo | Obligatoria | Reglas |
|---|---|---|---|
| id | uuid PK | sí | |
| client_id | uuid FK clients | sí | inmutable |
| opportunity_id | uuid FK opportunities | no | del mismo cliente |
| owner_id | uuid FK profiles | sí | toma el vendedor del cliente |
| title | text | sí | 2–150 |
| due_at | timestamptz | sí | fecha y hora de vencimiento (se introduce en hora de Madrid) |
| status | task_status | sí | nace `pendiente` |
| completed_at | timestamptz | — | automática al marcar `hecha` o `cancelada` |
| created_by, created_at, updated_at | | | automáticas |

**`activities`** (solo inserción)

| Columna | Tipo | Obligatoria | Reglas |
|---|---|---|---|
| id | uuid PK | sí | |
| client_id | uuid FK clients | sí | |
| opportunity_id | uuid FK opportunities | no | del mismo cliente |
| type | activity_type | sí | |
| description | text | sí | 1–2000 |
| occurred_at | timestamptz | sí | por defecto ahora; nunca futura |
| created_by | uuid FK profiles | sí | = usuario que registra |
| created_at | timestamptz | sí | automática |

**`audit_log`** (solo inserción): `id` bigint, `actor_id` (puede ser nulo cuando actúa el sistema), `action`, `entity`, `entity_id`, `details` jsonb y `created_at`.

**`settings`** (fila única, `id = 1`):

| Columna | Valor por defecto | Rango o regla |
|---|---|---|
| `summary_enabled` | true | — |
| `summary_hour` | 7 | 5–11 |
| `summary_days` | `{1,2,3,4,5,6}` | ISO: 1 = lunes … 7 = domingo; L–S por defecto |
| `recovery_until_hour` | 12 | — |
| `manual_cooldown_minutes` | 10 | — |
| `time_zone` | `Europe/Madrid` | fijo |

Además, `updated_at` y `updated_by`.

**`summary_runs`:**

- `id`
- `trigger_type`
- `run_date` (fecha de Madrid)
- `target_profile_id` (nulo = todos los vendedores)
- `requested_by`
- `status`
- `requested_at`, `claimed_at`, `finished_at`
- `total_recipients`, `sent_count`, `failed_count`
- `error_message`

**`summary_deliveries`:**

- `id`
- `run_id`
- `profile_id`
- `email`
- `status`
- `provider_message_id`
- `error_message`
- `created_at`
- `reported_at`

### 1.3 Funciones disponibles para la aplicación (RPC)

| Función | Quién puede llamarla | Qué hace |
|---|---|---|
| `phone_status(p_phone text)` | autenticado activo | Devuelve `libre`, `propio`, `otro_vendedor`, `archivado` o `formato_invalido`, sin revelar datos de otro vendedor |
| `mark_password_changed()` | autenticado | Pone `must_change_password = false` en el propio perfil |
| `reassign_clients(p_from uuid, p_to uuid, p_client_ids uuid[] default null)` | supervisor | Reasigna clientes no archivados. Sus oportunidades abiertas y tareas pendientes pasan al nuevo vendedor |
| `request_manual_summary(p_target uuid default null)` | supervisor | Deja en cola un envío manual del resumen (nulo = todos). Respeta una espera mínima de 10 minutos entre envíos |
| `claim_summary_run(p_now timestamptz default now())` | **solo service_role** | Entrega a n8n el siguiente envío pendiente con los datos de cada destinatario |
| `record_summary_delivery(p_run_id, p_profile_id, p_ok, p_provider_message_id, p_error)` | **solo service_role** | Registra el resultado de un destinatario y cierra la ejecución al completarse |
| `get_summary_data(p_profile_id uuid, p_today date)` | **solo service_role** | Datos del resumen de un vendedor |
| `create_profile_for_user(p_user_id, p_full_name, p_email, p_role, p_actor_id)` | **solo service_role** | Crea el perfil tras crear el usuario en Auth y lo audita |
| `log_password_reset(p_actor_id, p_user_id)` | **solo service_role** | Marca el cambio de contraseña obligatorio y lo audita |

Funciones auxiliares que usan las políticas:

- `is_supervisor()`
- `is_active_user()`
- `owns_client(uuid)`
- `owns_active_client(uuid)`

### 1.4 Vistas (todas con `security_invoker = true`)

| Vista | Uso |
|---|---|
| `v_seller_kpis` | Indicadores por vendedor: tareas de hoy, tareas vencidas, oportunidades abiertas (nº y €) y ganado en el mes |
| `v_clients_list` | Lista de clientes con nombre del vendedor, nº de oportunidades abiertas y fecha de la última actividad |
| `v_opportunities_list` | Oportunidades con nombre y teléfono del cliente, nombre del vendedor e indicador `is_open` |
| `v_tasks_list` | Tareas con cliente, oportunidad, vendedor y `bucket` (`vencida`, `hoy`, `proxima` o `cerrada`) en hora de Madrid |

---

## 2. Script 01 — Tipos enumerados
**Migración:** `crm123_01_tipos`

```sql
create type public.user_role as enum ('vendedor', 'supervisor');
create type public.business_type as enum ('fruteria', 'hosteleria', 'supermercado', 'mercado_mayorista', 'otro');
create type public.opportunity_stage as enum ('nueva', 'oferta_enviada', 'negociacion', 'ganada', 'perdida');
create type public.loss_reason as enum ('precio', 'calidad', 'plazo', 'competencia', 'otro');
create type public.activity_type as enum ('llamada', 'visita', 'whatsapp', 'email', 'nota');
create type public.task_status as enum ('pendiente', 'hecha', 'cancelada');
create type public.summary_trigger as enum ('programado', 'manual');
create type public.summary_run_status as enum ('pendiente', 'en_proceso', 'completado', 'con_errores', 'fallido', 'omitido');
create type public.delivery_status as enum ('pendiente', 'enviado', 'fallido');
```

---

## 3. Script 02 — Tablas
**Migración:** `crm123_02_tablas`

```sql
-- PERFILES ---------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete restrict,
  full_name             text not null,
  email                 text not null,
  role                  public.user_role not null default 'vendedor',
  is_active             boolean not null default true,
  must_change_password  boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint profiles_email_key unique (email),
  constraint profiles_full_name_chk check (char_length(btrim(full_name)) between 2 and 120),
  constraint profiles_email_chk check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- CLIENTES ---------------------------------------------------------------
create table public.clients (
  id                uuid primary key default gen_random_uuid(),
  trade_name        text not null,
  business_type     public.business_type not null,
  contact_name      text not null,
  phone             text not null,
  email             text,
  delivery_address  text,
  city              text,
  province          text,
  notes             text,
  owner_id          uuid not null references public.profiles (id) on delete restrict,
  is_archived       boolean not null default false,
  archived_at       timestamptz,
  archived_by       uuid references public.profiles (id) on delete restrict,
  created_by        uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint clients_phone_key unique (phone),
  constraint clients_trade_name_chk check (char_length(btrim(trade_name)) between 2 and 150),
  constraint clients_contact_name_chk check (char_length(btrim(contact_name)) between 2 and 120),
  constraint clients_phone_chk check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint clients_email_chk check (email is null or (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  constraint clients_delivery_address_chk check (delivery_address is null or char_length(delivery_address) <= 250),
  constraint clients_city_chk check (city is null or char_length(city) <= 100),
  constraint clients_province_chk check (province is null or char_length(province) <= 100),
  constraint clients_notes_chk check (notes is null or char_length(notes) <= 2000),
  constraint clients_archive_chk check (
    (is_archived and archived_at is not null and archived_by is not null)
    or (not is_archived and archived_at is null and archived_by is null))
);

-- OPORTUNIDADES ----------------------------------------------------------
create table public.opportunities (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references public.clients (id) on delete restrict,
  owner_id             uuid not null references public.profiles (id) on delete restrict,
  title                text not null,
  description          text,
  amount               numeric(12,2) not null,
  stage                public.opportunity_stage not null default 'nueva',
  expected_close_date  date not null,
  loss_reason          public.loss_reason,
  loss_note            text,
  closed_at            timestamptz,
  is_archived          boolean not null default false,
  archived_at          timestamptz,
  archived_by          uuid references public.profiles (id) on delete restrict,
  created_by           uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint opportunities_title_chk check (char_length(btrim(title)) between 2 and 150),
  constraint opportunities_description_chk check (description is null or char_length(description) <= 2000),
  constraint opportunities_amount_chk check (amount >= 0),
  constraint opportunities_loss_reason_chk check ((stage = 'perdida') = (loss_reason is not null)),
  constraint opportunities_loss_note_chk check (loss_note is null or (stage = 'perdida' and char_length(loss_note) <= 500)),
  constraint opportunities_closed_at_chk check ((stage in ('ganada', 'perdida')) = (closed_at is not null)),
  constraint opportunities_archive_chk check (
    (is_archived and archived_at is not null and archived_by is not null)
    or (not is_archived and archived_at is null and archived_by is null))
);

-- TAREAS -----------------------------------------------------------------
create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete restrict,
  opportunity_id  uuid references public.opportunities (id) on delete restrict,
  owner_id        uuid not null references public.profiles (id) on delete restrict,
  title           text not null,
  due_at          timestamptz not null,
  status          public.task_status not null default 'pendiente',
  completed_at    timestamptz,
  created_by      uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint tasks_title_chk check (char_length(btrim(title)) between 2 and 150),
  constraint tasks_completed_at_chk check ((status = 'pendiente') = (completed_at is null))
);

-- ACTIVIDADES (solo inserción) -------------------------------------------
create table public.activities (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete restrict,
  opportunity_id  uuid references public.opportunities (id) on delete restrict,
  type            public.activity_type not null,
  description     text not null,
  occurred_at     timestamptz not null default now(),
  created_by      uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at      timestamptz not null default now(),
  constraint activities_description_chk check (char_length(btrim(description)) between 1 and 2000),
  constraint activities_occurred_at_chk check (occurred_at <= created_at + interval '5 minutes')
);

-- AUDITORÍA (solo inserción) ---------------------------------------------
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles (id) on delete restrict,
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  constraint audit_log_action_chk check (action in (
    'usuario.alta', 'usuario.cambio_rol', 'usuario.desactivado', 'usuario.reactivado',
    'usuario.contrasena_restablecida',
    'cliente.reasignado', 'cliente.archivado', 'cliente.restaurado',
    'oportunidad.cambio_etapa', 'oportunidad.archivada', 'oportunidad.restaurada',
    'ajustes.actualizados',
    'resumen.solicitado', 'resumen.omitido', 'resumen.finalizado')),
  constraint audit_log_entity_chk check (entity in ('profile', 'client', 'opportunity', 'settings', 'summary_run'))
);

-- AJUSTES (fila única) ---------------------------------------------------
create table public.settings (
  id                       smallint primary key default 1,
  summary_enabled          boolean not null default true,
  summary_hour             smallint not null default 7,
  summary_days             smallint[] not null default '{1,2,3,4,5,6}',
  recovery_until_hour      smallint not null default 12,
  manual_cooldown_minutes  smallint not null default 10,
  time_zone                text not null default 'Europe/Madrid',
  updated_at               timestamptz not null default now(),
  updated_by               uuid references public.profiles (id) on delete restrict,
  constraint settings_singleton_chk check (id = 1),
  constraint settings_summary_hour_chk check (summary_hour between 5 and 11),
  constraint settings_summary_days_chk check (
    cardinality(summary_days) between 1 and 7
    and summary_days <@ array[1,2,3,4,5,6,7]::smallint[]),
  constraint settings_recovery_chk check (recovery_until_hour between 6 and 23 and recovery_until_hour > summary_hour),
  constraint settings_cooldown_chk check (manual_cooldown_minutes between 1 and 120),
  constraint settings_time_zone_chk check (time_zone = 'Europe/Madrid')
);

-- EJECUCIONES DEL RESUMEN ------------------------------------------------
create table public.summary_runs (
  id                 uuid primary key default gen_random_uuid(),
  trigger_type       public.summary_trigger not null,
  run_date           date not null,
  target_profile_id  uuid references public.profiles (id) on delete restrict,
  requested_by       uuid references public.profiles (id) on delete restrict,
  status             public.summary_run_status not null default 'pendiente',
  requested_at       timestamptz not null default now(),
  claimed_at         timestamptz,
  finished_at        timestamptz,
  total_recipients   integer not null default 0,
  sent_count         integer not null default 0,
  failed_count       integer not null default 0,
  error_message      text,
  constraint summary_runs_counts_chk check (
    total_recipients >= 0 and sent_count >= 0 and failed_count >= 0
    and sent_count + failed_count <= total_recipients),
  constraint summary_runs_trigger_chk check (
    (trigger_type = 'programado' and target_profile_id is null and requested_by is null)
    or (trigger_type = 'manual' and requested_by is not null)),
  constraint summary_runs_error_chk check (error_message is null or char_length(error_message) <= 500)
);

-- ENTREGAS DEL RESUMEN POR DESTINATARIO ----------------------------------
create table public.summary_deliveries (
  id                   uuid primary key default gen_random_uuid(),
  run_id               uuid not null references public.summary_runs (id) on delete restrict,
  profile_id           uuid not null references public.profiles (id) on delete restrict,
  email                text not null,
  status               public.delivery_status not null default 'pendiente',
  provider_message_id  text,
  error_message        text,
  created_at           timestamptz not null default now(),
  reported_at          timestamptz,
  constraint summary_deliveries_run_profile_key unique (run_id, profile_id),
  constraint summary_deliveries_status_chk check ((status = 'pendiente') = (reported_at is null)),
  constraint summary_deliveries_provider_chk check (provider_message_id is null or char_length(provider_message_id) <= 200),
  constraint summary_deliveries_error_chk check (error_message is null or char_length(error_message) <= 500)
);
```

---

## 4. Script 03 — Índices
**Migración:** `crm123_03_indices`

```sql
create index idx_profiles_role_active        on public.profiles (role) where is_active;

create index idx_clients_owner               on public.clients (owner_id);
create index idx_clients_trade_name          on public.clients (lower(trade_name));
create index idx_clients_created_by          on public.clients (created_by);
create index idx_clients_archived_by         on public.clients (archived_by);

create index idx_opportunities_owner_stage   on public.opportunities (owner_id, stage);
create index idx_opportunities_client        on public.opportunities (client_id);
create index idx_opportunities_open_close_date on public.opportunities (expected_close_date)
  where stage in ('nueva', 'oferta_enviada', 'negociacion');
create index idx_opportunities_created_by    on public.opportunities (created_by);
create index idx_opportunities_archived_by   on public.opportunities (archived_by);

create index idx_tasks_owner_status_due      on public.tasks (owner_id, status, due_at);
create index idx_tasks_client                on public.tasks (client_id);
create index idx_tasks_opportunity           on public.tasks (opportunity_id);
create index idx_tasks_created_by            on public.tasks (created_by);

create index idx_activities_client_occurred  on public.activities (client_id, occurred_at desc);
create index idx_activities_opportunity      on public.activities (opportunity_id);
create index idx_activities_created_by       on public.activities (created_by);

create index idx_audit_log_created_at        on public.audit_log (created_at desc);
create index idx_audit_log_entity            on public.audit_log (entity, entity_id);
create index idx_audit_log_actor             on public.audit_log (actor_id);

create index idx_settings_updated_by         on public.settings (updated_by);

create unique index uq_summary_runs_scheduled_per_day on public.summary_runs (run_date)
  where trigger_type = 'programado';
create index idx_summary_runs_status         on public.summary_runs (status, requested_at);
create index idx_summary_runs_target         on public.summary_runs (target_profile_id);
create index idx_summary_runs_requested_by   on public.summary_runs (requested_by);

create index idx_summary_deliveries_profile  on public.summary_deliveries (profile_id);
```

---

## 5. Script 04 — Funciones
**Migración:** `crm123_04_funciones`

Todas las funciones fijan `search_path = public`. Las `security definer` lo hacen obligatoriamente.

```sql
-- =========================================================================
-- 4.1 Funciones auxiliares de seguridad (las usan las políticas RLS)
-- =========================================================================
create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active);
$$;

create or replace function public.is_supervisor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role = 'supervisor' and is_active);
$$;

create or replace function public.owns_client(p_client_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.clients where id = p_client_id and owner_id = auth.uid());
$$;

create or replace function public.owns_active_client(p_client_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.clients
                 where id = p_client_id and owner_id = auth.uid() and not is_archived);
$$;

-- Escritura interna de auditoría (sin permisos de ejecución para clientes)
create or replace function public.write_audit(p_actor uuid, p_action text, p_entity text,
                                              p_entity_id uuid, p_details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, details)
  values (p_actor, p_action, p_entity, p_entity_id, coalesce(p_details, '{}'::jsonb));
$$;

-- =========================================================================
-- 4.2 Funciones de trigger
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end; $$;

create or replace function public.prevent_mutation()
returns trigger language plpgsql set search_path = public as $$
begin
  raise exception 'La tabla % es solo de inserción: no admite cambios', tg_table_name
    using errcode = '42501';
end; $$;

-- PERFILES: inmutables, último supervisor, reasignación previa y límites del equipo
create or replace function public.guard_profiles()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.email <> old.email or new.created_at <> old.created_at then
      raise exception 'No se puede modificar el identificador, el email ni la fecha de alta de un usuario'
        using errcode = '42501';
    end if;
    if auth.uid() is not null and new.id = auth.uid()
       and (new.role <> old.role or new.is_active <> old.is_active) then
      raise exception 'Un usuario no puede cambiar su propio rol ni desactivarse' using errcode = '42501';
    end if;
    if old.role = 'supervisor' and old.is_active and (new.role <> 'supervisor' or not new.is_active)
       and not exists (select 1 from public.profiles
                       where role = 'supervisor' and is_active and id <> old.id) then
      raise exception 'Debe quedar al menos un supervisor activo';
    end if;
    if old.role = 'vendedor' and (new.role <> 'vendedor' or not new.is_active)
       and exists (select 1 from public.clients where owner_id = old.id and not is_archived) then
      raise exception 'Reasigna los clientes de este vendedor antes de desactivarlo o cambiar su rol';
    end if;
  end if;
  if new.is_active and (tg_op = 'INSERT' or not old.is_active or new.role <> old.role) then
    select count(*) into v_count from public.profiles
     where role = new.role and is_active and id <> new.id;
    if new.role = 'vendedor' and v_count >= 10 then
      raise exception 'Límite alcanzado: máximo 10 vendedores activos';
    end if;
    if new.role = 'supervisor' and v_count >= 2 then
      raise exception 'Límite alcanzado: máximo 2 supervisores activos';
    end if;
  end if;
  return new;
end; $$;

create or replace function public.audit_profiles()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role <> old.role then
    perform public.write_audit(auth.uid(), 'usuario.cambio_rol', 'profile', new.id,
      jsonb_build_object('de', old.role, 'a', new.role));
  end if;
  if new.is_active <> old.is_active then
    perform public.write_audit(auth.uid(),
      case when new.is_active then 'usuario.reactivado' else 'usuario.desactivado' end,
      'profile', new.id, '{}'::jsonb);
  end if;
  return new;
end; $$;

-- CLIENTES: propietario válido; solo el supervisor reasigna y archiva
create or replace function public.guard_clients()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_sup boolean := public.is_supervisor();
begin
  if tg_op = 'INSERT' then
    if new.is_archived then
      raise exception 'Un cliente nuevo no puede nacer archivado';
    end if;
    if not exists (select 1 from public.profiles
                   where id = new.owner_id and role = 'vendedor' and is_active) then
      raise exception 'El cliente debe asignarse a un vendedor activo';
    end if;
    new.archived_at := null; new.archived_by := null;
    new.created_at := now(); new.updated_at := now();
    return new;
  end if;

  if new.created_by <> old.created_by or new.created_at <> old.created_at then
    raise exception 'Hay campos del cliente que no se pueden modificar' using errcode = '42501';
  end if;
  if not v_sup then
    if new.owner_id <> old.owner_id then
      raise exception 'Solo un supervisor puede reasignar clientes' using errcode = '42501';
    end if;
    if new.is_archived <> old.is_archived then
      raise exception 'Solo un supervisor puede archivar o restaurar clientes' using errcode = '42501';
    end if;
  end if;
  if (new.owner_id <> old.owner_id or (old.is_archived and not new.is_archived))
     and not exists (select 1 from public.profiles
                     where id = new.owner_id and role = 'vendedor' and is_active) then
    raise exception 'El cliente debe asignarse a un vendedor activo';
  end if;
  if new.is_archived and not old.is_archived then
    new.archived_at := now(); new.archived_by := auth.uid();
  elsif not new.is_archived and old.is_archived then
    new.archived_at := null; new.archived_by := null;
  else
    new.archived_at := old.archived_at; new.archived_by := old.archived_by;
  end if;
  return new;
end; $$;

-- CLIENTES (después de actualizar): cascada de reasignación y auditoría
create or replace function public.after_clients_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id <> old.owner_id then
    update public.opportunities set owner_id = new.owner_id
     where client_id = new.id and stage in ('nueva', 'oferta_enviada', 'negociacion');
    update public.tasks set owner_id = new.owner_id
     where client_id = new.id and status = 'pendiente';
    perform public.write_audit(auth.uid(), 'cliente.reasignado', 'client', new.id,
      jsonb_build_object('de', old.owner_id, 'a', new.owner_id));
  end if;
  if new.is_archived <> old.is_archived then
    perform public.write_audit(auth.uid(),
      case when new.is_archived then 'cliente.archivado' else 'cliente.restaurado' end,
      'client', new.id, '{}'::jsonb);
  end if;
  return new;
end; $$;

-- OPORTUNIDADES: coherencia con el cliente, cierre y archivado
create or replace function public.guard_opportunities()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_arch boolean; v_sup boolean := public.is_supervisor();
begin
  select owner_id, is_archived into v_owner, v_arch from public.clients where id = new.client_id;
  if not found then
    raise exception 'Cliente no encontrado';
  end if;
  if new.stage <> 'perdida' then
    new.loss_reason := null; new.loss_note := null;
  end if;

  if tg_op = 'INSERT' then
    if v_arch then
      raise exception 'No se pueden crear oportunidades en un cliente archivado';
    end if;
    if new.owner_id is null then new.owner_id := v_owner; end if;
    if new.owner_id <> v_owner then
      raise exception 'La oportunidad debe pertenecer al vendedor del cliente';
    end if;
    if new.is_archived then
      raise exception 'Una oportunidad nueva no puede nacer archivada';
    end if;
    new.archived_at := null; new.archived_by := null;
    new.closed_at := case when new.stage in ('ganada', 'perdida') then now() else null end;
    new.created_at := now(); new.updated_at := now();
    return new;
  end if;

  if new.client_id <> old.client_id or new.created_by <> old.created_by
     or new.created_at <> old.created_at then
    raise exception 'Hay campos de la oportunidad que no se pueden modificar' using errcode = '42501';
  end if;
  if not v_sup then
    if new.owner_id <> old.owner_id then
      raise exception 'Solo un supervisor puede reasignar oportunidades' using errcode = '42501';
    end if;
    if new.is_archived <> old.is_archived then
      raise exception 'Solo un supervisor puede archivar o restaurar oportunidades' using errcode = '42501';
    end if;
    if old.stage in ('ganada', 'perdida') then
      raise exception 'Una oportunidad cerrada solo la puede modificar un supervisor' using errcode = '42501';
    end if;
  end if;
  if new.owner_id <> old.owner_id and new.owner_id <> v_owner then
    raise exception 'La oportunidad debe pertenecer al vendedor del cliente';
  end if;
  if new.stage <> old.stage then
    new.closed_at := case when new.stage in ('ganada', 'perdida') then now() else null end;
  else
    new.closed_at := old.closed_at;
  end if;
  if new.is_archived and not old.is_archived then
    new.archived_at := now(); new.archived_by := auth.uid();
  elsif not new.is_archived and old.is_archived then
    new.archived_at := null; new.archived_by := null;
  else
    new.archived_at := old.archived_at; new.archived_by := old.archived_by;
  end if;
  return new;
end; $$;

create or replace function public.audit_opportunities()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.stage <> old.stage then
    perform public.write_audit(auth.uid(), 'oportunidad.cambio_etapa', 'opportunity', new.id,
      jsonb_build_object('de', old.stage, 'a', new.stage, 'importe', new.amount,
                         'motivo_perdida', new.loss_reason));
  end if;
  if new.is_archived <> old.is_archived then
    perform public.write_audit(auth.uid(),
      case when new.is_archived then 'oportunidad.archivada' else 'oportunidad.restaurada' end,
      'opportunity', new.id, '{}'::jsonb);
  end if;
  return new;
end; $$;

-- TAREAS: coherencia con el cliente y cierre
create or replace function public.guard_tasks()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_arch boolean; v_sup boolean := public.is_supervisor();
begin
  select owner_id, is_archived into v_owner, v_arch from public.clients where id = new.client_id;
  if not found then
    raise exception 'Cliente no encontrado';
  end if;
  if new.opportunity_id is not null and not exists (
       select 1 from public.opportunities o
        where o.id = new.opportunity_id and o.client_id = new.client_id) then
    raise exception 'La oportunidad no pertenece a este cliente';
  end if;

  if tg_op = 'INSERT' then
    if v_arch then
      raise exception 'No se pueden crear tareas en un cliente archivado';
    end if;
    if new.owner_id is null then new.owner_id := v_owner; end if;
    if new.owner_id <> v_owner then
      raise exception 'La tarea debe pertenecer al vendedor del cliente';
    end if;
    if new.status <> 'pendiente' then
      raise exception 'Una tarea nueva debe estar pendiente';
    end if;
    new.completed_at := null; new.created_at := now(); new.updated_at := now();
    return new;
  end if;

  if new.client_id <> old.client_id or new.created_by <> old.created_by
     or new.created_at <> old.created_at then
    raise exception 'Hay campos de la tarea que no se pueden modificar' using errcode = '42501';
  end if;
  if not v_sup then
    if new.owner_id <> old.owner_id then
      raise exception 'Solo un supervisor puede reasignar tareas' using errcode = '42501';
    end if;
    if old.status <> 'pendiente' then
      raise exception 'Una tarea hecha o cancelada no se puede modificar' using errcode = '42501';
    end if;
  end if;
  if new.owner_id <> old.owner_id and new.owner_id <> v_owner then
    raise exception 'La tarea debe pertenecer al vendedor del cliente';
  end if;
  if new.status <> old.status then
    new.completed_at := case when new.status = 'pendiente' then null else now() end;
  else
    new.completed_at := old.completed_at;
  end if;
  return new;
end; $$;

-- ACTIVIDADES: coherencia y fecha no futura (inserción)
create or replace function public.guard_activities()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_arch boolean;
begin
  select is_archived into v_arch from public.clients where id = new.client_id;
  if not found then
    raise exception 'Cliente no encontrado';
  end if;
  if v_arch then
    raise exception 'No se pueden registrar actividades en un cliente archivado';
  end if;
  if new.opportunity_id is not null and not exists (
       select 1 from public.opportunities o
        where o.id = new.opportunity_id and o.client_id = new.client_id) then
    raise exception 'La oportunidad no pertenece a este cliente';
  end if;
  new.created_at := now();
  if new.occurred_at is null then new.occurred_at := now(); end if;
  if new.occurred_at > now() + interval '5 minutes' then
    raise exception 'La fecha de la actividad no puede ser futura';
  end if;
  return new;
end; $$;

-- AJUSTES
create or replace function public.guard_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.id <> old.id then
    raise exception 'La fila de ajustes es única' using errcode = '42501';
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end; $$;

create or replace function public.audit_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.write_audit(auth.uid(), 'ajustes.actualizados', 'settings', null,
    jsonb_build_object(
      'antes',   jsonb_build_object('summary_enabled', old.summary_enabled, 'summary_hour', old.summary_hour),
      'despues', jsonb_build_object('summary_enabled', new.summary_enabled, 'summary_hour', new.summary_hour)));
  return new;
end; $$;

-- =========================================================================
-- 4.3 Funciones de negocio (RPC)
-- =========================================================================

-- Comprobación de teléfono sin revelar datos de otros vendedores
create or replace function public.phone_status(p_phone text)
returns text language plpgsql stable security definer set search_path = public as $$
declare v_owner uuid; v_arch boolean;
begin
  if not public.is_active_user() then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_phone is null or p_phone !~ '^\+[1-9][0-9]{7,14}$' then
    return 'formato_invalido';
  end if;
  select owner_id, is_archived into v_owner, v_arch from public.clients where phone = p_phone;
  if not found then return 'libre'; end if;
  if v_arch then return 'archivado'; end if;
  if v_owner = auth.uid() then return 'propio'; end if;
  return 'otro_vendedor';
end; $$;

-- Marca que el usuario ya cambió su contraseña temporal
create or replace function public.mark_password_changed()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  update public.profiles set must_change_password = false where id = auth.uid() and is_active;
end; $$;

-- Reasignación de clientes (solo supervisor). Security invoker: aplica RLS.
create or replace function public.reassign_clients(p_from uuid, p_to uuid, p_client_ids uuid[] default null)
returns integer language plpgsql security invoker set search_path = public as $$
declare v_n integer;
begin
  if not public.is_supervisor() then
    raise exception 'Solo un supervisor puede reasignar clientes' using errcode = '42501';
  end if;
  if p_from = p_to then
    raise exception 'El vendedor de origen y el de destino deben ser distintos';
  end if;
  if not exists (select 1 from public.profiles where id = p_to and role = 'vendedor' and is_active) then
    raise exception 'El vendedor de destino debe ser un vendedor activo';
  end if;
  update public.clients set owner_id = p_to
   where owner_id = p_from and not is_archived
     and (p_client_ids is null or id = any (p_client_ids));
  get diagnostics v_n = row_count;
  return v_n;
end; $$;

-- Solicitud de envío manual del resumen (solo supervisor, con espera mínima)
create or replace function public.request_manual_summary(p_target uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_s public.settings; v_last timestamptz; v_id uuid;
begin
  if not public.is_supervisor() then
    raise exception 'Solo un supervisor puede solicitar el envío del resumen' using errcode = '42501';
  end if;
  select * into v_s from public.settings where id = 1 for update;   -- serializa solicitudes
  if not found then
    raise exception 'Falta la fila de ajustes';
  end if;
  if p_target is not null and not exists (
       select 1 from public.profiles where id = p_target and role = 'vendedor' and is_active) then
    raise exception 'El destinatario debe ser un vendedor activo';
  end if;
  select max(requested_at) into v_last from public.summary_runs where trigger_type = 'manual';
  if v_last is not null and v_last > now() - make_interval(mins => v_s.manual_cooldown_minutes) then
    raise exception 'Espera % minutos entre envíos manuales', v_s.manual_cooldown_minutes;
  end if;
  insert into public.summary_runs (trigger_type, run_date, target_profile_id, requested_by, status)
  values ('manual', (now() at time zone v_s.time_zone)::date, p_target, auth.uid(), 'pendiente')
  returning id into v_id;
  perform public.write_audit(auth.uid(), 'resumen.solicitado', 'summary_run', v_id,
    jsonb_build_object('destinatario', coalesce(p_target::text, 'todos')));
  return v_id;
end; $$;

-- Datos del resumen de un vendedor (solo service_role)
create or replace function public.get_summary_data(p_profile_id uuid, p_today date)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'tasks_today', coalesce((
      select jsonb_agg(jsonb_build_object(
               'hora', to_char(t.due_at at time zone 'Europe/Madrid', 'HH24:MI'),
               'titulo', t.title, 'cliente', c.trade_name) order by t.due_at)
        from public.tasks t join public.clients c on c.id = t.client_id
       where t.owner_id = p_profile_id and t.status = 'pendiente' and not c.is_archived
         and (t.due_at at time zone 'Europe/Madrid')::date = p_today), '[]'::jsonb),
    'tasks_overdue', coalesce((
      select jsonb_agg(jsonb_build_object(
               'fecha', to_char(t.due_at at time zone 'Europe/Madrid', 'DD/MM/YYYY HH24:MI'),
               'titulo', t.title, 'cliente', c.trade_name) order by t.due_at)
        from public.tasks t join public.clients c on c.id = t.client_id
       where t.owner_id = p_profile_id and t.status = 'pendiente' and not c.is_archived
         and (t.due_at at time zone 'Europe/Madrid')::date < p_today), '[]'::jsonb),
    'closing_7d', coalesce((
      select jsonb_agg(jsonb_build_object(
               'fecha', to_char(o.expected_close_date, 'DD/MM/YYYY'),
               'titulo', o.title, 'cliente', c.trade_name, 'importe', o.amount)
               order by o.expected_close_date)
        from public.opportunities o join public.clients c on c.id = o.client_id
       where o.owner_id = p_profile_id and not o.is_archived and not c.is_archived
         and o.stage in ('nueva', 'oferta_enviada', 'negociacion')
         and o.expected_close_date between p_today and p_today + 7), '[]'::jsonb),
    'open_total', coalesce((
      select sum(o.amount) from public.opportunities o join public.clients c on c.id = o.client_id
       where o.owner_id = p_profile_id and not o.is_archived and not c.is_archived
         and o.stage in ('nueva', 'oferta_enviada', 'negociacion')), 0)
  );
$$;

-- Entrega a n8n el siguiente envío (manual pendiente o programado del día). Solo service_role.
create or replace function public.claim_summary_run(p_now timestamptz default now())
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_s public.settings;
  v_local timestamp; v_date date; v_hour integer; v_dow integer;
  v_run public.summary_runs;
  v_cnt integer;
  v_recipients jsonb;
begin
  select * into v_s from public.settings where id = 1;
  if not found then
    raise exception 'Falta la fila de ajustes';
  end if;
  v_local := p_now at time zone v_s.time_zone;
  v_date  := v_local::date;
  v_hour  := extract(hour from v_local)::integer;
  v_dow   := extract(isodow from v_local)::integer;

  -- 1) Ejecuciones colgadas más de 30 minutos -> fallido
  with stuck as (
    update public.summary_runs
       set status = 'fallido', finished_at = p_now,
           error_message = 'Sin confirmación de n8n en 30 minutos'
     where status = 'en_proceso' and claimed_at < p_now - interval '30 minutes'
     returning id)
  update public.summary_deliveries
     set status = 'fallido', error_message = 'Sin confirmación de n8n', reported_at = p_now
   where run_id in (select id from stuck) and status = 'pendiente';
  update public.summary_runs r
     set sent_count   = (select count(*) from public.summary_deliveries d where d.run_id = r.id and d.status = 'enviado'),
         failed_count = (select count(*) from public.summary_deliveries d where d.run_id = r.id and d.status = 'fallido')
   where r.status = 'fallido' and r.finished_at = p_now;

  -- 2) Primero, los envíos manuales en cola
  select * into v_run from public.summary_runs
   where status = 'pendiente' and trigger_type = 'manual'
   order by requested_at limit 1 for update skip locked;

  -- 3) Si no hay manual, el programado del día
  if not found then
    v_run := null;
    if v_s.summary_enabled and v_dow = any (v_s.summary_days) and v_hour >= v_s.summary_hour
       and not exists (select 1 from public.summary_runs
                        where trigger_type = 'programado' and run_date = v_date) then
      if v_hour < v_s.recovery_until_hour then
        insert into public.summary_runs (trigger_type, run_date, status)
        values ('programado', v_date, 'pendiente')
        on conflict (run_date) where trigger_type = 'programado' do nothing
        returning * into v_run;
      else
        insert into public.summary_runs (trigger_type, run_date, status, finished_at, error_message)
        values ('programado', v_date, 'omitido', p_now, 'Fuera de la ventana de recuperación')
        on conflict (run_date) where trigger_type = 'programado' do nothing
        returning * into v_run;
        if v_run.id is not null then
          perform public.write_audit(null, 'resumen.omitido', 'summary_run', v_run.id,
            jsonb_build_object('fecha', to_char(v_date, 'DD/MM/YYYY')));
        end if;
        return jsonb_build_object('run_id', null, 'recipients', '[]'::jsonb);
      end if;
    end if;
  end if;

  if v_run.id is null then
    return jsonb_build_object('run_id', null, 'recipients', '[]'::jsonb);
  end if;

  -- 4) Destinatarios: vendedores activos (o el destinatario indicado)
  insert into public.summary_deliveries (run_id, profile_id, email)
  select v_run.id, p.id, p.email
    from public.profiles p
   where p.role = 'vendedor' and p.is_active
     and (v_run.target_profile_id is null or p.id = v_run.target_profile_id);
  get diagnostics v_cnt = row_count;

  update public.summary_runs
     set status = case when v_cnt = 0 then 'completado'::public.summary_run_status
                       else 'en_proceso'::public.summary_run_status end,
         claimed_at = p_now,
         finished_at = case when v_cnt = 0 then p_now else null end,
         total_recipients = v_cnt
   where id = v_run.id;

  if v_cnt = 0 then
    perform public.write_audit(null, 'resumen.finalizado', 'summary_run', v_run.id,
      jsonb_build_object('enviados', 0, 'fallidos', 0, 'estado', 'completado'));
    return jsonb_build_object('run_id', null, 'recipients', '[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(
           jsonb_build_object('run_id', v_run.id, 'profile_id', p.id,
                              'email', p.email, 'full_name', p.full_name)
           || public.get_summary_data(p.id, v_date)
           order by p.full_name), '[]'::jsonb)
    into v_recipients
    from public.summary_deliveries d join public.profiles p on p.id = d.profile_id
   where d.run_id = v_run.id;

  return jsonb_build_object(
    'run_id', v_run.id,
    'trigger_type', v_run.trigger_type,
    'run_date', to_char(v_date, 'DD/MM/YYYY'),
    'recipients', v_recipients);
end; $$;

-- Registra el resultado de un destinatario y cierra la ejecución. Solo service_role.
create or replace function public.record_summary_delivery(
  p_run_id uuid, p_profile_id uuid, p_ok boolean,
  p_provider_message_id text default null, p_error text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_run public.summary_runs; v_sent integer; v_failed integer;
        v_status public.summary_run_status;
begin
  select * into v_run from public.summary_runs where id = p_run_id for update;
  if not found then
    raise exception 'Envío no encontrado';
  end if;
  if v_run.status <> 'en_proceso' then
    raise exception 'El envío no está en proceso';
  end if;
  update public.summary_deliveries
     set status = case when p_ok then 'enviado'::public.delivery_status
                       else 'fallido'::public.delivery_status end,
         provider_message_id = left(p_provider_message_id, 200),
         error_message = case when p_ok then null
                              else left(coalesce(p_error, 'Error desconocido'), 500) end,
         reported_at = now()
   where run_id = p_run_id and profile_id = p_profile_id and status = 'pendiente';
  if not found then
    raise exception 'Destinatario no válido o ya informado';
  end if;

  select count(*) filter (where status = 'enviado'),
         count(*) filter (where status = 'fallido')
    into v_sent, v_failed
    from public.summary_deliveries where run_id = p_run_id;

  if v_sent + v_failed >= v_run.total_recipients then
    v_status := case when v_failed = 0 then 'completado'::public.summary_run_status
                     when v_sent = 0  then 'fallido'::public.summary_run_status
                     else 'con_errores'::public.summary_run_status end;
    update public.summary_runs
       set sent_count = v_sent, failed_count = v_failed, status = v_status, finished_at = now()
     where id = p_run_id;
    perform public.write_audit(null, 'resumen.finalizado', 'summary_run', p_run_id,
      jsonb_build_object('enviados', v_sent, 'fallidos', v_failed, 'estado', v_status));
  else
    update public.summary_runs set sent_count = v_sent, failed_count = v_failed where id = p_run_id;
  end if;

  return jsonb_build_object('run_id', p_run_id, 'enviados', v_sent, 'fallidos', v_failed,
                            'estado', coalesce(v_status::text, 'en_proceso'));
end; $$;

-- Alta de perfil tras crear el usuario en Supabase Auth. Solo service_role.
create or replace function public.create_profile_for_user(
  p_user_id uuid, p_full_name text, p_email text, p_role public.user_role, p_actor_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_actor_id is not null and not exists (
       select 1 from public.profiles where id = p_actor_id and role = 'supervisor' and is_active) then
    raise exception 'Solo un supervisor activo puede dar de alta usuarios' using errcode = '42501';
  end if;
  insert into public.profiles (id, full_name, email, role, must_change_password)
  values (p_user_id, btrim(p_full_name), lower(btrim(p_email)), p_role, true);
  perform public.write_audit(p_actor_id, 'usuario.alta', 'profile', p_user_id,
    jsonb_build_object('rol', p_role));
end; $$;

-- Registro de contraseña temporal asignada por el supervisor. Solo service_role.
create or replace function public.log_password_reset(p_actor_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles
                 where id = p_actor_id and role = 'supervisor' and is_active) then
    raise exception 'Solo un supervisor activo puede asignar contraseñas temporales' using errcode = '42501';
  end if;
  if p_actor_id = p_user_id then
    raise exception 'Usa Mi cuenta para cambiar tu propia contraseña';
  end if;
  update public.profiles set must_change_password = true where id = p_user_id;
  if not found then
    raise exception 'Usuario no encontrado';
  end if;
  perform public.write_audit(p_actor_id, 'usuario.contrasena_restablecida', 'profile', p_user_id, '{}'::jsonb);
end; $$;
```

---

## 6. Script 05 — Triggers
**Migración:** `crm123_05_triggers`

Los triggers `BEFORE` se ejecutan por orden alfabético, de ahí los prefijos numéricos.

```sql
-- profiles
create trigger trg_profiles_10_guard      before insert or update on public.profiles
  for each row execute function public.guard_profiles();
create trigger trg_profiles_20_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_profiles_30_audit      after update on public.profiles
  for each row execute function public.audit_profiles();

-- clients
create trigger trg_clients_10_guard       before insert or update on public.clients
  for each row execute function public.guard_clients();
create trigger trg_clients_20_updated_at  before update on public.clients
  for each row execute function public.set_updated_at();
create trigger trg_clients_30_after       after update on public.clients
  for each row execute function public.after_clients_update();

-- opportunities
create trigger trg_opportunities_10_guard      before insert or update on public.opportunities
  for each row execute function public.guard_opportunities();
create trigger trg_opportunities_20_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();
create trigger trg_opportunities_30_audit      after update on public.opportunities
  for each row execute function public.audit_opportunities();

-- tasks
create trigger trg_tasks_10_guard         before insert or update on public.tasks
  for each row execute function public.guard_tasks();
create trigger trg_tasks_20_updated_at    before update on public.tasks
  for each row execute function public.set_updated_at();

-- activities (solo inserción)
create trigger trg_activities_10_guard       before insert on public.activities
  for each row execute function public.guard_activities();
create trigger trg_activities_90_immutable   before update or delete on public.activities
  for each row execute function public.prevent_mutation();
create trigger trg_activities_91_no_truncate before truncate on public.activities
  for each statement execute function public.prevent_mutation();

-- audit_log (solo inserción)
create trigger trg_audit_log_90_immutable    before update or delete on public.audit_log
  for each row execute function public.prevent_mutation();
create trigger trg_audit_log_91_no_truncate  before truncate on public.audit_log
  for each statement execute function public.prevent_mutation();

-- settings
create trigger trg_settings_10_guard      before update on public.settings
  for each row execute function public.guard_settings();
create trigger trg_settings_30_audit      after update on public.settings
  for each row execute function public.audit_settings();
```

---

## 7. Script 06 — Vistas
**Migración:** `crm123_06_vistas`

```sql
create view public.v_seller_kpis with (security_invoker = true) as
select
  p.id as profile_id,
  p.full_name,
  p.is_active,
  (select count(*) from public.tasks t join public.clients c on c.id = t.client_id
    where t.owner_id = p.id and t.status = 'pendiente' and not c.is_archived
      and (t.due_at at time zone 'Europe/Madrid')::date = (now() at time zone 'Europe/Madrid')::date
  )::integer as tasks_today,
  (select count(*) from public.tasks t join public.clients c on c.id = t.client_id
    where t.owner_id = p.id and t.status = 'pendiente' and not c.is_archived
      and (t.due_at at time zone 'Europe/Madrid')::date < (now() at time zone 'Europe/Madrid')::date
  )::integer as tasks_overdue,
  (select count(*) from public.opportunities o
    where o.owner_id = p.id and not o.is_archived
      and o.stage in ('nueva', 'oferta_enviada', 'negociacion')
  )::integer as open_opps_count,
  (select coalesce(sum(o.amount), 0) from public.opportunities o
    where o.owner_id = p.id and not o.is_archived
      and o.stage in ('nueva', 'oferta_enviada', 'negociacion')
  )::numeric(14,2) as open_opps_amount,
  (select coalesce(sum(o.amount), 0) from public.opportunities o
    where o.owner_id = p.id and not o.is_archived and o.stage = 'ganada'
      and date_trunc('month', o.closed_at at time zone 'Europe/Madrid')
        = date_trunc('month', now() at time zone 'Europe/Madrid')
  )::numeric(14,2) as won_month_amount
from public.profiles p
where p.role = 'vendedor';

create view public.v_clients_list with (security_invoker = true) as
select
  c.id, c.trade_name, c.business_type, c.contact_name, c.phone, c.email,
  c.delivery_address, c.city, c.province, c.notes,
  c.owner_id, p.full_name as owner_name,
  c.is_archived, c.archived_at, c.created_at, c.updated_at,
  (select count(*) from public.opportunities o
    where o.client_id = c.id and not o.is_archived
      and o.stage in ('nueva', 'oferta_enviada', 'negociacion'))::integer as open_opps_count,
  (select max(a.occurred_at) from public.activities a where a.client_id = c.id) as last_activity_at
from public.clients c
left join public.profiles p on p.id = c.owner_id;

create view public.v_opportunities_list with (security_invoker = true) as
select
  o.id, o.client_id, c.trade_name as client_name, c.phone as client_phone,
  o.owner_id, p.full_name as owner_name,
  o.title, o.description, o.amount, o.stage, o.expected_close_date,
  o.loss_reason, o.loss_note, o.closed_at,
  o.is_archived, o.created_at, o.updated_at,
  (o.stage in ('nueva', 'oferta_enviada', 'negociacion')) as is_open
from public.opportunities o
join public.clients c on c.id = o.client_id
left join public.profiles p on p.id = o.owner_id;

create view public.v_tasks_list with (security_invoker = true) as
select
  t.id, t.client_id, c.trade_name as client_name, c.phone as client_phone,
  t.opportunity_id, o.title as opportunity_title,
  t.owner_id, p.full_name as owner_name,
  t.title, t.due_at, t.status, t.completed_at, t.created_at,
  case
    when t.status <> 'pendiente' then 'cerrada'
    when (t.due_at at time zone 'Europe/Madrid')::date < (now() at time zone 'Europe/Madrid')::date then 'vencida'
    when (t.due_at at time zone 'Europe/Madrid')::date = (now() at time zone 'Europe/Madrid')::date then 'hoy'
    else 'proxima'
  end as bucket
from public.tasks t
join public.clients c on c.id = t.client_id
left join public.opportunities o on o.id = t.opportunity_id
left join public.profiles p on p.id = t.owner_id
where not c.is_archived;
```

---

## 8. Script 07 — Seguridad por fila (RLS) y políticas
**Migración:** `crm123_07_rls`

Reglas de este script:

- RLS activa en **todas** las tablas.
- **Ninguna** política de DELETE ni de tipo ALL.
- Toda política de UPDATE lleva `with check`.
- La única política con condición `true` es el SELECT de `settings`.

```sql
alter table public.profiles            enable row level security;
alter table public.clients             enable row level security;
alter table public.opportunities       enable row level security;
alter table public.tasks               enable row level security;
alter table public.activities          enable row level security;
alter table public.audit_log           enable row level security;
alter table public.settings            enable row level security;
alter table public.summary_runs        enable row level security;
alter table public.summary_deliveries  enable row level security;

-- PROFILES
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_supervisor());
create policy profiles_update_supervisor on public.profiles for update to authenticated
  using (public.is_supervisor())
  with check (public.is_supervisor());

-- CLIENTS
create policy clients_select on public.clients for select to authenticated
  using (public.is_supervisor() or (owner_id = auth.uid() and public.is_active_user()));
create policy clients_insert on public.clients for insert to authenticated
  with check (public.is_active_user() and created_by = auth.uid()
              and (public.is_supervisor() or owner_id = auth.uid()));
create policy clients_update on public.clients for update to authenticated
  using (public.is_supervisor() or (owner_id = auth.uid() and public.is_active_user() and not is_archived))
  with check (public.is_supervisor() or (owner_id = auth.uid() and public.is_active_user() and not is_archived));

-- OPPORTUNITIES
create policy opportunities_select on public.opportunities for select to authenticated
  using (public.is_supervisor()
         or (public.is_active_user() and (owner_id = auth.uid() or public.owns_client(client_id))));
create policy opportunities_insert on public.opportunities for insert to authenticated
  with check (public.is_active_user() and created_by = auth.uid()
              and (public.is_supervisor()
                   or (owner_id = auth.uid() and public.owns_active_client(client_id))));
create policy opportunities_update on public.opportunities for update to authenticated
  using (public.is_supervisor() or (owner_id = auth.uid() and public.is_active_user() and not is_archived))
  with check (public.is_supervisor()
              or (owner_id = auth.uid() and public.is_active_user() and not is_archived
                  and public.owns_active_client(client_id)));

-- TASKS
create policy tasks_select on public.tasks for select to authenticated
  using (public.is_supervisor()
         or (public.is_active_user() and (owner_id = auth.uid() or public.owns_client(client_id))));
create policy tasks_insert on public.tasks for insert to authenticated
  with check (public.is_active_user() and created_by = auth.uid()
              and (public.is_supervisor()
                   or (owner_id = auth.uid() and public.owns_active_client(client_id))));
create policy tasks_update on public.tasks for update to authenticated
  using (public.is_supervisor() or (owner_id = auth.uid() and public.is_active_user()))
  with check (public.is_supervisor()
              or (owner_id = auth.uid() and public.is_active_user()
                  and public.owns_active_client(client_id)));

-- ACTIVITIES (solo SELECT e INSERT)
create policy activities_select on public.activities for select to authenticated
  using (public.is_supervisor()
         or (public.is_active_user() and (created_by = auth.uid() or public.owns_client(client_id))));
create policy activities_insert on public.activities for insert to authenticated
  with check (public.is_active_user() and created_by = auth.uid()
              and (public.is_supervisor() or public.owns_active_client(client_id)));

-- AUDIT_LOG (solo lectura del supervisor; las inserciones las hacen triggers y funciones definer)
create policy audit_log_select_supervisor on public.audit_log for select to authenticated
  using (public.is_supervisor());

-- SETTINGS (única política con condición true)
create policy settings_select on public.settings for select to authenticated
  using (true);
create policy settings_update_supervisor on public.settings for update to authenticated
  using (public.is_supervisor())
  with check (public.is_supervisor());

-- SUMMARY_RUNS y SUMMARY_DELIVERIES (lectura del supervisor; escritura solo por funciones)
create policy summary_runs_select_supervisor on public.summary_runs for select to authenticated
  using (public.is_supervisor());
create policy summary_deliveries_select_supervisor on public.summary_deliveries for select to authenticated
  using (public.is_supervisor());
```

---

## 9. Script 08 — Permisos (grants)
**Migración:** `crm123_08_permisos`

```sql
-- 1) Quitar todo lo heredado por defecto
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated, service_role;
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

-- 2) Ningún rol puede borrar ni vaciar tablas (tampoco service_role)
revoke delete, truncate on all tables in schema public from service_role;

-- 3) Permisos mínimos para usuarios autenticados (RLS decide las filas)
grant select on public.profiles to authenticated;
grant update (full_name, role, is_active) on public.profiles to authenticated;

grant select, insert on public.clients to authenticated;
grant update (trade_name, business_type, contact_name, phone, email, delivery_address,
              city, province, notes, owner_id, is_archived) on public.clients to authenticated;

grant select, insert on public.opportunities to authenticated;
grant update (title, description, amount, stage, expected_close_date, loss_reason, loss_note,
              owner_id, is_archived) on public.opportunities to authenticated;

grant select, insert on public.tasks to authenticated;
grant update (title, due_at, status, opportunity_id, owner_id) on public.tasks to authenticated;

grant select, insert on public.activities to authenticated;
grant select on public.audit_log to authenticated;
grant select on public.settings to authenticated;
grant update (summary_enabled, summary_hour) on public.settings to authenticated;
grant select on public.summary_runs to authenticated;
grant select on public.summary_deliveries to authenticated;

grant select on public.v_seller_kpis, public.v_clients_list,
                public.v_opportunities_list, public.v_tasks_list to authenticated;

-- 4) service_role (solo servidor): lectura y escritura sin borrado
grant select, insert, update on all tables in schema public to service_role;
revoke delete, truncate on all tables in schema public from service_role;

-- 5) Funciones
grant execute on function public.is_supervisor()                          to authenticated;
grant execute on function public.is_active_user()                         to authenticated;
grant execute on function public.owns_client(uuid)                        to authenticated;
grant execute on function public.owns_active_client(uuid)                 to authenticated;
grant execute on function public.phone_status(text)                       to authenticated;
grant execute on function public.mark_password_changed()                  to authenticated;
grant execute on function public.reassign_clients(uuid, uuid, uuid[])     to authenticated;
grant execute on function public.request_manual_summary(uuid)             to authenticated;

grant execute on function public.claim_summary_run(timestamptz)                           to service_role;
grant execute on function public.record_summary_delivery(uuid, uuid, boolean, text, text) to service_role;
grant execute on function public.get_summary_data(uuid, date)                             to service_role;
grant execute on function public.create_profile_for_user(uuid, text, text, public.user_role, uuid) to service_role;
grant execute on function public.log_password_reset(uuid, uuid)                           to service_role;
```

---

## 10. Script 09 — Datos iniciales
**Migración:** `crm123_09_datos_iniciales`

```sql
insert into public.settings (id) values (1) on conflict (id) do nothing;
```

---

## 11. Script 10 — Primeros usuarios (bootstrap)
**Ejecución:** con `execute_sql`, no como migración, porque contiene emails reales.

**Paso previo del humano en el panel de Supabase**, en *Authentication → Users → Add user → Create new user*:

1. Crear **4 usuarios** con email y contraseña temporal (mínimo 10 caracteres), marcando **Auto Confirm User**:
   - Supervisor 1 y Supervisor 2, con sus emails reales.
   - **Vendedor de prueba 1:** usar **el mismo email con el que se creará (o se creó) la cuenta de Resend**. Con el remitente `onboarding@resend.dev`, Resend solo entrega a ese email, y lo necesitaremos en las pruebas del Hito 4.
   - **Vendedor de prueba 2:** cualquier email propio.
2. Comunicar a Claude.ai los 4 emails y nombres.

Después, Claude.ai ejecuta (sustituyendo los valores):

```sql
select public.create_profile_for_user(u.id, x.full_name, u.email, x.role::public.user_role, null)
from (values
  ('supervisor1@EMPRESA.es',      'NOMBRE SUPERVISOR 1', 'supervisor'),
  ('supervisor2@EMPRESA.es',      'NOMBRE SUPERVISOR 2', 'supervisor'),
  ('EMAIL-TITULAR-RESEND',        'Vendedor Prueba 1',   'vendedor'),
  ('vendedor2.prueba@EMPRESA.es', 'Vendedor Prueba 2',   'vendedor')
) as x(email, full_name, role)
join auth.users u on lower(u.email) = lower(x.email);

-- Comprobación: deben salir 4 filas, must_change_password = true
select email, full_name, role, is_active, must_change_password from public.profiles order by role, email;
```

> Antes de la puesta en marcha real, los vendedores de prueba se **desactivan**, nunca se borran, desde la PWA, y sus clientes de prueba se archivan.

---

## 12. Verificaciones estructurales
Ejecutar cada consulta con `execute_sql` y comparar con lo esperado.

**V01 — RLS activa en todas las tablas.** Esperado: 9 filas, todas con `rls = true`.
```sql
select c.relname as tabla, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' order by 1;
```

**V02 — Ninguna política de DELETE ni ALL.** Esperado: `0`.
```sql
select count(*) from pg_policies where schemaname = 'public' and cmd in ('DELETE', 'ALL');
```

**V03 — Toda política UPDATE tiene `with check`.** Esperado: 0 filas.
```sql
select tablename, policyname from pg_policies
where schemaname = 'public' and cmd = 'UPDATE' and with_check is null;
```

**V04 — `activities` y `audit_log` sin UPDATE ni DELETE.** Esperado: 0 filas.
```sql
select tablename, policyname, cmd from pg_policies
where schemaname = 'public' and tablename in ('activities', 'audit_log') and cmd <> 'SELECT' and cmd <> 'INSERT';
```

**V05 — Políticas con condición `true`.** Esperado: exactamente 1 fila, `settings | settings_select | SELECT`.
```sql
select tablename, policyname, cmd from pg_policies
where schemaname = 'public' and (trim(qual) = 'true' or trim(with_check) = 'true');
```

**V06 — Inventario de políticas.** Esperado: 18 políticas.

| Tabla | Nº de políticas |
|---|---|
| profiles | 2 |
| clients | 3 |
| opportunities | 3 |
| tasks | 3 |
| activities | 2 |
| audit_log | 1 |
| settings | 2 |
| summary_runs | 1 |
| summary_deliveries | 1 |

```sql
select tablename, count(*) from pg_policies where schemaname = 'public' group by 1 order by 1;
```

**V07 — Vistas con `security_invoker = true`.** Esperado: 4 vistas (`v_clients_list`, `v_opportunities_list`, `v_seller_kpis`, `v_tasks_list`), todas `ok = true`.
```sql
select c.relname as vista, coalesce('security_invoker=true' = any (c.reloptions), false) as ok
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v' order by 1;
```

**V08 — Funciones `security definer` con `search_path = public`.** Esperado: 0 filas en la primera consulta y 23 en la segunda.
```sql
select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef
  and not coalesce('search_path=public' = any (p.proconfig), false);

select count(*) as definer_ok from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prosecdef and 'search_path=public' = any (p.proconfig);
```

**V09 — Inventario de funciones.** Esperado: 26 funciones, todas con `search_path=public`.
```sql
select p.proname, p.prosecdef as definer, p.proconfig
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by 1;
```
Lista esperada:

- after_clients_update
- audit_opportunities
- audit_profiles
- audit_settings
- claim_summary_run
- create_profile_for_user
- get_summary_data
- guard_activities
- guard_clients
- guard_opportunities
- guard_profiles
- guard_settings
- guard_tasks
- is_active_user
- is_supervisor
- log_password_reset
- mark_password_changed
- owns_active_client
- owns_client
- phone_status
- prevent_mutation
- reassign_clients (invoker)
- record_summary_delivery
- request_manual_summary
- set_updated_at (invoker)
- write_audit

`prevent_mutation` también es invoker.

**V10 — Claves foráneas.** Esperado: 21 filas, todas con `regla_borrado = r` (restrict).
```sql
select conrelid::regclass as tabla, conname, confrelid::regclass as referencia, confdeltype as regla_borrado
from pg_constraint where contype = 'f' and connamespace = 'public'::regnamespace order by 1, 2;
```

**V11 — Restricciones únicas y de comprobación.** Esperado: **3 `unique`** y **36 `check`**, todas con los nombres del script 02.

- **Únicas:**
  - profiles_email_key
  - clients_phone_key
  - summary_deliveries_run_profile_key
- **Check, por tabla** (sufijo `_chk`):

| Tabla | Nº | Restricciones |
|---|---|---|
| profiles | 2 | full_name, email |
| clients | 9 | trade_name, contact_name, phone, email, delivery_address, city, province, notes, archive |
| opportunities | 7 | title, description, amount, loss_reason, loss_note, closed_at, archive |
| tasks | 2 | title, completed_at |
| activities | 2 | description, occurred_at |
| audit_log | 2 | action, entity |
| settings | 6 | singleton, summary_hour, summary_days, recovery, cooldown, time_zone |
| summary_runs | 3 | counts, trigger, error |
| summary_deliveries | 3 | status, provider, error |

Si la versión de Postgres lista también las restricciones `NOT NULL` (tipo `n`), no cuentan en esta verificación.

```sql
select contype, count(*) from pg_constraint
where connamespace = 'public'::regnamespace and contype in ('u', 'c') group by 1;

select conrelid::regclass as tabla, conname, contype
from pg_constraint where connamespace = 'public'::regnamespace and contype in ('u', 'c')
order by 1, 2;
```

**V12 — Índices.** Esperado: 38 índices (incluidas las claves primarias y las restricciones únicas).
```sql
select tablename, indexname from pg_indexes where schemaname = 'public' order by 1, 2;
```

**V13 — Tipos enumerados.** Esperado: 9 tipos con los valores de la sección 1.1, en ese orden.
```sql
select t.typname, string_agg(e.enumlabel, ', ' order by e.enumsortorder) as valores
from pg_type t join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public'
group by 1 order by 1;
```

**V14 — Triggers.** Esperado: 18 triggers con los nombres del script 05.
```sql
select event_object_table as tabla, trigger_name, action_timing, string_agg(event_manipulation, ',') as eventos
from information_schema.triggers where trigger_schema = 'public'
group by 1, 2, 3 order by 1, 2;
```
`information_schema` no lista los triggers de TRUNCATE. Para el total, usar también:
```sql
select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and not t.tgisinternal;
```
Esperado: `18`.

**V15 — Sin permisos de borrado y anon sin acceso.** Esperado: 0 filas en ambas consultas.
```sql
select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and privilege_type in ('DELETE', 'TRUNCATE')
  and grantee in ('anon', 'authenticated', 'service_role');

select table_name, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon';
```

**V16 — Permisos de ejecución de funciones.** Esperado: 8 filas para `authenticated` (las de la sección 9, punto 5) y 5 para `service_role`. Ninguna para `anon` ni `public`.
```sql
select routine_name, grantee from information_schema.routine_privileges
where routine_schema = 'public' and grantee in ('anon', 'authenticated', 'service_role', 'PUBLIC')
order by grantee, routine_name;
```

**V17 — Fila de ajustes.** Esperado: 1 fila con `true | 7 | {1,2,3,4,5,6} | 12 | 10 | Europe/Madrid`.
```sql
select summary_enabled, summary_hour, summary_days, recovery_until_hour, manual_cooldown_minutes, time_zone
from public.settings;
```

**V18 — Asesor de seguridad de Supabase.** Ejecutar `get_advisors` con `type = security`. Esperado: ningún aviso de nivel **ERROR**. Los avisos informativos del Auth, como la protección de contraseñas filtradas (que depende del plan), se informan al humano sin bloquear.

---

## 13. Pruebas funcionales
Requisitos previos:

- Haber ejecutado el script 10, con al menos 1 supervisor activo y 2 vendedores activos.
- No hay datos reales todavía.

Cada bloque empieza en `begin` y termina en `rollback`, así que no deja datos.

> **Si el conector no admitiera `begin`/`rollback`:** ejecutar el contenido del bloque dentro de un único `do $$ ... $$`, con las instrucciones `set local role ...` y `set_config(...)` dentro del bloque. Añadir al final `raise exception 'PRUEBAS_OK_REVERTIDAS';`. Ese error final significa éxito y garantiza que todo se revierte.

**P0 — Requisitos previos.** Esperado: `supervisores ≥ 1`, `vendedores ≥ 2`, `ajustes = 1`.
```sql
select (select count(*) from public.profiles where role = 'supervisor' and is_active) as supervisores,
       (select count(*) from public.profiles where role = 'vendedor' and is_active)   as vendedores,
       (select count(*) from public.settings)                                        as ajustes;
```

**P1 — Vendedores: clientes, aislamiento y permisos (T01–T16)**
```sql
begin;
select set_config('test.sup', (select id::text from public.profiles where role = 'supervisor' and is_active order by email limit 1), true),
       set_config('test.v1',  (select id::text from public.profiles where role = 'vendedor' and is_active order by email limit 1), true),
       set_config('test.v2',  (select id::text from public.profiles where role = 'vendedor' and is_active order by email offset 1 limit 1), true);
set local role authenticated;
do $$
declare v_c1 uuid; v_n integer; v_txt text;
begin
  -- Como VENDEDOR 1
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v1'), 'role', 'authenticated')::text, true);

  -- T01 crea su cliente
  insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
  values ('Frutería Prueba Uno', 'fruteria', 'Ana Prueba', '+34600000001', current_setting('test.v1')::uuid)
  returning id into v_c1;

  -- T02 no puede crear cliente para otro vendedor
  begin
    insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
    values ('Intruso', 'otro', 'X Prueba', '+34600000002', current_setting('test.v2')::uuid);
    raise exception 'FALLO T02: un vendedor creó un cliente para otro vendedor';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T03 teléfono con formato inválido
  begin
    insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
    values ('Formato Malo', 'otro', 'X Prueba', '600000003', current_setting('test.v1')::uuid);
    raise exception 'FALLO T03: se aceptó un teléfono sin formato internacional';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T04 no puede reasignar su cliente
  begin
    update public.clients set owner_id = current_setting('test.v2')::uuid where id = v_c1;
    raise exception 'FALLO T04: un vendedor reasignó un cliente';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T05 no puede archivar
  begin
    update public.clients set is_archived = true where id = v_c1;
    raise exception 'FALLO T05: un vendedor archivó un cliente';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T06 no puede borrar
  begin
    delete from public.clients where id = v_c1;
    raise exception 'FALLO T06: se permitió DELETE';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T07 no puede cambiar su rol (0 filas)
  update public.profiles set role = 'supervisor' where id = current_setting('test.v1')::uuid;
  get diagnostics v_n = row_count;
  if v_n <> 0 then raise exception 'FALLO T07: un vendedor cambió su rol'; end if;

  -- T08 solo ve su propio perfil
  select count(*) into v_n from public.profiles;
  if v_n <> 1 then raise exception 'FALLO T08: el vendedor ve % perfiles', v_n; end if;

  -- T09 no ve auditoría ni ejecuciones del resumen
  select count(*) into v_n from public.audit_log;
  if v_n <> 0 then raise exception 'FALLO T09: el vendedor ve la auditoría'; end if;
  select count(*) into v_n from public.summary_runs;
  if v_n <> 0 then raise exception 'FALLO T09b: el vendedor ve ejecuciones del resumen'; end if;

  -- T10 no puede modificar ajustes (0 filas)
  update public.settings set summary_hour = 8 where id = 1;
  get diagnostics v_n = row_count;
  if v_n <> 0 then raise exception 'FALLO T10: el vendedor modificó ajustes'; end if;

  -- T11 sí puede leer ajustes
  select count(*) into v_n from public.settings;
  if v_n <> 1 then raise exception 'FALLO T11: el vendedor no puede leer ajustes'; end if;

  -- T12 no puede insertar en auditoría
  begin
    insert into public.audit_log (actor_id, action, entity) values (auth.uid(), 'usuario.alta', 'profile');
    raise exception 'FALLO T12: se insertó en audit_log desde el cliente';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T13 no puede usar funciones de servicio ni solicitar envíos
  begin
    perform public.claim_summary_run();
    raise exception 'FALLO T13: un vendedor ejecutó claim_summary_run';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin
    perform public.request_manual_summary(null);
    raise exception 'FALLO T13b: un vendedor solicitó un envío manual';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T14 su vista de indicadores solo tiene su fila
  select count(*) into v_n from public.v_seller_kpis;
  if v_n <> 1 then raise exception 'FALLO T14: el vendedor ve % filas de indicadores', v_n; end if;

  -- Como VENDEDOR 2
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v2'), 'role', 'authenticated')::text, true);

  -- T15 no ve el cliente del vendedor 1
  select count(*) into v_n from public.clients where id = v_c1;
  if v_n <> 0 then raise exception 'FALLO T15: el vendedor 2 ve clientes del vendedor 1'; end if;

  -- T16 teléfono duplicado: rechazado y aviso sin datos
  begin
    insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
    values ('Duplicado', 'otro', 'X Prueba', '+34600000001', current_setting('test.v2')::uuid);
    raise exception 'FALLO T16: se aceptó un teléfono duplicado';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  v_txt := public.phone_status('+34600000001');
  if v_txt <> 'otro_vendedor' then raise exception 'FALLO T16b: phone_status devolvió %', v_txt; end if;
  if public.phone_status('+3460') <> 'formato_invalido' then raise exception 'FALLO T16c'; end if;
  if public.phone_status('+34699999998') <> 'libre' then raise exception 'FALLO T16d'; end if;
end $$;
rollback;
```

**P2 — Oportunidades, tareas y actividades (T20–T28)**
```sql
begin;
select set_config('test.v1', (select id::text from public.profiles where role = 'vendedor' and is_active order by email limit 1), true),
       set_config('test.v2', (select id::text from public.profiles where role = 'vendedor' and is_active order by email offset 1 limit 1), true);
set local role authenticated;
do $$
declare v_c1 uuid; v_c3 uuid; v_o1 uuid; v_o3 uuid; v_t1 uuid; v_a1 uuid; v_n integer; v_ts timestamptz; v_amt numeric;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v1'), 'role', 'authenticated')::text, true);
  insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
  values ('Restaurante Prueba', 'hosteleria', 'Luis Prueba', '+34600000021', current_setting('test.v1')::uuid) returning id into v_c1;
  insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
  values ('Súper Prueba', 'supermercado', 'Eva Prueba', '+34600000022', current_setting('test.v1')::uuid) returning id into v_c3;

  -- T20 crea oportunidad (el propietario se toma del cliente)
  insert into public.opportunities (client_id, title, description, amount, expected_close_date)
  values (v_c1, 'Pedido semanal', '200 kg tomate pera', 450.00, current_date + 2) returning id into v_o1;
  select count(*) into v_n from public.opportunities where id = v_o1 and owner_id = current_setting('test.v1')::uuid;
  if v_n <> 1 then raise exception 'FALLO T20: la oportunidad no tomó el propietario del cliente'; end if;

  -- T21 perdida sin motivo -> rechazada
  begin
    update public.opportunities set stage = 'perdida' where id = v_o1;
    raise exception 'FALLO T21: se aceptó una pérdida sin motivo';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T22 ganada -> closed_at automático
  update public.opportunities set stage = 'ganada' where id = v_o1;
  select closed_at into v_ts from public.opportunities where id = v_o1;
  if v_ts is null then raise exception 'FALLO T22: closed_at no se rellenó'; end if;

  -- T23 el vendedor no puede modificar una oportunidad cerrada
  begin
    update public.opportunities set amount = 1 where id = v_o1;
    raise exception 'FALLO T23: se modificó una oportunidad cerrada';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T24 indicadores: ganado del mes incluye la venta
  select won_month_amount into v_amt from public.v_seller_kpis;
  if v_amt < 450 then raise exception 'FALLO T24: won_month_amount = %', v_amt; end if;

  -- T25 tarea: crear, marcar hecha y no reabrir
  insert into public.tasks (client_id, title, due_at) values (v_c1, 'Llamar para confirmar', now() + interval '1 hour')
  returning id into v_t1;
  update public.tasks set status = 'hecha' where id = v_t1;
  select completed_at into v_ts from public.tasks where id = v_t1;
  if v_ts is null then raise exception 'FALLO T25: completed_at no se rellenó'; end if;
  begin
    update public.tasks set status = 'pendiente' where id = v_t1;
    raise exception 'FALLO T25b: un vendedor reabrió una tarea cerrada';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T26 tarea con oportunidad de otro cliente -> rechazada
  begin
    insert into public.tasks (client_id, opportunity_id, title, due_at) values (v_c3, v_o1, 'Cruce', now());
    raise exception 'FALLO T26: se aceptó una oportunidad de otro cliente';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T27 actividad: insertar sí; modificar o borrar, no
  insert into public.activities (client_id, type, description) values (v_c1, 'llamada', 'Confirma pedido')
  returning id into v_a1;
  begin
    update public.activities set description = 'cambio' where id = v_a1;
    raise exception 'FALLO T27: se modificó una actividad';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin
    delete from public.activities where id = v_a1;
    raise exception 'FALLO T27b: se borró una actividad';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin
    insert into public.activities (client_id, type, description, occurred_at) values (v_c1, 'nota', 'Futuro', now() + interval '1 day');
    raise exception 'FALLO T27c: se aceptó una actividad futura';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T28 el vendedor 2 no puede crear oportunidad ni actividad en un cliente del vendedor 1
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v2'), 'role', 'authenticated')::text, true);
  begin
    insert into public.opportunities (client_id, title, amount, expected_close_date) values (v_c1, 'Robo', 10, current_date);
    raise exception 'FALLO T28: el vendedor 2 creó una oportunidad en un cliente ajeno';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin
    insert into public.activities (client_id, type, description) values (v_c1, 'nota', 'Ajena');
    raise exception 'FALLO T28b: el vendedor 2 registró una actividad en un cliente ajeno';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  select count(*) into v_n from public.opportunities where client_id = v_c1;
  if v_n <> 0 then raise exception 'FALLO T28c: el vendedor 2 ve oportunidades ajenas'; end if;
end $$;
rollback;
```

**P3 — Supervisor: archivado, reasignación, usuarios, ajustes y envío manual (T30–T40)**
```sql
begin;
select set_config('test.sup', (select id::text from public.profiles where role = 'supervisor' and is_active order by email limit 1), true),
       set_config('test.v1',  (select id::text from public.profiles where role = 'vendedor' and is_active order by email limit 1), true),
       set_config('test.v2',  (select id::text from public.profiles where role = 'vendedor' and is_active order by email offset 1 limit 1), true);
set local role authenticated;
do $$
declare v_c1 uuid; v_c2 uuid; v_o2 uuid; v_t2 uuid; v_n integer; v_owner uuid; v_run uuid;
begin
  -- Datos: cliente de V1 y cliente de V2 con oportunidad abierta y tarea pendiente
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v1'), 'role', 'authenticated')::text, true);
  insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
  values ('Mercado Prueba', 'mercado_mayorista', 'Pepe Prueba', '+34600000031', current_setting('test.v1')::uuid) returning id into v_c1;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v2'), 'role', 'authenticated')::text, true);
  insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
  values ('Frutas Dos Prueba', 'fruteria', 'Rosa Prueba', '+34600000032', current_setting('test.v2')::uuid) returning id into v_c2;
  insert into public.opportunities (client_id, title, amount, expected_close_date)
  values (v_c2, 'Cajas lechuga', 120, current_date + 1) returning id into v_o2;
  insert into public.tasks (client_id, title, due_at) values (v_c2, 'Visitar', now() + interval '2 hours') returning id into v_t2;

  -- Como SUPERVISOR
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.sup'), 'role', 'authenticated')::text, true);

  -- T30 ve clientes de ambos vendedores
  select count(*) into v_n from public.clients where id in (v_c1, v_c2);
  if v_n <> 2 then raise exception 'FALLO T30: el supervisor no ve todos los clientes'; end if;

  -- T31 archiva; el vendedor ya no puede editarlo; restaura
  update public.clients set is_archived = true where id = v_c1;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v1'), 'role', 'authenticated')::text, true);
  update public.clients set notes = 'x' where id = v_c1;
  get diagnostics v_n = row_count;
  if v_n <> 0 then raise exception 'FALLO T31: el vendedor editó un cliente archivado'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.sup'), 'role', 'authenticated')::text, true);
  update public.clients set is_archived = false where id = v_c1;

  -- T32 no puede desactivar a un vendedor con clientes activos
  begin
    update public.profiles set is_active = false where id = current_setting('test.v2')::uuid;
    raise exception 'FALLO T32: se desactivó un vendedor con clientes';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T33 reasigna V2 -> V1 con cascada
  v_n := public.reassign_clients(current_setting('test.v2')::uuid, current_setting('test.v1')::uuid, array[v_c2]);
  if v_n <> 1 then raise exception 'FALLO T33: reasignados % clientes', v_n; end if;
  select owner_id into v_owner from public.opportunities where id = v_o2;
  if v_owner <> current_setting('test.v1')::uuid then raise exception 'FALLO T33b: la oportunidad no siguió al cliente'; end if;
  select owner_id into v_owner from public.tasks where id = v_t2;
  if v_owner <> current_setting('test.v1')::uuid then raise exception 'FALLO T33c: la tarea no siguió al cliente'; end if;

  -- T34 desactiva V2; V2 no ve nada ni puede crear
  update public.profiles set is_active = false where id = current_setting('test.v2')::uuid;
  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.v2'), 'role', 'authenticated')::text, true);
  select count(*) into v_n from public.clients;
  if v_n <> 0 then raise exception 'FALLO T34: un vendedor desactivado ve clientes'; end if;
  begin
    insert into public.clients (trade_name, business_type, contact_name, phone, owner_id)
    values ('Inactivo', 'otro', 'X Prueba', '+34600000033', current_setting('test.v2')::uuid);
    raise exception 'FALLO T34b: un vendedor desactivado creó un cliente';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  perform set_config('request.jwt.claims', json_build_object('sub', current_setting('test.sup'), 'role', 'authenticated')::text, true);

  -- T35 no puede desactivarse a sí mismo
  begin
    update public.profiles set is_active = false where id = current_setting('test.sup')::uuid;
    raise exception 'FALLO T35: un supervisor se desactivó a sí mismo';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T36 auditoría registrada en esta transacción
  select count(distinct action) into v_n from public.audit_log
   where created_at = now() and action in ('cliente.archivado', 'cliente.restaurado', 'cliente.reasignado', 'usuario.desactivado');
  if v_n <> 4 then raise exception 'FALLO T36: faltan entradas de auditoría (% de 4)', v_n; end if;

  -- T37 el supervisor tampoco modifica auditoría ni actividades, ni borra
  begin
    update public.audit_log set action = 'usuario.alta' where created_at = now();
    raise exception 'FALLO T37: se modificó audit_log';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin
    delete from public.clients where id = v_c1;
    raise exception 'FALLO T37b: el supervisor borró un cliente';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T38 ve indicadores de todos los vendedores
  select count(*) into v_n from public.v_seller_kpis;
  if v_n <> (select count(*) from public.profiles where role = 'vendedor') then
    raise exception 'FALLO T38: el supervisor no ve todos los indicadores';
  end if;

  -- T39 ajustes: hora válida sí, fuera de rango no; queda auditado
  update public.settings set summary_hour = 8 where id = 1;
  get diagnostics v_n = row_count;
  if v_n <> 1 then raise exception 'FALLO T39: el supervisor no pudo cambiar la hora'; end if;
  begin
    update public.settings set summary_hour = 12 where id = 1;
    raise exception 'FALLO T39b: se aceptó una hora fuera de rango';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  select count(*) into v_n from public.audit_log where created_at = now() and action = 'ajustes.actualizados';
  if v_n < 1 then raise exception 'FALLO T39c: el cambio de ajustes no se auditó'; end if;

  -- T40 envío manual: destinatario inválido no; válido sí; repetición inmediata no
  begin
    perform public.request_manual_summary(current_setting('test.sup')::uuid);
    raise exception 'FALLO T40: se aceptó un supervisor como destinatario';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  v_run := public.request_manual_summary(null);
  if v_run is null then raise exception 'FALLO T40b: no se creó la solicitud manual'; end if;
  begin
    perform public.request_manual_summary(null);
    raise exception 'FALLO T40c: no se respetó la espera entre envíos manuales';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
end $$;
rollback;
```

**P4 — Resumen matutino desde el servidor (service_role) (T50–T56)**

> Si `set local role service_role` no estuviera permitido, ejecutar este bloque sin esa línea. El rol `postgres` es el propietario y también puede ejecutar estas funciones.

```sql
begin;
set local role service_role;
do $$
declare v jsonb; v_run uuid; r jsonb; v_n integer; v_status text; v_active integer;
begin
  select count(*) into v_active from public.profiles where role = 'vendedor' and is_active;

  -- T50 lunes 02/11/2026 07:05 Madrid: hay envío programado
  v := public.claim_summary_run(timestamptz '2026-11-02 07:05:00 Europe/Madrid');
  if v->>'run_id' is null then raise exception 'FALLO T50: no se generó el envío programado'; end if;
  if jsonb_array_length(v->'recipients') <> v_active then
    raise exception 'FALLO T50b: destinatarios % y vendedores activos %', jsonb_array_length(v->'recipients'), v_active;
  end if;
  if not ((v->'recipients'->0) ?& array['run_id', 'profile_id', 'email', 'full_name',
                                         'tasks_today', 'tasks_overdue', 'closing_7d', 'open_total']) then
    raise exception 'FALLO T50c: estructura de destinatario incompleta';
  end if;
  v_run := (v->>'run_id')::uuid;

  -- T51 el mismo día no se repite
  if public.claim_summary_run(timestamptz '2026-11-02 07:10:00 Europe/Madrid')->>'run_id' is not null then
    raise exception 'FALLO T51: se generó un segundo envío programado el mismo día';
  end if;

  -- T52 informar cada destinatario cierra la ejecución como completada
  for r in select * from jsonb_array_elements(v->'recipients') loop
    perform public.record_summary_delivery(v_run, (r->>'profile_id')::uuid, true, 'prueba-' || (r->>'profile_id'), null);
  end loop;
  select status::text into v_status from public.summary_runs where id = v_run;
  if v_status <> 'completado' then raise exception 'FALLO T52: estado final %', v_status; end if;

  -- T53 doble informe rechazado
  begin
    perform public.record_summary_delivery(v_run, (v->'recipients'->0->>'profile_id')::uuid, true, 'x', null);
    raise exception 'FALLO T53: se aceptó un doble informe';
  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;

  -- T54 domingo 08/11/2026: no hay envío
  if public.claim_summary_run(timestamptz '2026-11-08 07:05:00 Europe/Madrid')->>'run_id' is not null then
    raise exception 'FALLO T54: se generó un envío en domingo';
  end if;

  -- T55 antes de la hora (lunes 09/11/2026 06:30): no hay envío ni registro
  if public.claim_summary_run(timestamptz '2026-11-09 06:30:00 Europe/Madrid')->>'run_id' is not null then
    raise exception 'FALLO T55: se generó un envío antes de la hora';
  end if;
  select count(*) into v_n from public.summary_runs where run_date = date '2026-11-09';
  if v_n <> 0 then raise exception 'FALLO T55b: se registró una ejecución antes de la hora'; end if;

  -- T56 después de la ventana de recuperación (martes 03/11/2026 12:30): se omite y se registra
  if public.claim_summary_run(timestamptz '2026-11-03 12:30:00 Europe/Madrid')->>'run_id' is not null then
    raise exception 'FALLO T56: se envió fuera de la ventana de recuperación';
  end if;
  select count(*) into v_n from public.summary_runs where run_date = date '2026-11-03' and status = 'omitido';
  if v_n <> 1 then raise exception 'FALLO T56b: no se registró el día omitido'; end if;
end $$;
rollback;
```

**P5 — Usuario anónimo sin acceso (T60)**
```sql
begin;
set local role anon;
do $$
begin
  begin perform 1 from public.clients limit 1;  raise exception 'FALLO T60: anon lee clients';  exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin perform 1 from public.settings limit 1; raise exception 'FALLO T60b: anon lee settings'; exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin perform 1 from public.profiles limit 1; raise exception 'FALLO T60c: anon lee profiles'; exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
  begin perform public.phone_status('+34600000001'); raise exception 'FALLO T60d: anon ejecuta funciones'; exception when others then if sqlerrm like 'FALLO%' then raise; end if; end;
end $$;
rollback;
```

**Resultado esperado:** P0 cumple los mínimos, P1 a P5 terminan sin error y no queda ningún dato de prueba. Claude.ai Chat lo comprueba con:
```sql
select (select count(*) from public.clients) as clientes, (select count(*) from public.summary_runs) as ejecuciones;
```
Esperado: `0 | 0`.

---

## 14. Control de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 24/10/2026 | Estructura inicial aprobada en la entrevista |
