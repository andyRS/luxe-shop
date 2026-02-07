import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useSettingsStore from '../store/settingsStore';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const location = useLocation();
  const settings = useSettingsStore(s => s.settings);

  const phoneNumber = settings?.whatsappNumber || '18095551234';
  const storeName = settings?.storeName || 'LuxeShop';
  const contactPhone = settings?.contactPhone || '+1 (809) 555-1234';
  const whatsappEnabled = settings?.whatsappEnabled !== false;

  // Mensajes predefinidos según la página
  const getAutomaticMessage = () => {
    const path = location.pathname;
    
    if (path.includes('/producto/')) {
      return '¡Hola! Tengo una pregunta sobre este producto';
    } else if (path.includes('/productos')) {
      return '¡Hola! Necesito ayuda para encontrar un producto';
    } else if (path.includes('/carrito') || path.includes('/checkout')) {
      return '¡Hola! Necesito ayuda con mi compra';
    } else if (path.includes('/admin')) {
      return '¡Hola! Necesito soporte técnico con el panel de administración';
    } else {
      return `¡Hola! Necesito información sobre ${storeName}`;
    }
  };

  // Opciones rápidas
  const quickOptions = [
    { id: 1, text: '📦 Información de envío', message: '¡Hola! Quiero saber sobre los tiempos y costos de envío' },
    { id: 2, text: '💳 Métodos de pago', message: '¡Hola! ¿Qué métodos de pago aceptan?' },
    { id: 3, text: '📏 Guía de tallas', message: '¡Hola! Necesito ayuda con las tallas' },
    { id: 4, text: '🔄 Devoluciones', message: '¡Hola! Quiero información sobre devoluciones' },
    { id: 5, text: '📍 Seguimiento de pedido', message: '¡Hola! Quiero rastrear mi pedido' },
    { id: 6, text: '👤 Cuenta de administrador', message: '¡Hola! Necesito ayuda para acceder como administrador' },
  ];

  // Actualizar mensaje automático cuando cambia la página
  useEffect(() => {
    if (!message) {
      setMessage(getAutomaticMessage());
    }
  }, [location]);

  const sendWhatsAppMessage = (customMessage = null) => {
    const finalMessage = customMessage || message || getAutomaticMessage();
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  const handleQuickOption = (optionMessage) => {
    sendWhatsAppMessage(optionMessage);
  };

  if (!whatsappEnabled) return null;

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-in-up">
          {/* Header */}
          <div className="bg-green-500 p-4 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle size={24} className="text-green-500" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-semibold">{storeName}</h3>
                  <p className="text-xs text-green-100">En línea - Respuesta rápida</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-600 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 max-h-96 overflow-y-auto bg-gray-50">
            {/* Mensaje de bienvenida */}
            <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
              <p className="text-sm text-gray-800 mb-2">
                👋 <strong>¡Hola! Bienvenido a {storeName}</strong>
              </p>
              <p className="text-sm text-gray-600">
                ¿En qué podemos ayudarte hoy? Selecciona una opción rápida o escribe tu mensaje:
              </p>
            </div>

            {/* Opciones Rápidas */}
            <div className="space-y-2 mb-4">
              {quickOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleQuickOption(option.message)}
                  className="w-full text-left bg-white hover:bg-green-50 border border-gray-200 rounded-lg p-3 text-sm transition-colors"
                >
                  {option.text}
                </button>
              ))}
            </div>

            {/* Mensaje personalizado */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">O escribe tu mensaje personalizado:</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              />
              <button
                onClick={() => sendWhatsAppMessage()}
                className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Send size={16} />
                Enviar por WhatsApp
              </button>
            </div>

            {/* Info adicional */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                📞 También puedes llamarnos al{' '}
                <a href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`} className="text-green-600 font-semibold">
                  {contactPhone}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 z-50 animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <MessageCircle size={28} />
        )}
        
        {/* Notification Badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-6 right-24 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-slide-in-up whitespace-nowrap">
          ¿Necesitas ayuda? ¡Chatea con nosotros!
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
