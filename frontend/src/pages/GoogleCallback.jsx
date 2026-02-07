import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const processGoogleAuth = () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Error al iniciar sesión con Google. Intenta nuevamente.');
        navigate('/login');
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Guardar en el store y localStorage
          login(user, token);
          localStorage.setItem('token', token);
          
          // Obtener la ruta de redirección guardada
          const redirectTo = sessionStorage.getItem('authRedirect') || '/';
          sessionStorage.removeItem('authRedirect');
          
          toast.success(`¡Bienvenido, ${user.name}!`);
          
          // Pequeño delay para que el store se actualice
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 100);
          
        } catch (error) {
          console.error('Error parsing user data:', error);
          toast.error('Error al procesar los datos de Google');
          navigate('/login');
        }
      } else {
        toast.error('No se recibieron los datos de autenticación');
        navigate('/login');
      }
    };

    processGoogleAuth();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-4xl font-display font-bold text-gradient mb-8">
          <ShoppingBag className="text-orange-600" size={36} />
          LUXESHOP
        </div>
        
        <div className="flex items-center justify-center gap-3 text-gray-700">
          <Loader2 className="animate-spin text-orange-500" size={24} />
          <span className="text-lg">Completando inicio de sesión con Google...</span>
        </div>
        
        <p className="mt-4 text-gray-500 text-sm">
          Por favor espera un momento
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
