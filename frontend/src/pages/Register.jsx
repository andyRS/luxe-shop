import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, ShoppingBag, Sparkles, Gift, ArrowRight, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  
  // Detectar si viene del checkout
  const from = location.state?.from?.pathname || '/';
  const isFromCheckout = from === '/checkout' || from.includes('checkout');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleGoogleRegister = () => {
    // Guardar la ruta de redirección antes de ir a Google
    sessionStorage.setItem('authRedirect', from);
    // Redirigir al backend para OAuth con Google
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      // Llamar al backend real
      const response = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      });
      
      // El backend devuelve: { _id, name, email, role, token }
      const { token, ...userData } = response;
      const user = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      };
      
      // Guardar en el store y localStorage
      login(user, token);
      localStorage.setItem('token', token);
      
      toast.success('¡Cuenta creada exitosamente! Bienvenido a LuxeShop');
      
      // Redirigir a donde venía (checkout) o al home
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error('Error de registro:', error);
      const message = error.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.';
      toast.error(message);
      
      // Si el email ya existe
      if (message.toLowerCase().includes('existe') || message.toLowerCase().includes('already')) {
        setErrors({ ...errors, email: 'Este email ya está registrado' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-4xl font-display font-bold text-gradient hover:scale-105 transition-transform">
            <ShoppingBag className="text-orange-600" size={36} />
            LUXESHOP
          </Link>
          <div className="mt-6 space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              Crea tu cuenta
              <Gift className="text-orange-500" size={28} />
            </h2>
            <p className="text-gray-600 text-lg">
              Únete y disfruta de beneficios exclusivos
            </p>
          </div>
          
          {/* Benefits */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <Check size={16} />
              <span>Envío gratis</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Check size={16} />
              <span>Ofertas exclusivas</span>
            </div>
          </div>
        </div>

        {/* Alerta de checkout */}
        {isFromCheckout && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
            <ShoppingCart className="text-orange-500 flex-shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-orange-800 font-semibold">¡Estás a un paso de completar tu compra!</p>
              <p className="text-orange-700 text-sm mt-1">
                Regístrate para continuar con el pago de forma segura.
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Botón de Google primero */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 font-semibold text-gray-700 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-500 font-medium">o con tu email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${errors.name ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none text-gray-700 ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none text-gray-700 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(809) 555-1234"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none text-gray-700 ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none text-gray-700 ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Términos y Condiciones */}
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${errors.terms ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.terms) setErrors({ ...errors, terms: '' });
                }}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
              />
              <label className="text-sm text-gray-700 leading-relaxed">
                Acepto los{' '}
                <Link to="/terminos" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
                  Política de Privacidad
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 flex items-center gap-1 -mt-3">
                <AlertCircle size={14} />
                {errors.terms}
              </p>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>{isFromCheckout ? 'Crear Cuenta y Continuar' : 'Crear Cuenta Gratis'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                state={{ from: location.state?.from }}
                className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Lock size={14} className="text-green-600" />
            <span>Datos seguros</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles size={14} className="text-purple-600" />
            <span>Sin costo</span>
          </div>
          <div className="flex items-center gap-1">
            <Check size={14} className="text-blue-600" />
            <span>Registro rápido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
