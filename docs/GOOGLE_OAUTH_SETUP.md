# Configuración de Google OAuth para LuxeShop

## Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs y servicios** > **Credenciales**

## Paso 2: Configurar pantalla de consentimiento OAuth

1. Ve a **APIs y servicios** > **Pantalla de consentimiento OAuth**
2. Selecciona "Externo" como tipo de usuario
3. Completa la información requerida:
   - Nombre de la aplicación: `LuxeShop`
   - Email de soporte: Tu email
   - Logo (opcional): Sube el logo de la tienda
4. Agrega los scopes:
   - `email`
   - `profile`
   - `openid`
5. Guarda y continúa

## Paso 3: Crear credenciales OAuth 2.0

1. Ve a **APIs y servicios** > **Credenciales**
2. Haz clic en **+ CREAR CREDENCIALES** > **ID de cliente OAuth**
3. Tipo de aplicación: **Aplicación web**
4. Nombre: `LuxeShop Web Client`
5. Orígenes de JavaScript autorizados:
   ```
   http://localhost:3000
   http://localhost:5173
   ```
6. URIs de redirección autorizados:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Haz clic en **CREAR**

## Paso 4: Obtener las credenciales

Después de crear el cliente OAuth, obtendrás:
- **Client ID** (algo como: `123456789-xxxx.apps.googleusercontent.com`)
- **Client Secret** (algo como: `GOCSPX-xxxxxx`)

## Paso 5: Configurar en el backend

1. Copia el archivo `.env.example` a `.env` en la carpeta `backend/`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edita el archivo `backend/.env` y añade las credenciales:
   ```env
   GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

3. Reinicia el servidor backend:
   ```bash
   cd backend
   npm run dev
   ```

## Paso 6: Verificar

Al iniciar el servidor, deberías ver en la consola:
```
✅ Google OAuth configurado correctamente
```

En lugar de:
```
⚠️ Google OAuth no configurado - faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET
```

## Para producción

Cuando vayas a producción, necesitarás:

1. Agregar el dominio de producción a los orígenes autorizados
2. Agregar la URL de callback de producción
3. Cambiar las URLs en el archivo `.env` de producción

Ejemplo de configuración de producción:
```env
GOOGLE_CALLBACK_URL=https://tu-dominio.com/api/auth/google/callback
```

## Solución de problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback en Google Cloud Console coincida exactamente con `GOOGLE_CALLBACK_URL`

### Error: "Invalid client"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos

### Error: "Access blocked"
- Ve a la pantalla de consentimiento OAuth y añade tu email como usuario de prueba (si la app no está verificada)

---

**Nota:** Sin las credenciales de Google configuradas, el botón de "Iniciar sesión con Google" redirigirá de vuelta al login con un mensaje de error. El login con email/contraseña funcionará normalmente.
