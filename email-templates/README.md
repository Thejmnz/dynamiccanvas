# Plantillas de correo de Dynamic Canvas

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
