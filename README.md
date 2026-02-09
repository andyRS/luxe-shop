# 🛍️ LuxeShop — E-Commerce Full-Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express_4-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Cloudinary-CDN-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</p>

**LuxeShop** es una plataforma de e-commerce completa y lista para producción, construida con el stack MERN (MongoDB, Express, React, Node.js). Incluye panel de administración, pagos con Stripe, autenticación con Google OAuth, sistema de cupones, lista de deseos, notificaciones por email, generación de facturas PDF, widget de WhatsApp contextual y más.

### 🌐 Demo en Vivo

| Servicio | URL |
|----------|-----|
| **Frontend** | [frontend-nine-tan-82.vercel.app](https://frontend-nine-tan-82.vercel.app) |
| **Backend API** | [luxe-shop-4cok.onrender.com](https://luxe-shop-4cok.onrender.com) |

> ⏳ El backend en Render (free tier) puede tardar ~30s en despertar si lleva tiempo inactivo.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tech Stack](#-tech-stack)
- [Arquitectura](#-arquitectura)
- [Inicio Rápido](#-inicio-rápido)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Despliegue](#-despliegue)
- [Docker](#-docker)
- [Usuarios de Prueba](#-usuarios-de-prueba)
- [Documentación Adicional](#-documentación-adicional)
- [Licencia](#-licencia)

---

## ✨ Características

### 🏪 Tienda
- Catálogo de productos con imágenes reales (Cloudinary CDN)
- Búsqueda full-text e índices compuestos en MongoDB
- Filtros por categoría, precio, talla, color y más
- Carrito de compras persistente (Zustand + localStorage)
- Checkout completo con validación de formularios
- Sistema de cupones de descuento (porcentaje y monto fijo)
- Lista de deseos (favoritos)
- Reseñas y calificaciones de productos
- Páginas de ofertas y nuevos lanzamientos
- Diseño 100% responsive (mobile-first con TailwindCSS)
- SEO optimizado con React Helmet Async + sitemap.xml + robots.txt
- Animaciones fluidas con Framer Motion

### 💳 Pagos
- Integración con Stripe (PaymentIntent API)
- Modo demo automático cuando Stripe no está configurado
- Confirmación de pago con webhooks
- Soporte para Visa, Mastercard, Amex, Discover

### 👨‍💼 Panel de Administración (`/admin`)
- Dashboard con estadísticas y métricas
- CRUD completo de productos con upload de imágenes
- Gestión de órdenes (estados: pendiente → procesando → enviado → entregado)
- Gestión de usuarios (promover a admin, activar/desactivar)
- Gestión de cupones de descuento
- Configuración de la tienda (impuestos, envío, moneda)
- Generación de facturas PDF personalizadas
- Botón "Panel Admin" destacado en el header para admins

### 🔐 Autenticación
- JWT con tokens de 30 días
- Google OAuth 2.0 (Passport.js)
- Registro y login con validación
- Recuperación de contraseña por email
- Protección de rutas (usuario/admin)
- Rate limiting en endpoints de auth (20 req/15min)

### 📱 WhatsApp Automatizado
- Widget flotante inteligente
- Mensajes contextuales según la página actual
- 6 opciones de mensaje rápido preconfiguradas
- Botón integrado en el header
- Configurable desde panel de administración

### 📧 Emails Transaccionales
- Confirmación de orden con detalle de productos
- Actualización de estado de envío
- Recuperación de contraseña
- Contacto y newsletter
- Templates HTML profesionales
- Fallback a Ethereal en desarrollo

---

## 🛠 Tech Stack

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 18+ | Runtime |
| **Express** | 4.18 | Framework HTTP |
| **MongoDB** | 7+ | Base de datos |
| **Mongoose** | 8.1 | ODM |
| **JWT** | 9.0 | Autenticación |
| **Passport** | 0.7 | Google OAuth 2.0 |
| **Stripe** | 14.17 | Procesamiento de pagos |
| **Cloudinary** | 1.41 | CDN de imágenes |
| **Multer** | 1.4.5 | Upload de archivos |
| **Nodemailer** | 6.10 | Envío de emails |
| **PDFKit** | 0.17 | Generación de facturas |
| **Helmet** | 8.1 | Headers de seguridad |
| **express-rate-limit** | 8.2 | Rate limiting |
| **express-validator** | 7.0 | Validación de datos |

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 18.3 | UI Library |
| **Vite** | 5.1 | Build tool |
| **React Router** | 6.22 | Routing SPA |
| **Zustand** | 4.5 | State management |
| **TailwindCSS** | 3.4 | Estilos |
| **Axios** | 1.6 | Cliente HTTP |
| **Framer Motion** | 11.0 | Animaciones |
| **Lucide React** | 0.344 | Iconografía |
| **React Helmet Async** | 2.0 | SEO / Meta tags |
| **React Hot Toast** | 2.4 | Notificaciones |

### Infraestructura

| Servicio | Uso |
|----------|-----|
| **Vercel** | Hosting del frontend |
| **Render** | Hosting del backend |
| **MongoDB Atlas** | Base de datos en la nube |
| **Cloudinary** | CDN y transformación de imágenes |
| **Docker** | Opción de self-hosting |

---

## 🏗 Arquitectura

```
┌─────────────┐     HTTPS     ┌──────────────┐     HTTPS     ┌──────────────┐
│   Browser    │ ◄──────────► │    Vercel     │               │   Cloudinary │
│  (React SPA) │              │  (Frontend)   │               │   (Imágenes) │
└──────┬───────┘              └──────────────┘               └──────────────┘
       │                                                            ▲
       │ API calls                                                  │
       ▼                                                            │
┌──────────────┐              ┌──────────────┐              ┌───────┴──────┐
│    Render     │ ◄──────────► │ MongoDB Atlas│              │    Stripe    │
│   (Backend)   │              │  (Database)  │              │  (Payments)  │
└──────────────┘              └──────────────┘              └──────────────┘
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ y **npm** 9+
- **MongoDB** local o cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- (Opcional) Cuenta en [Cloudinary](https://cloudinary.com), [Stripe](https://stripe.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/andyRS/luxe-shop.git
cd luxe-shop
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env    # Editar con tus credenciales
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
cp .env.example .env    # Editar VITE_API_URL si es necesario
```

### 4. Poblar la base de datos (opcional)

```bash
cd backend
node scripts/seedUsers.js      # 5 usuarios (2 admin + 3 users)
node scripts/seedProducts.js   # 12 productos de ejemplo
node scripts/seedCoupons.js    # 4 cupones de descuento
```

### 5. Ejecutar en desarrollo

```bash
# Terminal 1 — Backend (puerto 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (puerto 5173)
cd frontend && npm run dev
```

Abrir: **http://localhost:5173**

---

## 🔑 Variables de Entorno

### Backend (`backend/.env`)

```env
# Servidor
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/luxeshop

# JWT
JWT_SECRET=tu_secreto_jwt_seguro
JWT_EXPIRE=30d

# Stripe (https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email SMTP (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_16_chars
SMTP_FROM=LuxeShop <tu_email@gmail.com>

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

> **Nota:** Stripe y Google OAuth son opcionales. Sin Stripe configurado, el checkout funciona en modo demo. Sin Google OAuth, el login con Google estará deshabilitado.

---

## 📁 Estructura del Proyecto

```
luxe-shop/
├── backend/
│   ├── server.js                  # Entry point del servidor Express
│   ├── config/
│   │   ├── cloudinary.js          # Configuración Cloudinary + Multer
│   │   └── passport.js            # Estrategia Google OAuth
│   ├── controllers/
│   │   ├── adminController.js     # Dashboard, stats, gestión usuarios
│   │   ├── authController.js      # Login, registro, reset password
│   │   ├── contactController.js   # Formulario de contacto
│   │   ├── couponController.js    # CRUD cupones
│   │   ├── orderController.js     # Crear/gestionar órdenes
│   │   ├── paymentController.js   # Stripe PaymentIntent, webhooks
│   │   ├── productController.js   # CRUD productos, búsqueda
│   │   ├── reviewController.js    # Reseñas de productos
│   │   ├── settingsController.js  # Configuración de la tienda
│   │   └── wishlistController.js  # Lista de deseos
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verify, roles (protect, admin)
│   │   └── validation.js          # express-validator schemas
│   ├── models/
│   │   ├── Contact.js, Coupon.js, Newsletter.js, Order.js
│   │   ├── Product.js, Review.js, StoreSettings.js, User.js
│   ├── routes/                    # Definición de rutas por módulo
│   ├── scripts/                   # Seeds (usuarios, productos, cupones)
│   ├── utils/
│   │   ├── emailService.js        # Templates y envío de emails
│   │   └── pdfService.js          # Generación de facturas PDF
│   └── uploads/                   # (Solo desarrollo local)
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx                # Router principal
│   │   ├── main.jsx               # Entry point React
│   │   ├── index.css              # TailwindCSS imports
│   │   ├── components/
│   │   │   ├── Header.jsx         # Navbar, carrito, admin button
│   │   │   ├── Footer.jsx         # Links, newsletter
│   │   │   ├── ProductCard.jsx    # Tarjeta de producto reutilizable
│   │   │   ├── ProductReviews.jsx # Sistema de reseñas
│   │   │   ├── ProtectedRoute.jsx # Wrapper auth/admin
│   │   │   ├── SEO.jsx            # Meta tags dinámicos
│   │   │   ├── Skeleton.jsx       # Loading skeletons
│   │   │   ├── WhatsAppWidget.jsx # Widget flotante WhatsApp
│   │   │   └── WishlistButton.jsx # Botón de favoritos
│   │   ├── pages/
│   │   │   ├── Home.jsx, Products.jsx, ProductDetail.jsx
│   │   │   ├── Categories.jsx, Offers.jsx, Contact.jsx
│   │   │   ├── Cart.jsx, Checkout.jsx, OrderConfirmation.jsx
│   │   │   ├── Login.jsx, Register.jsx, Profile.jsx
│   │   │   ├── ForgotPassword.jsx, ResetPassword.jsx
│   │   │   ├── Wishlist.jsx, NotFound.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       └── OrderManagement.jsx
│   │   ├── services/              # API calls (axios)
│   │   ├── store/                 # Zustand stores (auth, cart, settings, wishlist)
│   │   └── utils/
│   │       └── formatCurrency.js  # USD y RD$ formatters
│   └── public/
│       ├── robots.txt, sitemap.xml
│       └── images/products/
│
├── docker-compose.yml             # MongoDB + Backend + Frontend
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf                     # Config Nginx para Docker
└── docs/
    └── GOOGLE_OAUTH_SETUP.md
```

---

## 📡 API Endpoints

### Productos — `/api/products`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Público | Listar productos (filtros, paginación, búsqueda) |
| GET | `/:id` | Público | Detalle de producto |
| POST | `/` | Admin | Crear producto |
| PUT | `/:id` | Admin | Actualizar producto |
| DELETE | `/:id` | Admin | Eliminar producto |

### Autenticación — `/api/auth`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/register` | Público | Registrar usuario |
| POST | `/login` | Público | Iniciar sesión (JWT) |
| GET | `/me` | Privado | Perfil del usuario |
| PUT | `/profile` | Privado | Actualizar perfil |
| POST | `/forgot-password` | Público | Solicitar reset de contraseña |
| PUT | `/reset-password/:token` | Público | Resetear contraseña |
| GET | `/google` | Público | Iniciar Google OAuth |
| GET | `/google/callback` | Público | Callback de Google OAuth |

### Órdenes — `/api/orders`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/` | Privado | Crear orden |
| GET | `/my-orders` | Privado | Mis órdenes |
| GET | `/:id` | Privado | Detalle de orden |
| GET | `/:id/invoice` | Privado | Descargar factura PDF |
| GET | `/stripe-config` | Público | Obtener Stripe publishable key |
| POST | `/create-payment-intent` | Privado | Crear PaymentIntent |
| POST | `/confirm-payment` | Privado | Confirmar pago |
| GET | `/` | Admin | Todas las órdenes |
| PUT | `/:id/status` | Admin | Actualizar estado |
| POST | `/:id/invoice/custom` | Admin | Factura personalizada |

### Reseñas — `/api/reviews`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/product/:productId` | Público | Reseñas de un producto |
| POST | `/` | Privado | Crear reseña |
| DELETE | `/:id` | Privado | Eliminar reseña |

### Cupones — `/api/coupons`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/validate` | Privado | Validar cupón |
| GET | `/` | Admin | Listar cupones |
| POST | `/` | Admin | Crear cupón |
| PUT | `/:id` | Admin | Actualizar cupón |
| DELETE | `/:id` | Admin | Eliminar cupón |

### Wishlist — `/api/wishlist`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | Privado | Mi lista de deseos |
| POST | `/toggle` | Privado | Agregar/quitar de favoritos |

### Admin — `/api/admin`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/stats` | Admin | Estadísticas del dashboard |
| GET | `/users` | Admin | Listar usuarios |
| PUT | `/users/:id/role` | Admin | Cambiar rol de usuario |
| PUT | `/users/:id/status` | Admin | Activar/desactivar usuario |

### General — `/api`
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/contact` | Público | Enviar formulario de contacto |
| POST | `/newsletter` | Público | Suscribirse al newsletter |
| POST | `/upload` | Admin | Subir imagen a Cloudinary |
| DELETE | `/upload/:public_id` | Admin | Eliminar imagen de Cloudinary |
| GET | `/settings` | Público | Configuración de la tienda |
| GET | `/health` | Público | Estado del servidor |

---

## 🗄 Base de Datos

### Modelos

| Modelo | Descripción | Campos principales |
|--------|-------------|-------------------|
| **User** | Usuarios | name, email, password (bcrypt), googleId, role (user/admin), wishlist, cart, address |
| **Product** | Productos | name, description, price, discount, category (11 categorías), images[], stock, sizes, colors, rating, isFeatured |
| **Order** | Órdenes | orderNumber (auto), user, items[], shippingAddress, paymentMethod, totals (items+tax+shipping), status, isPaid |
| **Review** | Reseñas | user, product, rating (1-5), title, comment |
| **Coupon** | Cupones | code, discountType (percentage/fixed), discountValue, minPurchase, maxUses, expiresAt |
| **StoreSettings** | Config tienda | storeName, currency, taxRate, taxName, freeShippingThreshold, whatsappNumber |
| **Contact** | Contactos | name, email, subject, message, status |
| **Newsletter** | Suscriptores | email, isActive |

### Categorías de Producto

`vestidos` · `pantalones` · `camisas` · `blusas` · `accesorios` · `zapatos` · `casual` · `formal` · `deportivo` · `conjuntos` · `faldas`

---

## 🌍 Despliegue

### Frontend en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar con variable de entorno
cd frontend
vercel --prod --build-env VITE_API_URL="https://tu-backend.onrender.com/api"
```

El archivo `vercel.json` ya está configurado con:
- Rewrite SPA (todas las rutas → `index.html`)
- Cache de assets estáticos (1 año)
- Headers de seguridad

### Backend en Render

1. Crear un **Web Service** en [render.com](https://render.com)
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `node server.js`
4. Agregar todas las variables de entorno del backend
5. En **CORS_ORIGINS** incluir la URL de Vercel

### MongoDB Atlas

1. Crear cluster en [cloud.mongodb.com](https://cloud.mongodb.com)
2. Crear usuario de base de datos
3. Agregar `0.0.0.0/0` en Network Access (para Render)
4. Copiar connection string a `MONGODB_URI`

---

## 🐳 Docker

Para self-hosting con Docker Compose (incluye MongoDB, Backend y Frontend con Nginx):

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

**Servicios:**

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `mongodb` | 27017 | MongoDB 7 con volumen persistente |
| `backend` | 5000 | API Express |
| `frontend` | 80 | React + Nginx (proxy a backend) |

---

## 👥 Usuarios de Prueba

Después de ejecutar `node backend/scripts/seedUsers.js`:

| Nombre | Email | Contraseña | Rol |
|--------|-------|------------|-----|
| Admin Principal | `admin@luxeshop.com` | `admin123` | 🔴 Admin |
| Andy Rosado | `andy@luxeshop.com` | `andy123` | 🔴 Admin |
| María García | `maria@example.com` | `maria123` | 👤 Usuario |
| Juan Pérez | `juan@example.com` | `juan123` | 👤 Usuario |
| Ana López | `ana@example.com` | `ana123` | 👤 Usuario |

> Los admins verán el botón rojo **"Panel Admin"** en el header después de iniciar sesión.

---

## 📚 Documentación Adicional

| Archivo | Contenido |
|---------|-----------|
| [INSTALACION.md](INSTALACION.md) | Guía detallada de instalación paso a paso |
| [ADMIN-GUIDE.md](ADMIN-GUIDE.md) | Manual completo del panel de administración |
| [USUARIOS-GUIDE.md](USUARIOS-GUIDE.md) | Guía para usuarios de la tienda |
| [WHATSAPP-GUIDE.md](WHATSAPP-GUIDE.md) | Configuración del sistema WhatsApp |
| [IMAGENES.md](IMAGENES.md) | Gestión de imágenes y Cloudinary |
| [RESUMEN.md](RESUMEN.md) | Resumen ejecutivo del proyecto |
| [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) | Configuración de Google OAuth |

---

## 🧰 Scripts Útiles

```bash
# Desarrollo
cd backend && npm run dev       # Backend con nodemon (hot reload)
cd frontend && npm run dev      # Frontend con Vite (HMR)

# Producción
cd backend && npm start          # Backend sin nodemon
cd frontend && npm run build     # Build optimizado

# Base de datos
node backend/scripts/seedUsers.js       # Poblar usuarios
node backend/scripts/seedProducts.js    # Poblar productos
node backend/scripts/seedCoupons.js     # Poblar cupones
node backend/scripts/updateProducts.js  # Actualizar productos existentes
```

---

## 📄 Licencia

Este proyecto fue creado por **Andy Rosado** como proyecto de portafolio.

---

<p align="center">
  Hecho con ❤️ usando React, Node.js, MongoDB y mucho café ☕
</p>

---

**Desarrollado por Andy Rosado - 2026**
