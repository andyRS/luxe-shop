import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import api from '../services/productService';
import useSettingsStore from '../store/settingsStore';
import toast from 'react-hot-toast';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const settings = useSettingsStore(s => s.settings);

  const storeName = settings?.storeName || 'LuxeShop';
  const storeDescription = settings?.storeDescription || 'Tu tienda de moda premium con las últimas tendencias y estilos únicos.';
  const contactPhone = settings?.contactPhone || '+1 (809) 555-1234';
  const contactEmail = settings?.contactEmail || 'info@luxeshop.com';
  const contactAddress = settings?.contactAddress || 'Santo Domingo, República Dominicana';
  const socialFacebook = settings?.socialFacebook || '';
  const socialInstagram = settings?.socialInstagram || '';
  const socialTwitter = settings?.socialTwitter || '';
  const developerName = settings?.developerName || 'Andy Rosado';
  const developerUrl = settings?.developerUrl || 'https://andyrosado.dev';
  const copyrightText = settings?.copyrightText || '';

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribing(true);
    try {
      await api.post('/newsletter', { email: newsletterEmail });
      toast.success('¡Suscrito al newsletter exitosamente!');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al suscribirse');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Columna 1: Sobre Nosotros */}
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              {storeName.toUpperCase()}
            </h3>
            <p className="text-sm mb-4">
              {storeDescription}
            </p>
            <div className="flex gap-4">
              {socialFacebook && (
                <a href={socialFacebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {socialInstagram && (
                <a href={socialInstagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {socialTwitter && (
                <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                  <Twitter size={20} />
                </a>
              )}
              {!socialFacebook && !socialInstagram && !socialTwitter && (
                <>
                  <span className="hover:text-primary-500 transition-colors cursor-pointer"><Facebook size={20} /></span>
                  <span className="hover:text-primary-500 transition-colors cursor-pointer"><Instagram size={20} /></span>
                  <span className="hover:text-primary-500 transition-colors cursor-pointer"><Twitter size={20} /></span>
                </>
              )}
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/productos" className="hover:text-primary-500 transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="hover:text-primary-500 transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link to="/ofertas" className="hover:text-primary-500 transition-colors">
                  Ofertas Especiales
                </Link>
              </li>
              <li>
                <Link to="/nueva-coleccion" className="hover:text-primary-500 transition-colors">
                  Nueva Colección
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al Cliente */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Atención al Cliente
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/mi-cuenta" className="hover:text-primary-500 transition-colors">
                  Mi Cuenta
                </Link>
              </li>
              <li>
                <Link to="/seguimiento-pedido" className="hover:text-primary-500 transition-colors">
                  Seguimiento de Pedido
                </Link>
              </li>
              <li>
                <Link to="/politica-devoluciones" className="hover:text-primary-500 transition-colors">
                  Política de Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="hover:text-primary-500 transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/terminos-condiciones" className="hover:text-primary-500 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary-500 flex-shrink-0 mt-1" />
                <span className="text-sm">
                  {contactAddress}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary-500" />
                <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`} className="text-sm hover:text-primary-500 transition-colors">
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary-500" />
                <a href={`mailto:${contactEmail}`} className="text-sm hover:text-primary-500 transition-colors">
                  {contactEmail}
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm mb-2">Suscríbete a nuestro newsletter</p>
              <form className="flex" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  placeholder="Tu email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-l-lg text-gray-900 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-r-lg transition-colors disabled:opacity-50"
                >
                  {subscribing ? '...' : 'Enviar'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h4 className="text-center text-sm font-semibold text-white mb-4">
            Métodos de Pago Aceptados
          </h4>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="bg-white px-4 py-2 rounded">
              <span className="text-gray-900 font-semibold">VISA</span>
            </div>
            <div className="bg-white px-4 py-2 rounded">
              <span className="text-gray-900 font-semibold">Mastercard</span>
            </div>
            <div className="bg-white px-4 py-2 rounded">
              <span className="text-gray-900 font-semibold">PayPal</span>
            </div>
            <div className="bg-white px-4 py-2 rounded">
              <span className="text-gray-900 font-semibold">Stripe</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm">
            {copyrightText || `\u00A9 ${currentYear} ${storeName}. Todos los derechos reservados.`}
          </p>
          <p className="text-sm mt-2">
            Desarrollado por{' '}
            <a 
              href={developerUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 font-semibold"
            >
              {developerName}
            </a>
            {' '}- Desarrollador Web
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
