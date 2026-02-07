# 📸 GUÍA: Cómo Agregar Imágenes de Productos a LuxeShop

## ✅ Ya Está Configurado

He integrado tus 7 imágenes de productos en el proyecto. Aquí te explico cómo funciona:

---

## 📁 Estructura de Imágenes

```
frontend/
└── public/
    └── images/
        └── products/
            ├── producto-1.png  (Conjunto ejecutivo beige)
            ├── producto-2.png  (Camisa blanca satinada)
            ├── producto-3.png  (Top y pantalón satinado)
            ├── producto-4.png  (Vestido midi)
            ├── producto-5.png  (Blusa cruzada blanca)
            ├── producto-6.png  (Bolso premium)
            └── producto-7.png  (Sweater beige casual)
```

---

## 🎯 Cómo Se Usan Las Imágenes

### En el Código

Las imágenes se referencian así:

```javascript
image: '/images/products/producto-1.png'
```

**Nota:** La ruta empieza con `/` porque las imágenes están en la carpeta `public/`

---

## ➕ Cómo Agregar MÁS Imágenes

### Método 1: Manualmente (Recomendado)

1. **Coloca tus imágenes** en esta carpeta:
   ```
   frontend/public/images/products/
   ```

2. **Nombra tus archivos** descriptivamente:
   ```
   vestido-rojo.png
   blazer-negro.jpg
   pantalon-azul.webp
   ```

3. **Usa en el código**:
   ```javascript
   {
     _id: '8',
     name: 'Vestido Rojo Elegante',
     image: '/images/products/vestido-rojo.png',
     // ... resto de propiedades
   }
   ```

### Método 2: Con Backend Real

Cuando conectes el backend, puedes usar servicios de upload:

**Opción A: Cloudinary** (Recomendado)
```javascript
// 1. Instalar
npm install cloudinary multer

// 2. Configurar en backend
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'tu_cloud_name',
  api_key: 'tu_api_key',
  api_secret: 'tu_api_secret'
});

// 3. Subir imagen
const result = await cloudinary.uploader.upload(file.path);
product.image = result.secure_url;
```

**Opción B: AWS S3**
```javascript
npm install aws-sdk multer-s3
```

**Opción C: Firebase Storage**
```javascript
npm install firebase
```

---

## 🖼️ Formatos Recomendados

### Para Web Optimizado

| Formato | Uso | Ventajas |
|---------|-----|----------|
| **WebP** | Principal | Mejor compresión, calidad alta |
| **PNG** | Con transparencias | Sin pérdida, transparencias |
| **JPG** | Fotos complejas | Buena compresión |
| **SVG** | Iconos/logos | Escalable, ligero |

### Dimensiones Recomendadas

```
Product Card: 600x800px (relación 3:4)
Product Detail: 1200x1600px (alta calidad)
Thumbnails: 300x400px
```

---

## 🔧 Optimizar Imágenes Antes de Subir

### Herramientas Online (Gratis)

1. **TinyPNG** → https://tinypng.com/
   - Reduce hasta 70% sin perder calidad
   - Soporta PNG y JPG

2. **Squoosh** → https://squoosh.app/
   - Convierte a WebP
   - Optimización avanzada

3. **ImageOptim** (Mac)
   - App de escritorio
   - Muy efectiva

### Con Node.js (Automático)

```bash
npm install sharp
```

```javascript
import sharp from 'sharp';

// Optimizar y redimensionar
await sharp('original.png')
  .resize(600, 800, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile('optimized.webp');
```

---

## 📝 Actualizar Productos con Nuevas Imágenes

### Opción 1: En Home.jsx

```javascript
const mockProducts = [
  {
    _id: '8',
    name: 'Tu Nuevo Producto',
    description: 'Descripción del producto',
    price: 150,
    image: '/images/products/tu-imagen.png', // ← Tu imagen
    category: 'Vestidos',
    rating: 5,
    reviews: 20,
    stock: 10,
    isNew: true,
    discount: 0
  },
  // ... más productos
];
```

### Opción 2: En Products.jsx

Agrega más productos en el array `realProducts`:

```javascript
{
  _id: '8',
  name: 'Nueva Prenda',
  description: 'Descripción detallada',
  price: 200,
  image: '/images/products/nueva-prenda.png',
  category: 'Formal',
  rating: 5,
  reviews: 15,
  stock: 8,
  isNew: true,
  discount: 10
}
```

---

## 🎨 Convenciones de Nombres

### Buenos Nombres

✅ `vestido-rojo-largo.png`
✅ `blazer-negro-formal.jpg`
✅ `camisa-blanca-ejecutiva.webp`
✅ `bolso-cadena-dorada.png`

### Malos Nombres

❌ `IMG_1234.png`
❌ `foto producto.jpg` (espacios)
❌ `VESTIDO.PNG` (mayúsculas)
❌ `producto-final-definitivo-v3.png` (muy largo)

**Reglas:**
- Solo minúsculas
- Sin espacios (usa guiones `-`)
- Descriptivo pero conciso
- Sin caracteres especiales (á, é, ñ, etc.)

---

## 🌐 Servir Imágenes en Producción

### Vercel (Frontend)

Las imágenes en `/public` se sirven automáticamente:
```
https://tu-sitio.vercel.app/images/products/producto-1.png
```

### Con CDN (Recomendado)

Para mejor rendimiento:

1. **Cloudinary**
   ```
   https://res.cloudinary.com/tu-cloud/image/upload/productos/producto-1.png
   ```

2. **ImgIX**
   ```
   https://tu-dominio.imgix.net/productos/producto-1.png?w=600&auto=format
   ```

---

## 🚀 Lazy Loading (Carga Diferida)

Para optimizar el rendimiento:

```jsx
<img
  src="/images/products/producto-1.png"
  alt="Producto 1"
  loading="lazy"  // ← Carga solo cuando sea visible
/>
```

Ya está implementado en el ProductCard component.

---

## 📦 Múltiples Imágenes por Producto

Para galería de imágenes:

```javascript
{
  _id: '1',
  name: 'Producto',
  image: '/images/products/producto-1.png', // Principal
  images: [  // Galería
    '/images/products/producto-1.png',
    '/images/products/producto-1-frente.png',
    '/images/products/producto-1-espalda.png',
    '/images/products/producto-1-detalle.png'
  ]
}
```

---

## 🔍 Troubleshooting

### Imagen No Se Ve

1. **Verifica la ruta:**
   ```
   ✅ /images/products/producto-1.png
   ❌ images/products/producto-1.png  (falta /)
   ❌ /public/images/products/producto-1.png  (sobra /public)
   ```

2. **Verifica que existe:**
   ```bash
   ls frontend/public/images/products/
   ```

3. **Verifica el formato:**
   - Soportados: .png, .jpg, .jpeg, .webp, .gif, .svg

4. **Reinicia el servidor:**
   ```bash
   # Detén con Ctrl+C
   npm run dev
   ```

### Imagen Muy Pesada

```bash
# Ver tamaño
ls -lh frontend/public/images/products/producto-1.png

# Si es > 500KB, optimízala
```

---

## ✨ Mejores Prácticas

1. **Optimiza SIEMPRE** antes de subir (< 200KB por imagen)
2. **Usa WebP** cuando sea posible
3. **Nombres descriptivos** y consistentes
4. **Mantén backup** de originales
5. **Versiona** tus imágenes si cambias
6. **Lazy loading** habilitado
7. **Alt text** descriptivo para SEO

---

## 🎁 Extras

### Placeholder Mientras Carga

```jsx
<img
  src="/images/products/producto-1.png"
  alt="Producto"
  style={{ backgroundColor: '#f0f0f0' }}
  onError={(e) => {
    e.target.src = '/images/placeholder.png'; // Imagen por defecto
  }}
/>
```

### Zoom en ProductDetail

Ya implementado con la galería de imágenes.

---

## 📊 Resumen

✅ **Ya tienes 7 productos con imágenes reales**
✅ **Estructura organizada en `/public/images/products/`**
✅ **Código actualizado para usar tus imágenes**
✅ **Listo para agregar más imágenes fácilmente**

**Solo necesitas:**
1. Colocar nuevas imágenes en `public/images/products/`
2. Referenciarlas en el código
3. ¡Listo!

---

Desarrollado para Andy Rosado - LuxeShop 2026
