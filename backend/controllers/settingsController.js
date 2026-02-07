import StoreSettings from '../models/StoreSettings.js';

// @desc    Obtener configuración de la tienda (público)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.getSettings();
    
    // Para peticiones públicas, ocultar datos sensibles
    const publicSettings = settings.toObject();
    delete publicSettings.smtpHost;
    delete publicSettings.smtpPort;
    delete publicSettings.smtpUser;
    delete publicSettings.smtpPass;
    delete publicSettings.__v;
    
    res.json(publicSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
  }
};

// @desc    Obtener TODAS las configuraciones (admin)
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
  }
};

// @desc    Actualizar configuración
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.getSettings();

    // Campos permitidos para actualizar
    const allowedFields = [
      'storeName', 'storeDescription', 'storeLogo', 'storeSlogan', 'copyrightText',
      'developerName', 'developerUrl',
      'contactPhone', 'contactEmail', 'contactAddress', 'contactAddressFull', 'businessHours',
      'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialTiktok', 'socialYoutube',
      'whatsappNumber', 'whatsappMessage', 'whatsappEnabled',
      'exchangeRate', 'taxRate', 'taxName', 'currencyMain', 'currencySecondary',
      'freeShippingThreshold', 'flatShippingCost', 'defaultCountry',
      'emailFrom', 'emailFromName', 'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass',
      'seoTitle', 'seoDescription', 'seoKeywords', 'siteUrl', 'googleAnalyticsId',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json({ message: 'Configuración actualizada exitosamente', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar configuración', error: error.message });
  }
};
