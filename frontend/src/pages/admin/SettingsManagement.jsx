import { useState, useEffect } from 'react';
import {
  Store, Phone, Share2, MessageCircle, DollarSign, Truck, Mail, Search,
  Save, Loader2, RefreshCw, CheckCircle, Eye, EyeOff, Globe, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/productService';

const TABS = [
  { id: 'store', label: 'Tienda', icon: Store },
  { id: 'contact', label: 'Contacto', icon: Phone },
  { id: 'social', label: 'Redes Sociales', icon: Share2 },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'currency', label: 'Moneda y Precios', icon: DollarSign },
  { id: 'shipping', label: 'Envío', icon: Truck },
  { id: 'email', label: 'Email / SMTP', icon: Mail },
  { id: 'seo', label: 'SEO', icon: Search },
];

const SettingsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      setSettings(data);
      setHasChanges(false);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data.settings);
      setHasChanges(false);
      toast.success('¡Configuración guardada exitosamente!');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Configuración</h1>
          <p className="text-gray-500 mt-1">Personaliza tu tienda sin tocar código</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSettings} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <RefreshCw size={16} /> Recargar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-lg hover:from-primary-600 hover:to-orange-600 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-2 sticky top-24">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {hasChanges && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              <Info size={16} className="inline mr-1" />
              Tienes cambios sin guardar
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-md p-8">
            {activeTab === 'store' && <StoreTab settings={settings} onChange={handleChange} />}
            {activeTab === 'contact' && <ContactTab settings={settings} onChange={handleChange} />}
            {activeTab === 'social' && <SocialTab settings={settings} onChange={handleChange} />}
            {activeTab === 'whatsapp' && <WhatsAppTab settings={settings} onChange={handleChange} />}
            {activeTab === 'currency' && <CurrencyTab settings={settings} onChange={handleChange} />}
            {activeTab === 'shipping' && <ShippingTab settings={settings} onChange={handleChange} />}
            {activeTab === 'email' && <EmailTab settings={settings} onChange={handleChange} showPass={showSmtpPass} togglePass={() => setShowSmtpPass(!showSmtpPass)} />}
            {activeTab === 'seo' && <SeoTab settings={settings} onChange={handleChange} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// === COMPONENTE REUTILIZABLE ===
const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', ...props }) => (
  <input
    type={type}
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
    {...props}
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
  />
);

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6 pb-4 border-b border-gray-200">
    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
      {Icon && <Icon size={22} className="text-primary-500" />}
      {title}
    </h2>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

// === TABS ===

const StoreTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={Store} title="Información de la Tienda" subtitle="Datos básicos que se muestran en toda la web" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Nombre de la Tienda" hint="Se muestra en el header, footer, emails y SEO">
        <Input value={settings.storeName} onChange={v => onChange('storeName', v)} placeholder="LuxeShop" />
      </Field>
      <Field label="Slogan" hint="Frase corta debajo del nombre">
        <Input value={settings.storeSlogan} onChange={v => onChange('storeSlogan', v)} placeholder="Calidad garantizada..." />
      </Field>
      <div className="md:col-span-2">
        <Field label="Descripción de la Tienda" hint="Aparece en el footer y meta descripción">
          <Textarea value={settings.storeDescription} onChange={v => onChange('storeDescription', v)} placeholder="Tu tienda de moda premium..." />
        </Field>
      </div>
      <Field label="URL del Logo" hint="URL de la imagen del logo (o sube a /api/upload)">
        <Input value={settings.storeLogo} onChange={v => onChange('storeLogo', v)} placeholder="https://..." />
      </Field>
      <Field label="Texto de Copyright" hint="Déjalo vacío para usar el nombre de la tienda automáticamente">
        <Input value={settings.copyrightText} onChange={v => onChange('copyrightText', v)} placeholder="© 2026 LuxeShop" />
      </Field>
      <Field label="Nombre del Desarrollador">
        <Input value={settings.developerName} onChange={v => onChange('developerName', v)} placeholder="Andy Rosado" />
      </Field>
      <Field label="URL del Desarrollador">
        <Input value={settings.developerUrl} onChange={v => onChange('developerUrl', v)} placeholder="https://andyrosado.dev" />
      </Field>
    </div>
  </div>
);

const ContactTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={Phone} title="Datos de Contacto" subtitle="Información mostrada en el footer y página de contacto" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Teléfono" hint="Formato: +1 (809) 555-1234">
        <Input value={settings.contactPhone} onChange={v => onChange('contactPhone', v)} placeholder="+1 (809) 555-1234" />
      </Field>
      <Field label="Email de Contacto">
        <Input value={settings.contactEmail} onChange={v => onChange('contactEmail', v)} placeholder="info@luxeshop.com" type="email" />
      </Field>
      <Field label="Dirección Corta" hint="Se muestra en el footer">
        <Input value={settings.contactAddress} onChange={v => onChange('contactAddress', v)} placeholder="Santo Domingo, RD" />
      </Field>
      <Field label="Dirección Completa" hint="Se muestra en la página de contacto">
        <Input value={settings.contactAddressFull} onChange={v => onChange('contactAddressFull', v)} placeholder="Av. Abraham Lincoln #505" />
      </Field>
      <div className="md:col-span-2">
        <Field label="Horario de Atención">
          <Input value={settings.businessHours} onChange={v => onChange('businessHours', v)} placeholder="Lun - Sáb: 9am - 7pm | Dom: 10am - 4pm" />
        </Field>
      </div>
    </div>
  </div>
);

const SocialTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={Share2} title="Redes Sociales" subtitle="URLs de tus perfiles sociales (déjalas vacías para ocultar el ícono)" />
    <div className="grid grid-cols-1 gap-5">
      <Field label="Facebook">
        <Input value={settings.socialFacebook} onChange={v => onChange('socialFacebook', v)} placeholder="https://facebook.com/luxeshop" />
      </Field>
      <Field label="Instagram">
        <Input value={settings.socialInstagram} onChange={v => onChange('socialInstagram', v)} placeholder="https://instagram.com/luxeshop" />
      </Field>
      <Field label="Twitter / X">
        <Input value={settings.socialTwitter} onChange={v => onChange('socialTwitter', v)} placeholder="https://x.com/luxeshop" />
      </Field>
      <Field label="TikTok">
        <Input value={settings.socialTiktok} onChange={v => onChange('socialTiktok', v)} placeholder="https://tiktok.com/@luxeshop" />
      </Field>
      <Field label="YouTube">
        <Input value={settings.socialYoutube} onChange={v => onChange('socialYoutube', v)} placeholder="https://youtube.com/@luxeshop" />
      </Field>
    </div>
  </div>
);

const WhatsAppTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={MessageCircle} title="Widget de WhatsApp" subtitle="Configura el botón de WhatsApp que aparece en toda la web" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Número de WhatsApp" hint="Formato internacional sin + ni espacios: 18095551234">
        <Input value={settings.whatsappNumber} onChange={v => onChange('whatsappNumber', v)} placeholder="18095551234" />
      </Field>
      <Field label="Activar Widget">
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => onChange('whatsappEnabled', !settings.whatsappEnabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
              settings.whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className="text-sm text-gray-600">
            {settings.whatsappEnabled ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      </Field>
      <div className="md:col-span-2">
        <Field label="Mensaje por Defecto" hint="Mensaje que se pre-llena al abrir el chat">
          <Textarea value={settings.whatsappMessage} onChange={v => onChange('whatsappMessage', v)} placeholder="¡Hola! Necesito información..." rows={2} />
        </Field>
      </div>
    </div>

    {/* Preview */}
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
      <p className="text-sm font-medium text-green-700 mb-2">Vista previa del enlace:</p>
      <code className="text-xs text-green-800 break-all">
        https://wa.me/{settings.whatsappNumber}?text={encodeURIComponent(settings.whatsappMessage || '')}
      </code>
    </div>
  </div>
);

const CurrencyTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={DollarSign} title="Moneda y Precios" subtitle="Configura la tasa de cambio, impuestos y formato de moneda" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Tasa de Cambio (1 USD = ? RD$)" hint="Actualiza según el mercado. Afecta todos los precios mostrados.">
        <Input type="number" value={settings.exchangeRate} onChange={v => onChange('exchangeRate', parseFloat(v) || 0)} placeholder="58.50" step="0.01" />
      </Field>
      <Field label="Impuesto (decimal)" hint="0.18 = 18%. Se aplica en el checkout.">
        <Input type="number" value={settings.taxRate} onChange={v => onChange('taxRate', parseFloat(v) || 0)} placeholder="0.18" step="0.01" />
      </Field>
      <Field label="Nombre del Impuesto" hint="Se muestra en el resumen de la orden">
        <Input value={settings.taxName} onChange={v => onChange('taxName', v)} placeholder="ITBIS" />
      </Field>
      <Field label="Moneda Principal">
        <Input value={settings.currencyMain} onChange={v => onChange('currencyMain', v)} placeholder="RD$" />
      </Field>
      <Field label="Moneda Secundaria">
        <Input value={settings.currencySecondary} onChange={v => onChange('currencySecondary', v)} placeholder="USD" />
      </Field>
    </div>

    {/* Preview */}
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <p className="text-sm font-medium text-blue-700 mb-2">Vista previa de precios:</p>
      <p className="text-sm text-blue-800">
        Producto de $100 USD → <strong>RD$ {(100 * (settings.exchangeRate || 58.50)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong> (USD $100.00)
      </p>
      <p className="text-sm text-blue-800 mt-1">
        Impuesto ({settings.taxName || 'ITBIS'} {((settings.taxRate || 0.18) * 100).toFixed(0)}%): <strong>RD$ {(100 * (settings.exchangeRate || 58.50) * (settings.taxRate || 0.18)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong>
      </p>
    </div>
  </div>
);

const ShippingTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={Truck} title="Configuración de Envío" subtitle="Define los costos y umbrales de envío" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Envío Gratis desde (USD)" hint="Compras iguales o mayores a este monto tienen envío gratis">
        <Input type="number" value={settings.freeShippingThreshold} onChange={v => onChange('freeShippingThreshold', parseFloat(v) || 0)} placeholder="50" step="1" />
      </Field>
      <Field label="Costo de Envío Plano (USD)" hint="Se cobra cuando no se alcanza el umbral de envío gratis">
        <Input type="number" value={settings.flatShippingCost} onChange={v => onChange('flatShippingCost', parseFloat(v) || 0)} placeholder="10" step="1" />
      </Field>
      <Field label="País por Defecto">
        <Input value={settings.defaultCountry} onChange={v => onChange('defaultCountry', v)} placeholder="República Dominicana" />
      </Field>
    </div>

    {/* Preview */}
    <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
      <p className="text-sm font-medium text-purple-700 mb-2">Resumen:</p>
      <p className="text-sm text-purple-800">
        📦 Envío gratis en compras mayores a <strong>RD$ {((settings.freeShippingThreshold || 50) * (settings.exchangeRate || 58.50)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong> (USD ${(settings.freeShippingThreshold || 50).toFixed(2)})
      </p>
      <p className="text-sm text-purple-800 mt-1">
        🚚 Costo de envío: <strong>RD$ {((settings.flatShippingCost || 10) * (settings.exchangeRate || 58.50)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong> (USD ${(settings.flatShippingCost || 10).toFixed(2)})
      </p>
    </div>
  </div>
);

const EmailTab = ({ settings, onChange, showPass, togglePass }) => (
  <div>
    <SectionTitle icon={Mail} title="Configuración de Email" subtitle="SMTP para envío de correos transaccionales (confirmaciones, recuperación, etc.)" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Field label="Email Remitente (From)">
        <Input value={settings.emailFrom} onChange={v => onChange('emailFrom', v)} placeholder="noreply@luxeshop.com" type="email" />
      </Field>
      <Field label="Nombre del Remitente">
        <Input value={settings.emailFromName} onChange={v => onChange('emailFromName', v)} placeholder="LuxeShop" />
      </Field>
      <Field label="Servidor SMTP" hint="Ej: smtp.gmail.com, smtp.hostinger.com">
        <Input value={settings.smtpHost} onChange={v => onChange('smtpHost', v)} placeholder="smtp.gmail.com" />
      </Field>
      <Field label="Puerto SMTP" hint="587 (TLS) o 465 (SSL)">
        <Input type="number" value={settings.smtpPort} onChange={v => onChange('smtpPort', parseInt(v) || 587)} placeholder="587" />
      </Field>
      <Field label="Usuario SMTP">
        <Input value={settings.smtpUser} onChange={v => onChange('smtpUser', v)} placeholder="tu-email@gmail.com" />
      </Field>
      <Field label="Contraseña SMTP">
        <div className="relative">
          <Input
            type={showPass ? 'text' : 'password'}
            value={settings.smtpPass}
            onChange={v => onChange('smtpPass', v)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={togglePass}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
    </div>

    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <p className="text-sm text-yellow-700">
        <strong>💡 Nota:</strong> Si usas Gmail, necesitas crear una "Contraseña de aplicación" en tu cuenta de Google.
        Los cambios de SMTP requieren reiniciar el servidor backend.
      </p>
    </div>
  </div>
);

const SeoTab = ({ settings, onChange }) => (
  <div>
    <SectionTitle icon={Globe} title="SEO y Analítica" subtitle="Optimiza cómo aparece tu tienda en Google y redes sociales" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <Field label="Título del Sitio (SEO)" hint="Aparece en la pestaña del navegador y resultados de Google">
          <Input value={settings.seoTitle} onChange={v => onChange('seoTitle', v)} placeholder="LuxeShop - Moda Premium" />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Meta Descripción" hint="Descripción que muestra Google (máx. 160 caracteres)">
          <Textarea value={settings.seoDescription} onChange={v => onChange('seoDescription', v)} placeholder="Descubre las últimas tendencias..." rows={2} />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {(settings.seoDescription || '').length}/160 caracteres
          </div>
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Palabras Clave" hint="Separadas por coma">
          <Input value={settings.seoKeywords} onChange={v => onChange('seoKeywords', v)} placeholder="moda, ropa, premium..." />
        </Field>
      </div>
      <Field label="URL del Sitio" hint="URL pública donde está alojada la tienda">
        <Input value={settings.siteUrl} onChange={v => onChange('siteUrl', v)} placeholder="https://luxeshop.com" />
      </Field>
      <Field label="Google Analytics ID" hint="Formato: G-XXXXXXXXXX">
        <Input value={settings.googleAnalyticsId} onChange={v => onChange('googleAnalyticsId', v)} placeholder="G-XXXXXXXXXX" />
      </Field>
    </div>

    {/* Preview */}
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <p className="text-sm font-medium text-gray-700 mb-3">Vista previa en Google:</p>
      <div className="bg-white border rounded-lg p-4 max-w-lg">
        <p className="text-blue-700 text-lg font-medium truncate">{settings.seoTitle || 'LuxeShop - Moda Premium'}</p>
        <p className="text-green-700 text-sm truncate">{settings.siteUrl || 'https://luxeshop.com'}</p>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{settings.seoDescription || 'Descubre las últimas tendencias en moda premium.'}</p>
      </div>
    </div>
  </div>
);

export default SettingsManagement;
