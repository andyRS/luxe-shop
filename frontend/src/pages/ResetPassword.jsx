import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña Actualizada!</h2>
              <p className="text-gray-600 mb-6">
                Tu contraseña ha sido restablecida correctamente. Redirigiendo al login...
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Ir al Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="text-primary-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva Contraseña</h2>
                <p className="text-gray-600">Ingresa tu nueva contraseña.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-primary-500 hover:text-primary-600 text-sm">
                  Volver al Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
