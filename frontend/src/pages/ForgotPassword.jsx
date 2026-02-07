import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Email enviado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Email Enviado!</h2>
              <p className="text-gray-600 mb-6">
                Revisa tu bandeja de entrada. Te enviamos instrucciones para restablecer tu contraseña.
              </p>
              <Link to="/login" className="btn-primary inline-block">
                Volver al Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-primary-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-gray-600">
                  Ingresa tu email y te enviaremos un enlace para restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input-field"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-primary-500 hover:text-primary-600 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
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

export default ForgotPassword;
