import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true, default: 'Consulta general' },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'read', 'replied'], default: 'pending' },
    repliedAt: Date,
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
