# 📘 GUÍA DE INSTALACIÓN Y CONFIGURACIÓN - LUXESHOP

## 🎯 Guía Paso a Paso para Andy Rosado

Esta guía te llevará desde cero hasta tener el proyecto completamente funcional.

---

## 📋 PASO 1: REQUISITOS PREVIOS

### Instalar Node.js
1. Ve a https://nodejs.org/
2. Descarga la versión LTS (Long Term Support)
3. Instala siguiendo el asistente
4. Verifica la instalación:
```bash
node --version
npm --version
```

### Instalar MongoDB (Opción Local)
**Opción A - MongoDB Community (Local):**
1. Ve a https://www.mongodb.com/try/download/community
2. Descarga e instala
3. Inicia MongoDB:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

**Opción B - MongoDB Atlas (Recomendado - Gratis):**
1. Crea cuenta en https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito (M0)
3. Crea un usuario de base de datos
4. Whitel all IPs (0.0.0.0/0) en Network Access
5. Copia el connection string

### Instalar Git
1. Ve a https://git-scm.com/
2. Descarga e instala
3. Verifica:
```bash
git --version
```

---

## 📦 PASO 2: CONFIGURAR EL PROYECTO

### 1. Navega a la carpeta del proyecto
```bash
cd /ruta/donde/guardaste/luxe-shop
```

### 2. Instalar dependencias del BACKEND
```bash
cd backend
npm install
```

**Dependencias que se instalarán:**
- express (framework web)
- mongoose (ODM para MongoDB)
- cors (cross-origin)
- dotenv (variables de entorno)
- bcryptjs (encriptación de contraseñas)
- jsonwebtoken (autenticación JWT)
- stripe (procesamiento de pagos)
- express-validator (validación de datos)
- multer (manejo de archivos/imágenes)
- nodemon (dev dependency - reinicio automático)

### 3. Instalar dependencias del FRONTEND
```bash
cd ../frontend
npm install
```

**Dependencias que se instalarán:**
- react & react-dom
- vite (build tool)
- tailwindcss (estilos)
- zustand (estado global)
- react-router-dom (rutas)
- axios (peticiones HTTP)
- framer-motion (animaciones)
- react-hot-toast (notificaciones)
- lucide-react (iconos)

---

## ⚙️ PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### Backend - Crear archivo .env

```bash
cd backend
```

**Método 1 (Recomendado):** Copia el archivo de ejemplo
```bash
cp .env.example .env
```

**Método 2:** Crea manualmente un archivo llamado `.env` (sin extensión) con este contenido:

```env
# Servidor
PORT=5000
NODE_ENV=development

# MongoDB - Elige UNA de estas opciones:

# Opción A: MongoDB Local
MONGODB_URI=mongodb://localhost:27017/luxeshop

# Opción B: MongoDB Atlas (recomendado)
# MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxxx.mongodb.net/luxeshop?retryWrites=true&w=majority

# JWT Secret (IMPORTANTE: Genera uno seguro)
JWT_SECRET=mi_super_secreto_jwt_2026_luxeshop_andy
JWT_EXPIRE=30d

# Stripe (Modo TEST - obtén claves gratis en https://stripe.com)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend - Crear archivo .env

```bash
cd ../frontend
```

Crea un archivo llamado `.env` con este contenido:

```env
# API Backend
VITE_API_URL=http://localhost:5000/api

# Stripe Publishable Key (modo TEST)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🎨 PASO 4: OPCIONAL - STRIPE (Pagos)

Si quieres probar la funcionalidad de pagos:

1. Ve a https://stripe.com
2. Crea una cuenta gratuita
3. Ve a "Developers" > "API Keys"
4. Copia la "Publishable key" y "Secret key" (modo TEST)
5. Pega las claves en tus archivos `.env`

**Nota:** El proyecto funciona sin Stripe, pero la funcionalidad de pago no estará disponible.

---

## 🚀 PASO 5: INICIAR EL PROYECTO

Necesitas **DOS terminales abiertas** simultáneamente:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Deberías ver:**
```
🚀 Servidor corriendo en puerto 5000
📍 URL: http://localhost:5000
✅ MongoDB conectado exitosamente
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Deberías ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 🌐 PASO 6: ABRIR EN EL NAVEGADOR

1. Abre tu navegador favorito (Chrome, Firefox, etc.)
2. Ve a: **http://localhost:3000**
3. ¡Deberías ver tu tienda funcionando! 🎉

---

## 📊 PASO 7: CREAR DATOS DE PRUEBA

El proyecto viene con productos de ejemplo, pero si quieres crear más:

### Opción A: Usar la API directamente

Puedes usar Postman, Insomnia o Thunder Client para hacer peticiones a:
```
POST http://localhost:5000/api/products
```

### Opción B: Crear un script seed (próximamente)

---

## 🔐 PASO 8: CREAR USUARIOS DE PRUEBA

### Opción A: Script Automático (Recomendado)
```bash
cd backend
node scripts/seedUsers.js
```

Esto creará automáticamente:
- **2 Administradores:**
  - admin@luxeshop.com / admin123
  - andy@luxeshop.com / andy123
- **4 Usuarios regulares:**
  - maria@example.com / maria123
  - juan@example.com / juan123
  - ana@example.com / ana123
  - carlos@example.com / carlos123

### Opción B: Manual
1. Registra un usuario normal en la interfaz
2. Ve a MongoDB Compass o Atlas
3. Busca el usuario en la colección `users`
4. Cambia el campo `role` de `"user"` a `"admin"`
5. Ahora tendrás acceso al panel de administración

**Ver más detalles:** Consulta el archivo `USUARIOS-GUIDE.md`

---

## 🛠️ COMANDOS ÚTILES

### Backend
```bash
npm run dev        # Modo desarrollo con nodemon
npm start          # Modo producción
```

### Frontend
```bash
npm run dev        # Desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot find module"
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Cambia el puerto en .env
PORT=5001  # en vez de 5000
```

### Error de conexión a MongoDB
```bash
# Verifica que MongoDB esté corriendo:
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl status mongod
```

### Error de CORS
Verifica que el frontend esté en el puerto correcto (3000) y que en `server.js` tengas:
```javascript
app.use(cors());
```

---

## 📱 PRÓXIMOS PASOS

1. **Explora el proyecto**: Navega por la tienda, agrega productos al carrito
2. **Personaliza el diseño**: Cambia colores en `tailwind.config.js`
3. **Agrega productos**: Usa el panel de administración
4. **Prueba el checkout**: Simula una compra
5. **Deploy**: Sube tu proyecto a Vercel + Railway

---

## 🎓 RECURSOS ADICIONALES

- **Documentación React**: https://react.dev
- **Documentación Express**: https://expressjs.com
- **Documentación MongoDB**: https://docs.mongodb.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing

---

## 💬 SOPORTE

Si tienes problemas:
1. Revisa esta guía completamente
2. Verifica que todos los pasos se hayan seguido
3. Revisa la consola del navegador (F12) para errores
4. Revisa las terminales de backend y frontend

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Node.js instalado
- [ ] MongoDB instalado/configurado
- [ ] Dependencias backend instaladas
- [ ] Dependencias frontend instaladas
- [ ] Archivo .env backend creado y configurado
- [ ] Archivo .env frontend creado y configurado
- [ ] Backend corriendo en puerto 5000
- [ ] Frontend corriendo en puerto 3000
- [ ] Navegador abierto en http://localhost:3000
- [ ] Página cargando correctamente

---

**¡Felicidades! Tu tienda e-commerce está lista para usar** 🎉

Desarrollado por Andy Rosado - 2026
