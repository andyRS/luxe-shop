import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    // === INFORMACIÓN DE LA TIENDA ===
    storeName: { type: String, default: 'LuxeShop' },
    storeDescription: { type: String, default: 'Tu tienda de moda premium con las últimas tendencias y estilos únicos.' },
    storeLogo: { type: String, default: '' },
    storeSlogan: { type: String, default: 'Calidad garantizada y servicio excepcional.' },
    copyrightText: { type: String, default: '' },
    developerName: { type: String, default: 'Andy Rosado' },
    developerUrl: { type: String, default: 'https://andyrosado.dev' },

    // === CONTACTO ===
    contactPhone: { type: String, default: '+1 (809) 555-1234' },
    contactEmail: { type: String, default: 'info@luxeshop.com' },
    contactAddress: { type: String, default: 'Santo Domingo, República Dominicana' },
    contactAddressFull: { type: String, default: 'Av. Abraham Lincoln #505, Santo Domingo' },
    businessHours: { type: String, default: 'Lun - Sáb: 9am - 7pm | Dom: 10am - 4pm' },

    // === REDES SOCIALES ===
    socialFacebook: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
    socialTwitter: { type: String, default: '' },
    socialTiktok: { type: String, default: '' },
    socialYoutube: { type: String, default: '' },

    // === WHATSAPP ===
    whatsappNumber: { type: String, default: '18095551234' },
    whatsappMessage: { type: String, default: '¡Hola! Necesito información sobre LuxeShop' },
    whatsappEnabled: { type: Boolean, default: true },

    // === MONEDA Y PRECIOS ===
    exchangeRate: { type: Number, default: 58.50 },
    taxRate: { type: Number, default: 0.18 },
    taxName: { type: String, default: 'ITBIS' },
    currencyMain: { type: String, default: 'RD$' },
    currencySecondary: { type: String, default: 'USD' },

    // === ENVÍO ===
    freeShippingThreshold: { type: Number, default: 50 },
    flatShippingCost: { type: Number, default: 10 },
    defaultCountry: { type: String, default: 'República Dominicana' },

    // === EMAIL ===
    emailFrom: { type: String, default: 'noreply@luxeshop.com' },
    emailFromName: { type: String, default: 'LuxeShop' },
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },

    // === SEO ===
    seoTitle: { type: String, default: 'LuxeShop - Moda Premium' },
    seoDescription: { type: String, default: 'Descubre las últimas tendencias en moda premium. Envío gratis en compras mayores a RD$ 2,925.' },
    seoKeywords: { type: String, default: 'moda, ropa, premium, República Dominicana, tienda online' },
    siteUrl: { type: String, default: 'https://luxeshop.com' },
    googleAnalyticsId: { type: String, default: '' },
  },
  { timestamps: true }
);

// Solo puede haber un documento de settings (singleton)
storeSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

export default StoreSettings;
