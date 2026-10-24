# DESIGN_BRIEF.md — Brief de diseño de CRM-123

> **Para Claude Design.** Describe pantallas, información, jerarquía, estados, flujos y dirección visual. No contiene código ni base de datos.
>
> **Regla estricta:** cada campo, lista, estado y valor que aparece en el diseño corresponde a la estructura oficial de `SCRIPTS-SQL.md`, sin añadir, quitar ni renombrar datos. El anexo A traduce cada campo de pantalla a su dato oficial. Si una idea de diseño necesitara un dato que no está en el anexo, no se diseña.

---

## 1. Producto y usuarios

**CRM-123** es un CRM mínimo para un mayorista de frutas y hortalizas en España, que vende a fruterías, restaurantes, supermercados y mercados.

| Usuario | Dispositivo | Uso | Tono de la interfaz |
|---|---|---|---|
| **Vendedor** (hasta 10) | Ordenador, aplicación web de escritorio | Gestión diaria: clientes, oportunidades, tareas y llamadas. Muchas horas al día | **Denso y operativo**: tablas compactas, acciones a un clic, sin adornos |
| **Supervisor** (hasta 2) | Móvil, PWA instalable (también puede usar el escritorio) | Consulta rápida del equipo, gestión de usuarios y del resumen matutino | **Consulta rápida**: tarjetas grandes, cifras claras, pocas acciones por pantalla |

Idioma: **español de España**.

**Formatos**

- Euros: `1.234,56 €`.
- Fechas: `dd/mm/aaaa`; horas `HH:mm` en hora de Madrid.
- Teléfonos en formato internacional, mostrados con espacios: `+34 600 123 456`.

**Palabras prohibidas en toda la interfaz:** "eliminar", "borrar", "suprimir". Nada se borra; se **archiva**, **desactiva** o **cancela**.

---

## 2. Dirección visual

| Elemento | Decisión |
|---|---|
| Tema | **Solo modo claro** |
| Color principal | Verde oscuro `#1E6B45` (hover `#175636`, fondo suave `#E8F2EC`). Evoca producto fresco sin ser chillón |
| Neutros | Fondo de página `#F7F8F7` · Superficies `#FFFFFF` · Bordes `#E3E6E3` · Texto `#1C2420` · Texto secundario `#5B655F` |
| Estados | Peligro/vencido/error `#C62828` (fondo `#FDECEC`) · Aviso `#B26A00` (fondo `#FFF4E0`) · Información `#1F5FA8` (fondo `#E9F0FA`) · Éxito = verde principal |
| Etiquetas de etapa | Nueva: gris · Oferta enviada: azul · Negociación: ámbar · Ganada: verde · Perdida: rojo atenuado |
| Tipografía | **Inter**. Escritorio: base de 14 px; títulos 20/16 px; cifras de indicadores 28 px semibold. Móvil: base de 16 px; cifras 32 px |
| Iconos | Lineales, estilo lucide, de 16–20 px, siempre con texto al lado en las acciones principales |
| Logotipo | Textual: **CRM-123**, en Inter semibold y verde principal. En la PWA, un icono cuadrado con "123" sobre verde |
| Forma | Radio de 8 px en tarjetas y 6 px en controles; sombras mínimas; separación por bordes finos |
| Densidad (escritorio) | Filas de tabla de 36–40 px, cabeceras fijas al desplazarse, paginación de 50 filas |
| Densidad (móvil) | Áreas táctiles ≥ 44 px; una columna; barra de pestañas inferior |
| Accesibilidad | Contraste AA. El color nunca es la única señal: lo vencido lleva además icono y texto "Vencida". Foco visible y navegación por teclado completa en el escritorio |

Componentes base, estándar y de estilo shadcn/ui:

- Botón (principal, secundario, peligro atenuado, enlace)
- Campo de texto, área de texto, selector, selector de fecha, selector de fecha y hora
- Interruptor, casilla
- Tabla, tarjeta, etiqueta (badge)
- Diálogo de confirmación, panel lateral (sheet)
- Aviso emergente (toast), aviso fijo (banner)
- Pestañas
- Esqueleto de carga

---

## 3. Patrones de estado (obligatorios en todas las pantallas)

| Estado | Escritorio | Móvil |
|---|---|---|
| **Cargando** | Esqueletos con la forma de la tabla o tarjeta (no un spinner a pantalla completa) | Esqueletos de tarjetas |
| **Vacío** | Ilustración lineal pequeña opcional + frase + acción principal ("Aún no tienes clientes. **Añadir cliente**") | Frase corta + acción si aplica |
| **Error** | Banner rojo arriba del contenido: "No se han podido cargar los datos." + botón **Reintentar**. En formularios: mensaje bajo cada campo + resumen arriba | Igual, a ancho completo |
| **Proceso en ejecución** | Botón con indicador y texto en gerundio ("Guardando…", "Archivando…") y desactivado; los campos quedan bloqueados | Igual; en el resumen matutino, tarjeta de estado viva (ver §6.6) |
| **Éxito** | Aviso emergente verde, 3 s ("Cliente guardado") | Igual |
| **Sin permiso** | Página "No tienes permiso para ver esto" + volver al inicio | Igual |
| **Sin conexión** (solo PWA) | — | Pantalla "Sin conexión. Revisa tu red e inténtalo de nuevo." + **Reintentar** |

---

## 4. Mapa de pantallas

**Escritorio (`crm-123-web`)**
```
Acceso ─► Cambiar contraseña (solo primer acceso)
   └──► Armazón: barra lateral [Tablero · Clientes · Oportunidades · Tareas] + pie [Mi cuenta · Salir]
          ├─ Tablero del día (inicio)
          ├─ Clientes ─► Cliente nuevo
          │            └► Ficha de cliente ─► Editar cliente
          │                 (diálogos: Nueva oportunidad, Editar oportunidad, Cambiar etapa / Marcar perdida,
          │                  Nueva tarea, Registrar actividad, Archivar/Restaurar [supervisor])
          ├─ Oportunidades
          ├─ Tareas
          └─ Mi cuenta
```

**PWA (`crm-123-pwa`, solo supervisor)**
```
Acceso ─► Cambiar contraseña (solo primer acceso)
   └──► Barra inferior [Equipo · Usuarios · Resumen · Más]
          ├─ Equipo hoy ─► Detalle de vendedor
          ├─ Usuarios ─► Nuevo usuario · Detalle de usuario
          ├─ Resumen matutino
          └─ Más ─► Reasignar clientes · Auditoría · Mi cuenta · Salir
```

---

## 5. Pantallas de escritorio

### 5.1 Acceso
- **Información:**
  - Logotipo CRM-123.
  - Campos **Email** y **Contraseña** (con mostrar/ocultar).
  - Botón **Entrar**.
  - Texto pequeño: "Uso interno de CRM-123. Acceso solo para personal autorizado."
- **Jerarquía:** tarjeta centrada de 380 px sobre el fondo neutro.
- **Estados:**
  - Error genérico: "Email o contraseña incorrectos".
  - Aviso si el acceso fue desactivado: "Tu acceso está desactivado. Contacta con tu supervisor".
  - Entrando: "Entrando…".
- No hay "registrarse" ni "¿olvidaste tu contraseña?". En su lugar, el texto: "¿Problemas para entrar? Pide a tu supervisor una contraseña temporal."

### 5.2 Cambiar contraseña (primer acceso y Mi cuenta)
- **Campos:** Contraseña actual · Nueva contraseña · Repetir nueva contraseña.
- **Ayuda en vivo:** "Mínimo 10 caracteres", "Las contraseñas coinciden".
- **Primer acceso:** título "Crea tu contraseña personal" y explicación de una línea. No se puede navegar a otra pantalla, solo **Salir**.
- **Estados:** guardando · error de contraseña actual · éxito (redirige al Tablero).

### 5.3 Armazón (layout)
- **Barra lateral fija de 220 px:**
  - Logotipo.
  - Navegación: Tablero, Clientes, Oportunidades, Tareas. Cada elemento con icono y texto; Tareas lleva un contador rojo de vencidas.
  - Abajo: nombre del usuario y rol (Vendedor/Supervisor), **Mi cuenta** y **Salir**.
- **Cabecera de contenido:**
  - Título de la pantalla y fecha de hoy ("Lunes, 02/11/2026").
  - **Solo supervisor:** selector "Vendedor: Todos / [nombre]", que filtra todas las pantallas, y casilla "Mostrar archivados" en Clientes y Oportunidades.
- **Botón principal contextual** arriba a la derecha (por ejemplo, "Añadir cliente").

### 5.4 Tablero del día (inicio)
Pantalla de arranque. El vendedor entiende su día en 5 segundos.

1. **Fila de 4 indicadores** (tarjetas):

| Indicador | Detalle |
|---|---|
| **Tareas de hoy** | Número |
| **Tareas vencidas** | Número; en rojo si es mayor que 0 |
| **Oportunidades abiertas** | Número + importe en € debajo |
| **Ganado este mes** | € |

   Supervisor con "Todos": suma del equipo.
2. **Dos columnas debajo:**
   - **Mis tareas de hoy y vencidas** (60 %):
     - Lista compacta: casilla "Marcar como hecha" · hora o fecha · título · cliente (enlace a la ficha) · etiqueta "Vencida" si aplica.
     - Primero las vencidas, en rojo, y luego las de hoy por hora.
   - **Cierres previstos en 7 días** (40 %):
     - Fecha prevista · cliente · título · importe · etiqueta de etapa.
     - Ordenado por fecha.
- **Estados vacíos:**
  - "Sin tareas para hoy. Buen trabajo."
  - "No hay cierres previstos esta semana."
  - Primer uso sin clientes: banner "Empieza añadiendo tu primer cliente" con botón.
- **Proceso:** al marcar una tarea, la fila se atenúa ("Guardando…") y desaparece con un aviso de éxito.
- **Hito 2:** se diseña también la versión con indicadores a 0 y listas vacías (es lo que se construye primero).

### 5.5 Clientes (lista)
- **Barra de herramientas:**
  - Buscador "Buscar por nombre o teléfono".
  - Filtro **Tipo de negocio**.
  - (Supervisor) filtro de vendedor y "Mostrar archivados".
  - Botón principal **Añadir cliente**.
- **Tabla:**

| Columna | Contenido |
|---|---|
| Nombre comercial | En negrita, enlace a la ficha |
| Tipo de negocio | — |
| Contacto | — |
| Teléfono | — |
| Población | — |
| Oportunidades abiertas | Número |
| Última actividad | Fecha o "—" |
| Vendedor | Solo supervisor |
| Estado | Etiqueta "Archivado"; solo si se muestran archivados |

- Paginación de 50 filas. Orden por defecto: nombre comercial A–Z.
- **Estados:**
  - Vacío: "Aún no tienes clientes".
  - Búsqueda sin resultados: "No hay clientes que coincidan con «texto»" + "Limpiar búsqueda".
  - Cargando: esqueleto de 10 filas.

### 5.6 Cliente nuevo / Editar cliente
- **Formulario en dos columnas**, con secciones:
  - **Empresa:** Nombre comercial*, Tipo de negocio*.
  - **Contacto:** Persona de contacto*, Teléfono* (selector de prefijo europeo con bandera, +34 por defecto, más el número), Email.
  - **Entrega:** Dirección de entrega, Población, Provincia.
  - **Notas.**
  - (Solo supervisor) **Vendedor asignado***.
- **Comprobación del teléfono** al salir del campo, con un mensaje bajo él:

| Resultado | Mensaje |
|---|---|
| Teléfono libre | ✓ "Teléfono disponible" |
| Ya en la cartera del vendedor | "Este cliente ya está en tu cartera", con enlace "Ver cliente" |
| De otro vendedor | Aviso ámbar: "Este cliente ya está asignado. Contacta con tu supervisor". Bloquea Guardar. **Nunca** muestra datos del otro cliente ni del otro vendedor |
| Archivado | "Este teléfono pertenece a un cliente archivado. Contacta con tu supervisor" |
| Formato inválido | "Teléfono no válido" |

- **No existen**, ni pueden añadirse, campos de DNI, NIE, NIF/CIF ni pasaporte.
- **Botones:** **Guardar cliente** · Cancelar.
- **Estados:** validación por campo · guardando · error de duplicado · éxito (va a la ficha).

### 5.7 Ficha de cliente
- **Cabecera:**
  - Nombre comercial (título) · tipo de negocio (etiqueta) · contacto · teléfono (con botón copiar) · email · dirección, población y provincia · vendedor (solo supervisor).
  - Acciones: **Editar** · **Nueva oportunidad** · **Nueva tarea** · **Registrar actividad**.
  - Solo supervisor: menú "Más" con **Archivar cliente** / **Restaurar cliente**.
  - Si el cliente está archivado: banner gris "Cliente archivado el dd/mm/aaaa", todo en solo lectura y, para el supervisor, botón **Restaurar**.
- **Cuerpo en dos columnas:**
  - **Izquierda (65 %):**
    - **Oportunidades:** tabla compacta con título · importe · etapa (etiqueta) · fecha prevista · menú de acciones (Editar, Cambiar etapa; supervisor: Archivar/Restaurar). Las cerradas aparecen atenuadas y en solo lectura para el vendedor.
    - **Tareas:** pendientes primero, con casilla Hecha y acción Cancelar; las hechas y canceladas se pliegan en "Ver cerradas (n)".
  - **Derecha (35 %):**
    - **Actividad:** línea de tiempo con icono del tipo · tipo · fecha y hora · texto · oportunidad relacionada si existe.
    - Sin acciones de editar: las actividades son permanentes.
    - Las notas del cliente van arriba, en una tarjeta.
- **Estados vacíos por bloque:** "Sin oportunidades", "Sin tareas pendientes", "Aún no hay actividad registrada".

### 5.8 Diálogos de la ficha

| Diálogo | Campos | Notas |
|---|---|---|
| **Nueva / Editar oportunidad** (panel lateral) | Título*, Detalle de la venta (texto libre, por ejemplo "200 kg tomate pera + 50 cajas lechuga"), Importe estimado (€)*, Fecha prevista de cierre*, Etapa* (al crear: Nueva por defecto) | Cerrada = solo lectura para el vendedor |
| **Cambiar etapa** | Selector de etapa | Si se elige **Perdida**: Motivo de la pérdida* (Precio, Calidad/producto, Plazo de entrega, Competencia, Otro) + Nota (opcional) |
| **Nueva tarea** | Título*, Fecha y hora de vencimiento* (hora de Madrid), Oportunidad relacionada (opcional; solo las de este cliente) | — |
| **Registrar actividad** | Tipo* (Llamada, Visita, WhatsApp, Email, Nota, como botones segmentados), Descripción*, Fecha y hora (por defecto ahora; no se admite futura), Oportunidad relacionada (opcional) | Aviso pequeño: "Las actividades no se pueden modificar una vez guardadas" |
| **Archivar cliente / oportunidad** (supervisor) | Confirmación: "El cliente dejará de verse en las listas del vendedor. Podrás restaurarlo cuando quieras." | Botones **Archivar** · Cancelar |
| **Restaurar cliente** (supervisor) | Vendedor asignado* (preseleccionado si sigue activo) | Botón **Restaurar** |
| **Cancelar tarea** | Confirmación simple | — |

### 5.9 Oportunidades (lista)
- **Filtros:**
  - Etapa: por defecto "Abiertas" (Nueva + Oferta enviada + Negociación); también cada etapa, "Ganadas", "Perdidas" y "Todas".
  - Fecha prevista: Esta semana / Este mes / Rango.
  - (Supervisor) vendedor y archivadas.
- **Barra de totales:** "N oportunidades · X € en total".
- **Tabla:**

| Columna | Contenido |
|---|---|
| Fecha prevista | En rojo si ya pasó y sigue abierta |
| Cliente | Enlace a la ficha |
| Título | — |
| Importe | Alineado a la derecha |
| Etapa | Etiqueta, con cambio rápido desde un menú |
| Motivo de pérdida | Solo si está perdida |
| Vendedor | Solo supervisor |

- Orden por fecha prevista ascendente.
- **Estados:** vacío ("No hay oportunidades abiertas") · sin resultados de filtro · cargando · cambio de etapa en curso (etiqueta con indicador).

### 5.10 Tareas
- **Pestañas:** **Hoy (n)** · **Vencidas (n)**, en rojo · **Próximas (n)**.
- **Tabla:** casilla Hecha · fecha y hora · título · cliente · oportunidad · acciones (Cancelar).
- **Botón principal:** **Nueva tarea**. Abre el diálogo con un selector de cliente obligatorio, porque se crea fuera de la ficha.
- **Estados vacíos:**
  - Hoy: "Nada pendiente para hoy".
  - Vencidas: "No tienes tareas vencidas ✓".
  - Próximas: "Sin tareas programadas".

### 5.11 Mi cuenta
- Nombre, email y rol, en solo lectura.
- Bloque **Cambiar contraseña** (ver 5.2).

---

## 6. Pantallas de la PWA (supervisor, móvil)

Cabecera común: título de la pantalla a la izquierda y fecha corta a la derecha. Barra inferior con 4 pestañas e iconos: **Equipo · Usuarios · Resumen · Más**.

### 6.1 Acceso y cambiar contraseña
Igual que en el escritorio, a ancho completo y con campos grandes. Si entra un vendedor: pantalla "Esta aplicación es solo para supervisores. Usa CRM-123 en el ordenador." y botón **Salir**.

### 6.2 Equipo hoy (inicio)
1. **Tarjeta de totales del equipo**, en cuadrícula de 2×2:
   - Tareas de hoy
   - Vencidas (en rojo si es mayor que 0)
   - Abiertas en €
   - Ganado este mes en €
2. **Tarjeta del último resumen matutino:** "Resumen de hoy: Completado · 9 enviados · 1 fallido", con la hora. Enlaza a Resumen.
3. **Lista de vendedores activos**, una tarjeta por vendedor:
   - Nombre.
   - Tres cifras pequeñas: vencidas (rojo), abiertas en € y ganado en el mes.
   - Chevron que lleva al detalle.
   - Orden: primero quien tiene más vencidas.
- **Estados:**
  - Vacío: "Aún no hay vendedores. **Añadir usuario**".
  - Cargando: esqueletos.
  - Sin conexión.
- **Refresco:** gesto de deslizar hacia abajo.

### 6.3 Detalle de vendedor
- **Cabecera:** nombre y 4 indicadores (los mismos de 6.2 para esa persona).
- **Secciones plegables:**
  - **Oportunidades abiertas por etapa:** recuento y € por etapa (Nueva, Oferta enviada, Negociación); al tocar, lista simple con cliente · importe · fecha prevista.
  - **Tareas vencidas y de hoy:** lista con fecha u hora · título · cliente.
- Solo consulta: no hay acciones de edición en la PWA sobre clientes, oportunidades ni tareas.

### 6.4 Usuarios
- **Lista:** nombre · email · etiqueta de rol · etiqueta de estado (Activo / Desactivado, en gris).
- **Contador arriba:** "Vendedores activos 7/10 · Supervisores activos 2/2".
- **Botón flotante:** **Añadir usuario**, desactivado con explicación si se alcanzó el límite del rol.
- **Nuevo usuario:**
  - Campos: Nombre completo* · Email* · Rol* (Vendedor / Supervisor).
  - Botón **Crear usuario**.
  - Éxito: pantalla que muestra **una sola vez** la contraseña temporal, en grande, con botón **Copiar**. Aviso: "Comunícala en persona o por un canal seguro. No volverá a mostrarse. El usuario deberá cambiarla al entrar."
- **Detalle de usuario:**
  - Nombre (editable) · email (solo lectura) · rol (selector).
  - Botones: **Asignar contraseña temporal** · **Desactivar usuario** (o **Reactivar usuario**).
  - Confirmaciones:
    - "Desactivar impide el acceso inmediatamente. Sus datos se conservan."
    - Si es un vendedor con clientes, aviso: "Antes reasigna sus clientes", con enlace a Reasignar.
  - El propio supervisor no ve las opciones de cambiar su rol ni de desactivarse.
- **Estados:** creando… · error ("Ya existe un usuario con este email", "Límite alcanzado: máximo 10 vendedores activos") · éxito.

### 6.5 Reasignar clientes (en Más)
- **Paso 1:** **De** (vendedor de origen) y **A** (vendedor de destino, solo activos y distinto del de origen).
- **Paso 2:** lista de clientes del origen con casillas, más "Seleccionar todos (n)".
- Nota: "Sus oportunidades abiertas y tareas pendientes pasarán al nuevo vendedor. El historial se conserva."
- **Botón:** **Reasignar n clientes**, con confirmación.
- **Estados:**
  - Origen sin clientes: "Este vendedor no tiene clientes activos".
  - Reasignando…
  - Éxito: "12 clientes reasignados a Ana".

### 6.6 Resumen matutino
1. **Tarjeta de ajustes:**
   - Interruptor **Resumen automático activado**.
   - Selector **Hora de envío**: 05:00 a 11:00, en horas en punto.
   - Texto fijo: "De lunes a sábado, hora de Madrid. Si el ordenador de n8n estaba apagado, se envía al encenderse, hasta las 12:00."
   - Botón **Guardar** (guardando… / guardado).
2. **Tarjeta de envío manual:**
   - Selector **Destinatarios**: Todos los vendedores / [vendedor].
   - Botón **Enviar resumen ahora**, con confirmación ("Se enviará el resumen de hoy a…").
   - Si no han pasado 10 minutos desde el último envío manual: botón desactivado con "Disponible en n min".
3. **Tarjeta de estado del último envío**, en vivo mientras está En cola o En proceso:
   - **En cola** (azul): "Se enviará en un máximo de 5 minutos".
   - **En proceso** (azul, con indicador): "Enviando… 4 de 10".
   - **Completado** (verde) · **Con errores** (ámbar) · **Fallido** (rojo) · **Omitido** (gris: "No se envió: el ordenador de n8n no estuvo disponible antes de las 12:00").
   - Muestra: tipo (Programado/Manual) · fecha y hora · enviados · fallidos.
4. **Historial:** las 10 últimas ejecuciones. Al tocar una, se ve el detalle por vendedor: nombre · email · Enviado/Fallido/Pendiente · motivo del fallo.
- **Aviso informativo fijo** mientras se usa el remitente de pruebas: "Modo pruebas: el correo solo llega al email del titular de la cuenta de Resend."

### 6.7 Auditoría (en Más)
- **Filtros:** acción (lista de textos legibles, ver anexo B) · usuario · rango de fechas.
- **Lista:**
  - Fecha y hora · quién (nombre o "Sistema") · acción legible · sobre qué.
  - Detalle desplegable con los datos relevantes (por ejemplo, "Etapa: Negociación → Ganada · 450,00 €").
- Solo lectura. Paginación con "Cargar más".
- **Estados:** vacío ("No hay registros con estos filtros") · cargando · error.

### 6.8 Más
Lista: Reasignar clientes · Auditoría · Mi cuenta · Salir.

---

## 7. Flujos clave

1. **Primer acceso:** Acceso → Cambiar contraseña (obligatorio) → Tablero (escritorio) o Equipo hoy (PWA).
2. **Alta de cliente con teléfono existente:** Cliente nuevo → teléfono → aviso "ya asignado" → Guardar bloqueado → contactar con el supervisor.
3. **Venta rápida:** Ficha → Nueva oportunidad (Nueva) → Cambiar etapa → Ganada → aviso de éxito. El indicador "Ganado este mes" sube.
4. **Venta perdida:** Cambiar etapa → Perdida → motivo obligatorio → guardado.
5. **Seguimiento:** Registrar actividad (Llamada) → Nueva tarea "Llamar el jueves 9:00" → aparece en el Tablero ese día.
6. **Baja de un vendedor:** PWA Usuarios → Detalle → Desactivar → aviso "reasigna antes" → Reasignar → volver → Desactivar.
7. **Envío manual del resumen:** Resumen → Enviar ahora → confirmar → En cola → En proceso → Completado (enviados y fallidos).

---

## Anexo A — Diccionario de campos (pantalla ↔ dato oficial de `SCRIPTS-SQL.md`)

**Cliente** (`clients`, `v_clients_list`)

| Texto en pantalla | Dato | Obligatorio | Límite |
|---|---|---|---|
| Nombre comercial | trade_name | sí | 2–150 |
| Tipo de negocio | business_type | sí | Frutería, Hostelería / Restaurante, Supermercado, Mercado / Mayorista, Otro |
| Persona de contacto | contact_name | sí | 2–120 |
| Teléfono | phone | sí | internacional, único |
| Email | email | no | — |
| Dirección de entrega | delivery_address | no | 250 |
| Población | city | no | 100 |
| Provincia | province | no | 100 |
| Notas | notes | no | 2000 |
| Vendedor asignado | owner_id / owner_name | sí | — |
| Archivado (fecha) | is_archived / archived_at | — | — |
| Oportunidades abiertas | open_opps_count | — | — |
| Última actividad | last_activity_at | — | — |

**Oportunidad** (`opportunities`, `v_opportunities_list`)

| Texto en pantalla | Dato | Obligatorio |
|---|---|---|
| Título | title | sí (2–150) |
| Detalle de la venta | description | no (2000) |
| Importe estimado | amount | sí (€, ≥ 0) |
| Etapa | stage | sí |
| Fecha prevista de cierre | expected_close_date | sí |
| Motivo de la pérdida | loss_reason | solo si Perdida |
| Nota de la pérdida | loss_note | no (500) |
| Fecha de cierre | closed_at | automática |
| Cliente · Teléfono · Vendedor | client_name · client_phone · owner_name | — |

**Tarea** (`tasks`, `v_tasks_list`)

| Texto en pantalla | Dato |
|---|---|
| Título | title (2–150) |
| Vence | due_at |
| Estado | status: Pendiente, Hecha, Cancelada |
| Oportunidad relacionada | opportunity_id / opportunity_title |
| Pestañas Hoy / Vencidas / Próximas | bucket: hoy / vencida / proxima |

**Actividad** (`activities`): Tipo = type (Llamada, Visita, WhatsApp, Email, Nota) · Descripción = description (1–2000) · Fecha y hora = occurred_at · Oportunidad = opportunity_id · Autor = created_by.

**Indicadores** (`v_seller_kpis`):

| Texto en pantalla | Dato |
|---|---|
| Tareas de hoy | tasks_today |
| Tareas vencidas | tasks_overdue |
| Oportunidades abiertas | open_opps_count + open_opps_amount |
| Ganado este mes | won_month_amount |

**Usuario** (`profiles`): Nombre completo = full_name · Email = email · Rol = role (Vendedor, Supervisor) · Estado = is_active (Activo, Desactivado).

**Resumen matutino**

| Texto en pantalla | Dato |
|---|---|
| Activado | `settings.summary_enabled` |
| Hora de envío | `settings.summary_hour` (5–11) |
| Ejecución: tipo | `summary_runs.trigger_type` (Programado, Manual) |
| Ejecución: estado | `summary_runs.status` (En cola, En proceso, Completado, Con errores, Fallido, Omitido) |
| Ejecución: fechas | requested_at, finished_at |
| Ejecución: cifras | total_recipients, sent_count, failed_count |
| Detalle por vendedor | `summary_deliveries`: email · status (Pendiente, Enviado, Fallido) · error_message |

## Anexo B — Textos de la auditoría

| Acción | Texto en pantalla |
|---|---|
| usuario.alta | Alta de usuario |
| usuario.cambio_rol | Cambio de rol |
| usuario.desactivado | Usuario desactivado |
| usuario.reactivado | Usuario reactivado |
| usuario.contrasena_restablecida | Contraseña temporal asignada |
| cliente.reasignado | Cliente reasignado |
| cliente.archivado | Cliente archivado |
| cliente.restaurado | Cliente restaurado |
| oportunidad.cambio_etapa | Cambio de etapa |
| oportunidad.archivada | Oportunidad archivada |
| oportunidad.restaurada | Oportunidad restaurada |
| ajustes.actualizados | Ajustes del resumen actualizados |
| resumen.solicitado | Resumen manual solicitado |
| resumen.omitido | Resumen omitido |
| resumen.finalizado | Resumen finalizado |
