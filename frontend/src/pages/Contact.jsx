import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Facebook, Twitter, CheckCircle } from 'lucide-react';
import api from '../services/productService';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', formData);
      setSent(true);
      toast.success('¡Mensaje enviado exitosamente!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: Phone, title: 'Teléfono', detail: '+1 (809) 555-0123', sub: 'Lun - Sáb: 9am - 7pm', color: 'from-purple-500 to-purple-600' },
    { icon: Mail, title: 'Email', detail: 'info@luxeshop.com', sub: 'Respondemos en 24h', color: 'from-primary-500 to-primary-600' },
    { icon: MapPin, title: 'Ubicación', detail: 'Av. Abraham Lincoln #505', sub: 'Santo Domingo, Rep. Dom.', color: 'from-pink-500 to-pink-600' },
    { icon: Clock, title: 'Horario', detail: 'Lun - Sáb: 9am - 7pm', sub: 'Dom: 10am - 4pm', color: 'from-indigo-500 to-indigo-600' },
  ];

  const faqs = [
    { q: '¿Cuánto tarda el envío?', a: 'Los envíos dentro de Santo Domingo se realizan en 24-48 horas. Para el interior del país, de 2 a 5 días hábiles.' },
    { q: '¿Cuál es la política de devoluciones?', a: 'Aceptamos devoluciones hasta 15 días después de la compra. El producto debe estar en su estado original con etiquetas.' },
    { q: '¿Tienen tienda física?', a: 'Sí, nos encontramos en la Av. Abraham Lincoln #505, Santo Domingo. ¡Ven a visitarnos!' },
    { q: '¿Realizan envíos internacionales?', a: 'Actualmente realizamos envíos a todo el territorio dominicano. Próximamente habilitaremos envíos internacionales.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              💬 Estamos para ayudarte
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Contáctanos
            </h1>
            <p className="text-lg md:text-xl text-purple-200 leading-relaxed">
              ¿Tienes alguna pregunta o necesitas ayuda? Nuestro equipo está listo para atenderte. 
              Escríbenos y te responderemos lo antes posible.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Contact Info Cards */}
      <section className="container-custom -mt-8 relative z-20 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map((info, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <info.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{info.title}</h3>
              <p className="text-gray-800 font-medium">{info.detail}</p>
              <p className="text-sm text-gray-500 mt-1">{info.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map Section */}
      <section className="container-custom mb-20">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">Envíanos un Mensaje</h2>
                <p className="text-gray-600">Completa el formulario y te responderemos pronto.</p>
              </div>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-green-500" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-gray-600">Te responderemos en las próximas 24 horas.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (809) 000-0000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Asunto</label>
                      <select name="subject" value={formData.subject} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700">
                        <option value="">Selecciona un tema</option>
                        <option value="consulta">Consulta general</option>
                        <option value="pedido">Sobre un pedido</option>
                        <option value="devolucion">Devolución o cambio</option>
                        <option value="mayoreo">Compras al por mayor</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mensaje *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Escribe tu mensaje aquí..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none placeholder-gray-400" />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full bg-gradient-to-r from-purple-600 to-primary-500 hover:from-purple-700 hover:to-primary-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {sending ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Enviando...</>
                    ) : (
                      <><Send size={20} /> Enviar Mensaje</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Map + Social */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-purple-100 to-primary-100 relative">
                <iframe
                  title="Ubicación LuxeShop"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.0459!2d-69.9388!3d18.4655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDI3JzU2LjAiTiA2OcKwNTYnMTkuNyJX!5e0!3m2!1ses!2sdo!4v1234567890"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                  className="absolute inset-0"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-1">Nuestra Tienda</h3>
                <p className="text-sm text-gray-600">Av. Abraham Lincoln #505, Piantini, Santo Domingo, Rep. Dom.</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Síguenos en Redes</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-purple-50 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Instagram className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">@luxeshop_rd</p>
                    <p className="text-xs text-gray-500">12.5K seguidores</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <Facebook className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">LuxeShop RD</p>
                    <p className="text-xs text-gray-500">8.2K seguidores</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-sky-50 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center">
                    <Twitter className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-sky-500 transition-colors">@luxeshop_rd</p>
                    <p className="text-xs text-gray-500">3.1K seguidores</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 p-3 rounded-xl hover:bg-green-50 transition-colors group">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">WhatsApp</p>
                    <p className="text-xs text-gray-500">Chat directo</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="bg-gradient-to-br from-purple-600 to-primary-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-xl mb-2">¿Necesitas ayuda inmediata?</h3>
              <p className="text-purple-100 text-sm mb-4">Llámanos o escríbenos por WhatsApp y te atenderemos al instante.</p>
              <div className="flex gap-3">
                <a href="tel:+18095550123" className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 rounded-xl text-center text-sm transition-all">
                  📞 Llamar
                </a>
                <a href="https://wa.me/18095550123" target="_blank" rel="noopener noreferrer"
                  className="flex-1 bg-white text-purple-600 font-semibold py-3 rounded-xl text-center text-sm hover:bg-purple-50 transition-all">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">Preguntas Frecuentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Encuentra respuestas a las preguntas más comunes de nuestros clientes.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 hover:bg-purple-50 transition-colors group">
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{faq.q}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
