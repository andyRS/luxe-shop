import Contact from '../models/Contact.js';
import Newsletter from '../models/Newsletter.js';
import { sendContactEmail } from '../utils/emailService.js';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await Contact.create({ name, email, phone, subject, message });

    // Send notification email
    try {
      await sendContactEmail({ name, email, phone, subject, message });
    } catch (emailErr) {
      console.error('Error enviando email de contacto:', emailErr);
    }

    res.status(201).json({ message: 'Mensaje enviado exitosamente. Te responderemos pronto.', contact });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el mensaje', error: error.message });
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(50);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: 'Este email ya está suscrito al newsletter' });
      }
      existing.isActive = true;
      await existing.save();
      return res.json({ message: '¡Suscripción reactivada exitosamente!' });
    }

    await Newsletter.create({ email });
    res.status(201).json({ message: '¡Suscripción exitosa! Recibirás nuestras novedades.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al suscribirse', error: error.message });
  }
};

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/newsletter/:email
// @access  Public
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const sub = await Newsletter.findOne({ email: req.params.email });
    if (!sub) return res.status(404).json({ message: 'Email no encontrado' });

    sub.isActive = false;
    await sub.save();
    res.json({ message: 'Suscripción cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
