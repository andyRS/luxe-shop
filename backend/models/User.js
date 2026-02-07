import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxLength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minLength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true // Permite múltiples valores null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'República Dominicana'
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: '/default-avatar.png'
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    cart: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date
  },
  {
    timestamps: true
  }
);

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;
