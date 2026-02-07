import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;
