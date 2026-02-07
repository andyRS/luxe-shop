// Script para crear productos iniciales en MongoDB
// Ejecutar: node backend/scripts/seedProducts.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Modelo de Producto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  images: [String],
  image: String,
  stock: { type: Number, default: 10 },
  rating: { type: Number, default: 4.5 },
  numReviews: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  discount: { type: Number, default: 0 },
  colors: [String],
  sizes: [String]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Productos de ejemplo
const products = [
  {
    name: 'Vestido Midi Satinado',
    description: 'Elegante vestido midi confeccionado en satín de alta calidad. Perfecto para ocasiones especiales y eventos formales. Corte favorecedor que realza la silueta.',
    price: 165,
    originalPrice: 220,
    category: 'vestidos',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'
    ],
    stock: 15,
    rating: 4.8,
    numReviews: 24,
    isNewArrival: true,
    isFeatured: true,
    discount: 25,
    colors: ['Rosa', 'Negro', 'Champagne'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    name: 'Conjunto Ejecutivo Beige',
    description: 'Conjunto de dos piezas ideal para el ambiente profesional. Blazer estructurado y pantalón de corte recto. Tela premium con acabado impecable.',
    price: 280,
    originalPrice: 350,
    category: 'conjuntos',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500'
    ],
    stock: 10,
    rating: 4.9,
    numReviews: 18,
    isNewArrival: false,
    isFeatured: true,
    discount: 20,
    colors: ['Beige', 'Negro', 'Gris'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    name: 'Blusa Elegante de Seda',
    description: 'Blusa confeccionada en seda natural con diseño atemporal. Cuello en V y mangas largas. Ideal para combinar con cualquier outfit.',
    price: 95,
    originalPrice: 120,
    category: 'blusas',
    images: [
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500'
    ],
    stock: 25,
    rating: 4.7,
    numReviews: 32,
    isNewArrival: true,
    isFeatured: false,
    discount: 21,
    colors: ['Blanco', 'Negro', 'Azul Marino'],
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    name: 'Falda Plisada Premium',
    description: 'Falda midi plisada en tela de alta calidad. Cintura elástica para mayor comodidad. Perfecta para looks casuales y formales.',
    price: 85,
    originalPrice: 110,
    category: 'faldas',
    images: [
      'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=500',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0afe5?w=500'
    ],
    stock: 20,
    rating: 4.6,
    numReviews: 15,
    isNewArrival: false,
    isFeatured: true,
    discount: 23,
    colors: ['Negro', 'Camel', 'Verde Oliva'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    name: 'Pantalón Wide Leg',
    description: 'Pantalón de pierna ancha con corte moderno y elegante. Tela fluida que brinda comodidad todo el día. Tiro alto favorecedor.',
    price: 125,
    originalPrice: 160,
    category: 'pantalones',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
      'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=500'
    ],
    stock: 18,
    rating: 4.8,
    numReviews: 28,
    isNewArrival: true,
    isFeatured: true,
    discount: 22,
    colors: ['Negro', 'Blanco', 'Terracota'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    name: 'Bolso Crossbody Premium',
    description: 'Bolso de cuero sintético de alta calidad con múltiples compartimentos. Correa ajustable. Perfecto para el día a día.',
    price: 145,
    originalPrice: 180,
    category: 'accesorios',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500'
    ],
    stock: 12,
    rating: 4.9,
    numReviews: 45,
    isNewArrival: false,
    isFeatured: true,
    discount: 19,
    colors: ['Negro', 'Camel', 'Burdeos'],
    sizes: ['Único']
  },
  {
    name: 'Vestido de Noche Largo',
    description: 'Espectacular vestido largo para eventos de gala. Tela con caída perfecta y detalles de pedrería. Elegancia absoluta.',
    price: 320,
    originalPrice: 400,
    category: 'vestidos',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500'
    ],
    stock: 8,
    rating: 4.9,
    numReviews: 12,
    isNewArrival: true,
    isFeatured: true,
    discount: 20,
    colors: ['Negro', 'Rojo', 'Azul Noche'],
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    name: 'Blazer Oversized',
    description: 'Blazer con corte oversized tendencia. Hombreras estructuradas y bolsillos frontales. Ideal para looks modernos.',
    price: 175,
    originalPrice: 220,
    category: 'blusas',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'
    ],
    stock: 14,
    rating: 4.7,
    numReviews: 22,
    isNewArrival: false,
    isFeatured: false,
    discount: 20,
    colors: ['Negro', 'Gris', 'Beige'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    name: 'Jeans Premium Skinny',
    description: 'Jeans skinny de mezclilla premium con elastano para mayor comodidad. Lavado medio, tiro alto. Ajuste perfecto.',
    price: 95,
    originalPrice: 120,
    category: 'pantalones',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'
    ],
    stock: 30,
    rating: 4.6,
    numReviews: 56,
    isNewArrival: false,
    isFeatured: true,
    discount: 21,
    colors: ['Azul Medio', 'Azul Oscuro', 'Negro'],
    sizes: ['24', '26', '28', '30', '32']
  },
  {
    name: 'Collar Dorado Elegante',
    description: 'Collar bañado en oro con diseño minimalista. Largo ajustable. El complemento perfecto para cualquier outfit.',
    price: 65,
    originalPrice: 85,
    category: 'accesorios',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'
    ],
    stock: 40,
    rating: 4.8,
    numReviews: 38,
    isNewArrival: true,
    isFeatured: false,
    discount: 24,
    colors: ['Dorado', 'Plateado'],
    sizes: ['Único']
  },
  {
    name: 'Top Crop Elegante',
    description: 'Top crop con diseño sofisticado. Ideal para combinar con faldas y pantalones de tiro alto. Tela suave y cómoda.',
    price: 55,
    originalPrice: 70,
    category: 'blusas',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500'
    ],
    stock: 22,
    rating: 4.5,
    numReviews: 19,
    isNewArrival: true,
    isFeatured: false,
    discount: 21,
    colors: ['Blanco', 'Negro', 'Rosa'],
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    name: 'Vestido Casual Floral',
    description: 'Vestido casual con estampado floral. Perfecto para el día a día. Tela ligera ideal para clima cálido.',
    price: 89,
    originalPrice: 115,
    category: 'vestidos',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500'
    ],
    stock: 16,
    rating: 4.6,
    numReviews: 27,
    isNewArrival: false,
    isFeatured: true,
    discount: 23,
    colors: ['Azul Floral', 'Rosa Floral', 'Verde Floral'],
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  }
];

// Añadir imagen principal (primera de images)
products.forEach(p => {
  p.image = p.images[0];
});

const seedProducts = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/luxeshop');
    console.log('✅ Conectado a MongoDB');

    console.log('🗑️  Limpiando productos existentes...');
    await Product.deleteMany({});
    console.log('✅ Productos eliminados');

    console.log('📦 Creando productos...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} productos creados exitosamente!\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 PRODUCTOS CREADOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    createdProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p._id}`);
      console.log(`   Precio: $${p.price}`);
      console.log(`   Categoría: ${p.category}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Ahora los productos se cargarán desde la base de datos');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedProducts();
