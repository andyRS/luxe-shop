import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-display font-bold text-gradient mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Página No Encontrada
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home size={20} />
            Volver al Inicio
          </Link>
          <Link to="/productos" className="btn-outline inline-flex items-center justify-center gap-2">
            <Search size={20} />
            Ver Productos
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="font-semibold text-lg mb-4">Enlaces Útiles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Link to="/" className="text-primary-500 hover:text-primary-600">
              Inicio
            </Link>
            <Link to="/productos" className="text-primary-500 hover:text-primary-600">
              Productos
            </Link>
            <Link to="/ofertas" className="text-primary-500 hover:text-primary-600">
              Ofertas
            </Link>
            <Link to="/contacto" className="text-primary-500 hover:text-primary-600">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
