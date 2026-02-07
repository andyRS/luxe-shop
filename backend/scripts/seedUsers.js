// Script para crear usuarios iniciales en MongoDB
// Ejecutar: node backend/scripts/seedUsers.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Modelo de Usuario (inline para el script)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
    },
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

// Usuarios a crear
const users = [
  {
    name: 'Admin Principal',
    email: 'admin@luxeshop.com',
    password: 'admin123',
    role: 'admin',
    phone: '(809) 555-0001',
    address: {
      street: 'Av. Winston Churchill 1234',
      city: 'Santo Domingo',
      state: 'Distrito Nacional',
      zipCode: '10001',
      country: 'República Dominicana',
    },
  },
  {
    name: 'Andy Rosado',
    email: 'andy@luxeshop.com',
    password: 'andy123',
    role: 'admin',
    phone: '(809) 555-0002',
    address: {
      street: 'Av. Abraham Lincoln 567',
      city: 'Santo Domingo',
      state: 'Distrito Nacional',
      zipCode: '10002',
      country: 'República Dominicana',
    },
  },
  {
    name: 'María García',
    email: 'maria@example.com',
    password: 'maria123',
    role: 'user',
    phone: '(809) 555-0101',
    address: {
      street: 'Calle El Sol 123',
      city: 'Santiago',
      state: 'Santiago',
      zipCode: '51000',
      country: 'República Dominicana',
    },
  },
  {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'juan123',
    role: 'user',
    phone: '(809) 555-0102',
    address: {
      street: 'Av. Lope de Vega 456',
      city: 'Santo Domingo',
      state: 'Distrito Nacional',
      zipCode: '10003',
      country: 'República Dominicana',
    },
  },
  {
    name: 'Ana López',
    email: 'ana@example.com',
    password: 'ana123',
    role: 'user',
    phone: '(809) 555-0103',
    address: {
      street: 'Calle Duarte 789',
      city: 'La Vega',
      state: 'La Vega',
      zipCode: '41000',
      country: 'República Dominicana',
    },
  },
  {
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    password: 'carlos123',
    role: 'user',
    phone: '(809) 555-0104',
    address: {
      street: 'Av. Independencia 321',
      city: 'San Pedro de Macorís',
      state: 'San Pedro de Macorís',
      zipCode: '21000',
      country: 'República Dominicana',
    },
  },
];

const seedUsers = async () => {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxeshop');
    console.log('✅ Conectado a MongoDB');

    // Limpiar usuarios existentes (opcional)
    console.log('🗑️  Limpiando usuarios existentes...');
    await User.deleteMany({});
    console.log('✅ Usuarios eliminados');

    // Crear usuarios con contraseñas hasheadas
    console.log('👥 Creando usuarios...');
    
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    
    console.log('✅ Usuarios creados exitosamente:');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 CREDENCIALES DE ACCESO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Mostrar admins
    console.log('👨‍💼 ADMINISTRADORES:');
    users.filter(u => u.role === 'admin').forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Rol:      ${user.role.toUpperCase()}`);
    });
    
    console.log('\n');
    console.log('👤 USUARIOS REGULARES:');
    users.filter(u => u.role === 'user').forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email:    ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Rol:      ${user.role}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Total: ${createdUsers.length} usuarios creados`);
    console.log('\n💡 Puedes usar cualquiera de estos emails y passwords para iniciar sesión');
    console.log('🔐 Los administradores tienen acceso al Panel Admin\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    process.exit(1);
  }
};

// Ejecutar
seedUsers();
