import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/emailService.js';

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe con este email' });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || undefined
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario y incluir password
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtener perfil del usuario
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } else {
      res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Callback de Google OAuth
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    // Generar token JWT
    const token = generateToken(user._id);
    
    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Crear datos del usuario para enviar al frontend
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    // Redirigir al frontend con el token y datos del usuario
    const redirectUrl = new URL(`${frontendUrl}/auth/google/callback`);
    redirectUrl.searchParams.append('token', token);
    redirectUrl.searchParams.append('user', JSON.stringify(userData));
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error en Google callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
};

// @desc    Solicitar reset de contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con ese email' });
    }

    // Generar token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save();

    // Enviar email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({ message: 'Se ha enviado un email con instrucciones para restablecer tu contraseña' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restablecer contraseña
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verificar email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
    });

    if (!user) {
      return res.status(400).json({ message: 'Token de verificación inválido' });
    }

    user.isVerified = true;
    user.resetPasswordToken = undefined;
    await user.save();

    res.json({ message: 'Email verificado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
