import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  
  // Obtener la URL de redirección
  const from = location.state?.from?.pathname || '/';
  const isFromCheckout = from === '/checkout';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Manejar errores de Google OAuth en URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'google_not_configured') {
        toast.error('Google OAuth no está configurado en el servidor. Por favor, usa tu email y contraseña.');
      } else if (errorParam === 'google_auth_failed') {
        toast.error('Error al autenticar con Google. Intenta nuevamente.');
      }
    }
  }, [searchParams]);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      const { token, ...userData } = response;
      const user = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar
      };
      
      login(user, token);
      localStorage.setItem('token', token);
      
      toast.success(`¡Bienvenido, ${user.name}!`, {
        icon: '👋',
        duration: 2000
      });
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
      
    } catch (error) {
      console.error('Error de login:', error);
      const message = error.response?.data?.message || 'Email o contraseña incorrectos';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Guardar la ruta de redirección en sessionStorage
      sessionStorage.setItem('authRedirect', from);
      // Redirigir al endpoint de Google OAuth del backend
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      console.error('Error con Google:', error);
      toast.error('Error al conectar con Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-4xl font-display font-bold text-gradient hover:scale-105 transition-transform">
            <ShoppingBag className="text-purple-600" size={36} />
            LUXESHOP
          </Link>
          <div className="mt-6 space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              {isFromCheckout ? 'Continúa tu compra' : 'Bienvenido de nuevo'}
              <Sparkles className="text-yellow-500" size={24} />
            </h2>
            <p className="text-gray-600 text-lg">
              {isFromCheckout 
                ? 'Inicia sesión para completar tu pedido'
                : 'Inicia sesión y continúa tu experiencia de compra'
              }
            </p>
          </div>
        </div>

        {/* Mensaje si viene del checkout */}
        {isFromCheckout && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-orange-800 font-semibold">Tu carrito te espera</p>
              <p className="text-orange-600 text-sm mt-1">
                Inicia sesión o{' '}
                <Link to="/registro" state={{ from: location.state?.from }} className="underline font-semibold hover:text-orange-700">
                  crea una cuenta
                </Link>{' '}
                para finalizar tu compra.
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Error general */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">{errors.general}</span>
            </div>
          )}

          {/* Botón de Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 group"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>Continuar con Google</span>
          </button>

          {/* Divisor */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">o con tu email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-500'}`} size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/10'
                  }`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <Link to="/olvide-contrasena" className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-purple-500'}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all bg-white ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/10'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Recordar mi sesión</span>
              </label>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/registro" 
                state={{ from: location.state?.from }}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
              >
                Crear cuenta gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Beneficios */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/70 backdrop-blur rounded-xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="text-purple-600" size={18} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Compra segura</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="text-orange-600" size={18} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Ofertas exclusivas</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-4 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="text-green-600" size={18} />
            </div>
            <p className="text-xs text-gray-600 font-medium">Datos protegidos</p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔐</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900 mb-2">
                Credenciales de Prueba
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="font-semibold mb-1">👔 Admin:</p>
                  <p>admin@luxeshop.com</p>
                  <p>admin123</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="font-semibold mb-1">👤 Usuario:</p>
                  <p>maria@example.com</p>
                  <p>maria123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
