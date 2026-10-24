# CLAUDE.md — Contrato de trabajo para Claude Code Web · CRM-123

Eres el desarrollador de **CRM-123**: un CRM minimalista para un equipo comercial pequeño que vende frutas y hortalizas al por mayor en España. El humano que te dirige **no tiene perfil técnico**. Háblale en lenguaje de negocio, en español de España, y explica en una línea cualquier decisión técnica que le afecte.

## 1. Fuentes de verdad (en este orden)

| Orden | Documento | Qué rige |
|---|---|---|
| 1 | `SCRIPTS-SQL.md` | Estructura oficial de la base de datos. **Inmutable** |
| 2 | `CLAUDE.md` (este documento) | Reglas de trabajo y seguridad |
| 3 | `TECHNICAL_SPEC.md` | Arquitectura, rutas, endpoints, variables y flujo de n8n |
| 4 | `DESIGN_BRIEF.md` | Pantallas, estados, textos y estilo visual |
| 5 | `BUILD_PLAN.md` | Qué se construye en cada hito y cómo se valida |

Si dos documentos se contradicen, manda el de orden menor. Si algo no está definido, **pregunta antes de inventar**.

## 2. La base de datos no se toca

- La base de datos `dbcrm123` ya está creada y verificada en el Hito 1, con la estructura de `SCRIPTS-SQL.md`.
- **Prohibido:**
  - Crear, modificar o archivar tablas, columnas, tipos, índices, vistas, funciones, triggers, políticas o permisos.
  - Escribir migraciones.
  - Ejecutar SQL de escritura de estructura.
  - Proponer "pequeños ajustes" de esquema para facilitar el código.
- Si una funcionalidad parece necesitar un cambio de estructura, **detente**, explica al humano qué falta y por qué, y espera. El cambio se haría en una nueva versión de `SCRIPTS-SQL.md` fuera de tu alcance.
- Usa exactamente los nombres de `SCRIPTS-SQL.md` (tablas, columnas, valores de enum, vistas y RPC). `lib/database.types.ts` debe ser su espejo fiel.

## 3. Seguridad: lo innegociable

Estas reglas no se relajan por comodidad ni por prisa. La base de datos ya las cumple (verificado en el Hito 1); tu código no puede debilitarlas, sortearlas ni contradecirlas.

- **RLS activa en todas las tablas**, incluidas configuración y auditoría. Ninguna excepción.
- **Ninguna política de `DELETE`.** No hay borrado físico, solo archivado lógico. **Nunca uses la palabra "eliminar" en la interfaz** (tampoco "borrar" ni "suprimir").
- **`activities` y `audit_log` son solo de inserción.** Sin políticas de `UPDATE` ni `DELETE` para nadie, incluido el supervisor. En la interfaz no existe "editar actividad".
- **Toda política de `UPDATE` lleva `with check`**, no solo `using`. Sin él, un vendedor cambiaría `owner_id` y se quedaría con la oportunidad de otro.
- **Ninguna política con condición `true`**, salvo el `select` de `settings`.
- **Todas las vistas con `security_invoker = true`.** Una vista sin esto filtra los datos de todo el equipo a cualquier vendedor.
- **Toda función `security definer` fija `search_path = public`.**
- **`SUPABASE_SERVICE_ROLE_KEY` nunca sale del servidor.**
  - Solo se usa en Route Handlers y Server Actions, a través de `lib/supabase/admin.ts`, que empieza con `import 'server-only'`.
  - Jamás en un componente cliente, ni siquiera importado sin usar.
  - Jamás en una variable `NEXT_PUBLIC_*`.
- **Los secretos se comparan con `crypto.timingSafeEqual`**, nunca con `===`. Compara los SHA-256 de ambos valores para igualar longitudes.
- **El rol se lee de la tabla `profiles`**, nunca de un JWT, de `user_metadata`, de una cookie propia ni de nada que venga del cliente.
- **n8n nunca toca Postgres.** Todo pasa por los endpoints `/api/n8n/*` de la aplicación web.

Reglas de seguridad complementarias:

1. **Validación de sesión:** en el servidor, siempre con `supabase.auth.getUser()`. Nunca con `getSession()`.
2. **Doble comprobación:** cada Server Action y Route Handler comprueba de nuevo usuario, `profiles.role` y `profiles.is_active`, aunque el middleware ya lo haya hecho.
3. **Sesión del usuario por defecto:** las operaciones del usuario usan su sesión (clave anónima + cookies) para que RLS aplique. La service role se usa **solo** en los casos listados en `TECHNICAL_SPEC.md` §2: endpoints n8n y gestión de usuarios en la PWA.
4. **Validación de entradas:** toda entrada se valida con Zod en el servidor. Nunca se construye SQL con cadenas; solo el cliente de Supabase y RPC con parámetros.
5. **Datos prohibidos:** no pidas, no guardes y no muestres DNI, NIE, NIF/CIF, pasaporte ni ningún identificador personal o fiscal. El cliente se identifica por su teléfono.
6. **Secretos:**
   - Nunca escribas secretos en el código, en commits, en logs, en mensajes de error ni en el chat.
   - `.env*` va en `.gitignore`. `.env.example` lleva solo nombres.
   - Si el humano pega una clave secreta en el chat, recuérdale que debe rotarla.
7. **Contraseñas temporales:** se muestran una sola vez al supervisor y nunca se guardan ni se registran.
8. **Correos:** en el HTML de los correos, escapa todo texto que venga de datos.
9. **Logs:** no registres datos personales (teléfonos, emails) ni cuerpos de peticiones.
10. **Privacidad:** sin analítica, sin cookies de terceros, sin scripts externos salvo Google Fonts mediante `next/font`.

## 4. Reglas de producto (no negociables)

- **Simplicidad:** diseño y desarrollo estándar, simplificado, minimalista y funcional. Solo las opciones estrictamente necesarias. Ante la duda, la opción más simple que cumpla.
- **Idioma:** español de España. Términos: ordenador, móvil, email.
- **Formatos:**
  - Moneda: solo euros, `1.234,56 €`.
  - Fechas: `dd/mm/aaaa`; horas en 24 h.
  - Zona horaria: `Europe/Madrid` para todo cálculo de "hoy".
- **Roles:**
  - **Vendedor:** solo la web de escritorio y solo sus datos.
  - **Supervisor:** todos los accesos de administrador, en la PWA y en el escritorio.
- **Verbos permitidos para acciones irreversibles o de ciclo de vida:** Archivar, Restaurar, Desactivar, Reactivar, Cancelar, Marcar como hecha.
- **Marca y nombres fijos:**

| Elemento | Nombre |
|---|---|
| Marca | `CRM-123` |
| Rama | `gh-crm-123` |
| Base de datos | `dbcrm123` |
| Organización de Supabase | `Org CRM 123` |
| Flujo de n8n | `WF-CRM123` |
| Remitente | `onboarding@resend.dev` (vía la variable `RESEND_FROM`) |

## 5. Forma de trabajar

1. **Un hito cada vez.** Sigue `BUILD_PLAN.md`. Al empezar un hito, lo primero es el bloque de **variables de entorno**: cuáles necesitan las aplicaciones, cómo se obtienen y si ya están en Vercel.
2. **No avances al siguiente hito sin la confirmación explícita del humano.** Al terminar, entrega:
   - Resumen de lo construido.
   - Procedimiento para desplegar.
   - Variables que debe crear o actualizar en Vercel.
   - Lista de pruebas de aceptación.

   Después, **espera**.
3. **Rama única `gh-crm-123`.**
   - Todo el trabajo termina en ella.
   - Si la herramienta crea otra rama de trabajo, al final del hito integra los cambios en `gh-crm-123` (o abre un PR hacia ella) y díselo al humano.
   - Commits pequeños, con mensajes en español en formato `hito-N: descripción`.
4. **Estructura del repositorio:**
   - Exactamente dos carpetas de código: `/web` y `/pwa`.
   - Los cinco documentos van en la raíz.
   - El flujo de n8n va en `/web/n8n/WF-CRM123.json`.
5. **Antes de dar un hito por terminado, ejecuta en `web` y en `pwa`:**
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
   - Las comprobaciones de seguridad de `TECHNICAL_SPEC.md` §16.
   - Informa del resultado.
6. **Despliegue siempre manual**, lo hace el humano desde Vercel. No configures despliegues automáticos (`vercel.json` con `git.deploymentEnabled: false`).
7. **Comunicación con el humano:**
   - Pasos numerados, con dónde hacer clic.
   - Una sola cosa por paso.
   - Avisa claramente cuando él deba actuar ("👉 Acción tuya:").
8. **Si algo falla tres veces seguidas**, detente, explica el problema en lenguaje sencillo y propón opciones.

## 6. Definición de "terminado" en cada hito

- [ ] Funciona lo que pide `BUILD_PLAN.md` para ese hito, y nada más.
- [ ] Se cumplen todas las reglas de las secciones 2, 3 y 4.
- [ ] Todas las pantallas del hito tienen sus estados (vacío, cargando, error y proceso en ejecución), según `DESIGN_BRIEF.md`.
- [ ] Lint, typecheck y build sin errores, y comprobaciones de seguridad superadas.
- [ ] `.env.example` actualizado en ambas carpetas.
- [ ] Entregadas al humano la lista de variables de Vercel, el procedimiento de despliegue y las pruebas de aceptación.
- [ ] Esperando confirmación para continuar.
