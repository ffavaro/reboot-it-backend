# Recuperación de contraseña con código por email

## Flujo
1. En el login, el usuario toca **¿Olvidaste la contraseña?** (`/forgot-password`).
2. **Paso 1:** ingresa su email. El backend, si el email existe y el usuario está activo, genera un código de 6 dígitos, guarda su *hash* y lo envía por email (Resend).
3. **Paso 2:** ingresa el código, la contraseña nueva y su confirmación.
4. El backend valida el código, actualiza la contraseña y envía un segundo email avisando del cambio.
5. El frontend redirige a `/login?reset=success` y muestra "Contraseña actualizada. Ya podés iniciar sesión."

## Endpoints (públicos, sin JWT)

### `POST /auth/forgot-password`
```json
{ "email": "usuario@ejemplo.com" }
```
Respuesta **siempre** `200`, exista o no el email (no se revela quién está registrado):
```json
{ "message": "Si el email está registrado, vas a recibir un código para restablecer tu contraseña." }
```
- El email se normaliza (`trim` y minúsculas). Formato inválido → `400`.
- Los códigos anteriores sin usar del usuario quedan invalidados: hay un solo código vigente por usuario.
- Límite: **3 pedidos cada 15 minutos por IP** (`429`: "Demasiados intentos. Esperá unos minutos y volvé a intentar.").
- Si Resend falla, se registra el error en el log (sin el código ni el email) y la respuesta no cambia.

### `POST /auth/reset-password`
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456",
  "newPassword": "NuevaClave1",
  "confirmPassword": "NuevaClave1"
}
```
- `code`: exactamente 6 dígitos. `newPassword`: mínimo 8 caracteres, con mayúscula, minúscula y número. `confirmPassword` tiene que coincidir.
- Éxito, `200`: `{ "message": "Tu contraseña fue actualizada correctamente." }`
- Código inválido, vencido, ya usado o email inexistente, `400`: `{ "message": "El código es inválido o expiró. Solicitá uno nuevo." }`
- Con 5 intentos fallidos el código se invalida, `400`: `{ "message": "Superaste la cantidad de intentos. Solicitá un nuevo código." }`
- Límite: **10 intentos cada 15 minutos por IP**.
- La contraseña nueva y el marcado del código como usado se hacen en una transacción. El hash usa bcrypt con el mismo costo (10) que el resto del sistema.
- **Sesiones:** el sistema usa JWT sin estado (no hay refresh tokens ni sesiones guardadas), por lo que no hay nada que invalidar: las sesiones abiertas vencen solas según `JWT_EXPIRES_IN`.

## Base de datos
Tabla nueva `password_reset_codes` (la crea el backend al arrancar, `synchronize: true`; no hay carpeta de migraciones en el proyecto):

| Columna | Tipo | Nota |
|---|---|---|
| `id` | int PK autoincremental | |
| `user_id` | int | FK a `usuario`, `ON DELETE CASCADE` |
| `code_hash` | varchar(255) | hash bcrypt, nunca el código |
| `expires_at` | datetime | |
| `attempts` | int, default 0 | |
| `used_at` | datetime, nulo | |
| `created_at` | datetime | |
| `request_ip` | varchar(45), nulo | |

## Configuración (`.env`)
| Variable | Descripción |
|---|---|
| `RESEND_API_KEY` | clave de la API de Resend |
| `MAIL_FROM` | remitente, por ejemplo `Reboot IT - MSIT <onboarding@resend.dev>` |
| `RESET_CODE_TTL_MINUTES` | validez del código (por defecto 15) |
| `RESET_CODE_MAX_ATTEMPTS` | intentos permitidos por código (por defecto 5) |
| `FRONTEND_URL` | URL del frontend (`http://localhost:3000`) |

Si falta `RESEND_API_KEY` el backend arranca igual, pero los emails no se envían (queda un error en el log).

## Estructura
- `src/mail/`: `MailProvider` (clase abstracta), `ResendMailProvider`, `MailService` y las plantillas HTML con texto plano. **Para cambiar de proveedor** (Brevo, SMTP) se crea otra clase que extienda `MailProvider` y se cambia el `useClass` en `mail.module.ts`; `auth` no se toca.
- `src/auth/password-reset.service.ts`, `password-reset-code.entity.ts` y los DTOs en `src/auth/dto/`.
- Tests unitarios: `npx jest src/auth` (email inexistente, código correcto, incorrecto, vencido e intentos superados).

## Cómo probarlo
1. Cargá `RESEND_API_KEY` y `MAIL_FROM` en `.env` y levantá el backend (`npm run start:dev`) y el frontend.
2. En `/login` tocá "¿Olvidaste la contraseña?", ingresá el email **dueño de la cuenta de Resend** (ver nota) y revisá la casilla.
3. Ingresá el código y una contraseña nueva; tiene que redirigir al login con el aviso verde y llegar el email de confirmación.
4. Probá los errores: código equivocado (se cuentan los intentos), contraseñas que no coinciden, más de 3 pedidos seguidos (429).

## Nota sobre Resend
El dominio `reboot-it.com.ar` todavía no está verificado en Resend. Mientras tanto se usa `onboarding@resend.dev`, que **solo permite enviar al email dueño de la cuenta de Resend**: usar ese email para las pruebas (a cualquier otro, Resend rechaza el envío y el usuario no recibe el código).

Para enviar a cualquier usuario: verificar el dominio en Resend cargando los registros DNS (DKIM, SPF y DMARC) y cambiar `MAIL_FROM` a `Reboot IT - MSIT <no-reply@reboot-it.com.ar>`. No requiere cambios de código.
