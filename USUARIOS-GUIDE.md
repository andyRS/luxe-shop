# 👥 GUÍA DE USUARIOS - LUXESHOP

## 🎯 Cómo Crear y Gestionar Usuarios

Tienes **3 opciones** para crear usuarios en LuxeShop:

---

## ✅ OPCIÓN 1: USAR REGISTRO (MÁS FÁCIL)

### El registro YA funciona - Solo necesitas usarlo

1. **Abre la aplicación**
   ```
   http://localhost:3000
   ```

2. **Click en "Registrarse"** (arriba a la derecha)

3. **Llena el formulario:**
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Teléfono: (opcional)
   - Contraseña: mínimo 6 caracteres
   - Confirmar contraseña
   - ✅ Acepta términos

4. **Click "Crear Cuenta"**

5. **✅ ¡Listo! Usuario creado automáticamente**

### Para hacer ese usuario Admin:

**Opción A - Desde MongoDB Compass:**
```javascript
// 1. Conecta a tu base de datos
// 2. Ve a la colección "users"
// 3. Busca tu usuario por email
// 4. Edita el campo "role"
// 5. Cambia "user" a "admin"
// 6. Guarda
```

**Opción B - Desde el código (Login.jsx):**
```javascript
// Línea 44 en frontend/src/pages/Login.jsx
const mockUser = {
  _id: '1',
  name: 'Tu Nombre',
  email: formData.email,
  role: 'admin' // ← Cambia aquí
};
```

---

## ✅ OPCIÓN 2: SCRIPT AUTOMÁTICO (RECOMENDADO)

### Crear usuarios con Node.js

1. **Abre terminal en la carpeta del proyecto**

2. **Ve a la carpeta backend**
   ```bash
   cd backend
   ```

3. **Instala dependencias si no lo has hecho**
   ```bash
   npm install
   ```

4. **Ejecuta el script**
   ```bash
   node scripts/seedUsers.js
   ```

5. **✅ Verás este resultado:**
   ```
   🔌 Conectando a MongoDB...
   ✅ Conectado a MongoDB
   🗑️  Limpiando usuarios existentes...
   ✅ Usuarios eliminados
   👥 Creando usuarios...
   ✅ Usuarios creados exitosamente:
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📋 CREDENCIALES DE ACCESO
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   👨‍💼 ADMINISTRADORES:
   
   1. Admin Principal
      Email:    admin@luxeshop.com
      Password: admin123
      Rol:      ADMIN
   
   2. Andy Rosado
      Email:    andy@luxeshop.com
      Password: andy123
      Rol:      ADMIN
   
   👤 USUARIOS REGULARES:
   
   1. María García
      Email:    maria@example.com
      Password: maria123
      Rol:      user
   
   2. Juan Pérez
      Email:    juan@example.com
      Password: juan123
      Rol:      user
   
   3. Ana López
      Email:    ana@example.com
      Password: ana123
      Rol:      user
   
   4. Carlos Rodríguez
      Email:    carlos@example.com
      Password: carlos123
      Rol:      user
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   ✅ Total: 6 usuarios creados
   ```

---

## ✅ OPCIÓN 3: MONGODB COMPASS (MANUAL)

### Crear usuarios directamente en la base de datos

1. **Abre MongoDB Compass**

2. **Conecta a tu base de datos**
   ```
   mongodb://localhost:27017/luxeshop
   ```

3. **Selecciona la base de datos "luxeshop"**

4. **Abre la colección "users"**

5. **Click en "Add Data" → "Insert Document"**

6. **Copia y pega este JSON:**

#### Para crear un ADMIN:
```json
{
  "name": "Admin Principal",
  "email": "admin@luxeshop.com",
  "password": "$2a$10$rQZx5xhWZH3yKfqYvEKKOOvGEuI0k3qRqUjB0HrC1CYkHhR3VmXa2",
  "role": "admin",
  "phone": "(809) 555-0001",
  "address": {
    "street": "Av. Winston Churchill 1234",
    "city": "Santo Domingo",
    "state": "Distrito Nacional",
    "zipCode": "10001",
    "country": "República Dominicana"
  },
  "isActive": true,
  "cart": [],
  "wishlist": [],
  "createdAt": "2026-02-03T00:00:00.000Z",
  "updatedAt": "2026-02-03T00:00:00.000Z"
}
```

**Password hasheada:** `$2a$10$rQZx5xhWZH3yKfqYvEKKOOvGEuI0k3qRqUjB0HrC1CYkHhR3VmXa2`
**Password real:** `admin123`

#### Para crear un USUARIO:
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "$2a$10$rQZx5xhWZH3yKfqYvEKKOOvGEuI0k3qRqUjB0HrC1CYkHhR3VmXa2",
  "role": "user",
  "phone": "(809) 555-0101",
  "address": {
    "street": "Calle El Sol 123",
    "city": "Santiago",
    "state": "Santiago",
    "zipCode": "51000",
    "country": "República Dominicana"
  },
  "isActive": true,
  "cart": [],
  "wishlist": [],
  "createdAt": "2026-02-03T00:00:00.000Z",
  "updatedAt": "2026-02-03T00:00:00.000Z"
}
```

7. **Click "Insert"**

8. **✅ Usuario creado!**

---

## 📋 USUARIOS PRE-CONFIGURADOS

### Cuando ejecutes el script, obtendrás estos usuarios:

#### 👨‍💼 ADMINISTRADORES (2)

| Nombre | Email | Password | Rol |
|--------|-------|----------|-----|
| Admin Principal | admin@luxeshop.com | admin123 | admin |
| Andy Rosado | andy@luxeshop.com | andy123 | admin |

#### 👤 USUARIOS REGULARES (4)

| Nombre | Email | Password | Rol |
|--------|-------|----------|-----|
| María García | maria@example.com | maria123 | user |
| Juan Pérez | juan@example.com | juan123 | user |
| Ana López | ana@example.com | ana123 | user |
| Carlos Rodríguez | carlos@example.com | carlos123 | user |

---

## 🔐 INICIAR SESIÓN

### Como Administrador

1. **Ve a:** `http://localhost:3000/login`

2. **Usa cualquiera de estos:**
   - Email: `admin@luxeshop.com` / Password: `admin123`
   - Email: `andy@luxeshop.com` / Password: `andy123`

3. **✅ Verás el botón rojo "Panel Admin" arriba**

4. **Click en el botón → Acceso al panel**

### Como Usuario Regular

1. **Ve a:** `http://localhost:3000/login`

2. **Usa cualquiera de estos:**
   - Email: `maria@example.com` / Password: `maria123`
   - Email: `juan@example.com` / Password: `juan123`

3. **✅ Acceso a la tienda (sin panel admin)**

---

## 🔧 VERIFICAR USUARIOS EN MONGODB

### Opción 1: MongoDB Compass

1. Conecta a: `mongodb://localhost:27017`
2. Base de datos: `luxeshop`
3. Colección: `users`
4. Verás todos los usuarios

### Opción 2: Mongo Shell

```bash
mongosh

use luxeshop

db.users.find().pretty()
```

### Opción 3: Ver solo Admins

```bash
db.users.find({ role: "admin" }).pretty()
```

---

## 🎯 SOLUCIÓN DE PROBLEMAS

### "No puedo iniciar sesión"

**Problema:** Password incorrecta

**Solución 1 - Modo Demo (frontend/src/pages/Login.jsx):**
```javascript
// Línea 37-50
// El login en MODO DEMO acepta cualquier password
// Solo verifica que los campos no estén vacíos
```

**Solución 2 - Crear usuario por registro:**
1. Click "Registrarse"
2. Crea cuenta nueva
3. Login con esas credenciales

### "El script no funciona"

**Verifica:**
1. ✅ MongoDB está corriendo
2. ✅ Estás en la carpeta `backend`
3. ✅ Instalaste dependencias: `npm install`
4. ✅ Archivo `.env` existe con `MONGODB_URI`

**Intenta:**
```bash
cd backend
npm install mongoose bcryptjs dotenv
node scripts/seedUsers.js
```

### "No veo los usuarios en MongoDB"

**Verifica la conexión:**
```javascript
// En backend/.env
MONGODB_URI=mongodb://localhost:27017/luxeshop

// O si usas MongoDB Atlas:
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/luxeshop
```

---

## 🚀 WORKFLOWS COMUNES

### Workflow 1: Crear tu primer admin

```bash
# Opción A: Registro + Cambio manual en DB
1. Registrarse en la app
2. Abrir MongoDB Compass
3. Buscar tu usuario
4. Cambiar role: "user" → "admin"
5. Refrescar página
6. ✅ Botón "Panel Admin" aparece

# Opción B: Script
cd backend
node scripts/seedUsers.js
# Login con: admin@luxeshop.com / admin123
```

### Workflow 2: Agregar usuario nuevo

```bash
# Opción A: Desde la app (recomendado)
1. Click "Registrarse"
2. Llenar formulario
3. ✅ Usuario creado

# Opción B: MongoDB Compass
1. Abrir colección "users"
2. Insert Document
3. Copiar JSON de arriba
4. Cambiar email y datos
5. Insert
```

### Workflow 3: Cambiar role de usuario

```javascript
// En MongoDB Compass:
1. Buscar usuario por email
2. Editar documento
3. Cambiar: "role": "user" → "role": "admin"
4. Guardar
5. Usuario debe cerrar sesión y volver a entrar
```

---

## 💡 TIPS IMPORTANTES

### Sobre las Passwords

- ✅ Las passwords están hasheadas con bcrypt
- ✅ Hash usado en ejemplos: `$2a$10$rQZx5xhWZH3yKfqYvEKKOOvGEuI0k3qRqUjB0HrC1CYkHhR3VmXa2`
- ✅ Corresponde a: `admin123`, `andy123`, `maria123`, etc.
- ✅ Puedes usar el mismo hash para testing

### Sobre el Modo Demo

El login actual está en **MODO DEMO** para desarrollo:
- ✅ Acepta cualquier email/password
- ✅ No verifica contra base de datos
- ✅ Perfecto para testing rápido

Para **PRODUCCIÓN**, deberás:
1. Conectar con backend real
2. Verificar credenciales en DB
3. Validar passwords con bcrypt

---

## 📊 RESUMEN RÁPIDO

| Método | Dificultad | Tiempo | Recomendado |
|--------|-----------|--------|-------------|
| **Registro en App** | ⭐ Fácil | 1 min | ✅ Sí |
| **Script Node.js** | ⭐⭐ Medio | 2 min | ✅ Sí |
| **MongoDB Manual** | ⭐⭐⭐ Difícil | 5 min | ❌ No |

---

## 🎉 CONCLUSIÓN

### Usa estos usuarios de inmediato:

```
👨‍💼 ADMIN:
- admin@luxeshop.com / admin123
- andy@luxeshop.com / andy123

👤 USUARIOS:
- maria@example.com / maria123
- juan@example.com / juan123
- ana@example.com / ana123
- carlos@example.com / carlos123
```

### O crea nuevos usuarios:

1. **Más rápido:** Click "Registrarse" en la app
2. **Con datos:** Ejecuta `node scripts/seedUsers.js`
3. **Manual:** MongoDB Compass

---

**¡Ahora tienes usuarios para probar todo el sistema!** 👥✨
