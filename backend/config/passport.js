import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Configuración de Google OAuth Strategy
const configurePassport = () => {
  // Solo configurar Google Strategy si las credenciales están disponibles
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Buscar usuario existente por googleId o email
            let user = await User.findOne({
              $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
              ]
            });

            if (user) {
              // Si el usuario existe pero no tiene googleId, actualizarlo
              if (!user.googleId) {
                user.googleId = profile.id;
                user.avatar = user.avatar || profile.photos[0]?.value;
                await user.save();
              }
              return done(null, user);
            }

            // Crear nuevo usuario
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0]?.value,
              password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12), // Password aleatorio
              isVerified: true // Google ya verificó el email
            });

            return done(null, user);
          } catch (error) {
            console.error('Error en Google Strategy:', error);
            return done(error, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth configurado correctamente');
  } else {
    console.log('⚠️ Google OAuth no configurado - faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET');
  }

  // Serialización para sesiones (aunque usamos JWT, lo necesitamos para el flujo)
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
