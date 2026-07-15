# Plantillas de correo de Dynamic Canvas

Todas las plantillas usan el diseño visual actual de Dynamic Canvas y cargan el logo oficial desde una ruta pública estable de Supabase Storage: `https://qhfbwqijhefoeebxnota.supabase.co/storage/v1/object/public/media/branding/dynamic-canvas-logo.png`. Esta URL no depende del dominio de la aplicación y no necesita cambiar cuando se conecte el dominio definitivo.

## Confirmación de registro

- Asunto recomendado: `Confirma tu correo — Dynamic Canvas`
- Archivo: `confirm-signup.html`
- Ubicación en Supabase: **Authentication → Email Templates → Confirm sign up**

Pega el contenido HTML completo en el editor de Supabase y guarda los cambios.

La plantilla usa variables oficiales de Supabase:

- `{{ .ConfirmationURL }}` para el enlace seguro de confirmación.
- `{{ .Email }}` para mostrar la dirección registrada.
- `{{ .Data.name }}` para personalizar el saludo cuando el registro incluye el nombre.

Antes de producción, configura en **Authentication → URL Configuration**:

- **Site URL:** el dominio público de Dynamic Canvas.
- **Redirect URLs:** el dominio público y las URLs locales necesarias para desarrollo.

Para conservar el enlace de confirmación, desactiva el seguimiento de enlaces en el proveedor SMTP que conectes a Supabase.

## Invitación a un equipo

- Asunto recomendado: `Te invitaron a {{ .Data.team_name }} — Dynamic Canvas`
- Archivo: `invite-team.html`
- Ubicación en Supabase: **Authentication → Email Templates → Invite user**

Pega el contenido HTML completo en el editor de la plantilla **Invite user** y guarda los cambios.

La invitación usa las variables que ya envía la API de equipos:

- `{{ .ConfirmationURL }}` para aceptar la invitación de forma segura.
- `{{ .Email }}` para mostrar el correo invitado.
- `{{ .Data.team_name }}` para mostrar el nombre del equipo.
- `{{ .Data.invited_by }}` para mostrar el nombre de quien envió la invitación.

Al aceptar, el usuario vuelve a **`/auth/callback?next=/dashboard/team`** y entra a la página del equipo.

## Magic Link u OTP

- Asunto recomendado: `Tu acceso a Dynamic Canvas`
- Archivo: `magic-link-otp.html`
- Ubicación en Supabase: **Authentication → Email Templates → Magic link or OTP**
- Variables: `{{ .ConfirmationURL }}`, `{{ .Token }}` y `{{ .Email }}`.

La plantilla permite entrar mediante el botón o copiar el código temporal.

## Cambio de correo

- Asunto recomendado: `Confirma tu nuevo correo — Dynamic Canvas`
- Archivo: `change-email.html`
- Ubicación en Supabase: **Authentication → Email Templates → Change email address**
- Variables: `{{ .ConfirmationURL }}`, `{{ .Email }}` y `{{ .NewEmail }}`.

## Restablecimiento de contraseña

- Asunto recomendado: `Restablece tu contraseña — Dynamic Canvas`
- Archivo: `reset-password.html`
- Ubicación en Supabase: **Authentication → Email Templates → Reset password**
- Variables: `{{ .ConfirmationURL }}` y `{{ .Email }}`.

## Reautenticación

- Asunto recomendado: `{{ .Token }} es tu código de verificación — Dynamic Canvas`
- Archivo: `reauthentication.html`
- Ubicación en Supabase: **Authentication → Email Templates → Reauthentication**
- Variables: `{{ .Token }}` y `{{ .Email }}`.

La reautenticación usa un código temporal y no debe incluir un enlace de confirmación.

## Nota sobre proyectos Free

En proyectos Free creados desde el 3 de junio de 2026, Supabase exige configurar un proveedor SMTP propio para personalizar estas plantillas. Los proyectos anteriores conservan sus plantillas actuales. Los planes Pro o superiores no tienen esta restricción.
