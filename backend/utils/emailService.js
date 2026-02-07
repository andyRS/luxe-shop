import nodemailer from 'nodemailer';

// Configurar transporter
let transporter;
let etherealPreviewEnabled = false;

const createTransporter = async () => {
  // Si hay configuración SMTP (Gmail, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Email configurado con SMTP:', process.env.SMTP_HOST);
  } else {
    // Configuración de desarrollo con Ethereal (emails de prueba)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      etherealPreviewEnabled = true;
      console.log('📧 Email de prueba configurado. Vista previa disponible en Ethereal.');
    } catch (error) {
      console.log('⚠️ No se pudo configurar email de prueba:', error.message);
    }
  }
};

// Inicializar transporter
createTransporter().catch(console.error);

// Template base de email
const getEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #f0760b, #e15a07); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .footer { background-color: #333; color: #ffffff; padding: 20px; text-align: center; font-size: 12px; }
    .button { display: inline-block; background: linear-gradient(135deg, #f0760b, #e15a07); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 15px 0; }
    .order-box { background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .order-number { font-size: 24px; font-weight: bold; color: #f0760b; }
    .product-item { display: flex; padding: 15px 0; border-bottom: 1px solid #eee; }
    .product-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .status-pending { background-color: #fef3cd; color: #856404; }
    .status-processing { background-color: #cce5ff; color: #004085; }
    .status-shipped { background-color: #d4edda; color: #155724; }
    .status-delivered { background-color: #d1e7dd; color: #0f5132; }
    .total-row { font-size: 18px; font-weight: bold; color: #333; padding-top: 15px; border-top: 2px solid #f0760b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ LuxeShop</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 LuxeShop. Todos los derechos reservados.</p>
      <p>Este email fue enviado automáticamente. Por favor no responda a este mensaje.</p>
      <p><a href="${process.env.FRONTEND_URL}" style="color: #f0760b;">Visita nuestra tienda</a></p>
    </div>
  </div>
</body>
</html>
`;

// Email de confirmación de pedido
export const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    if (!transporter) await createTransporter();

    const itemsHtml = order.items.map(item => `
      <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
        <div style="flex: 1;">
          <strong>${item.name}</strong><br>
          <span style="color: #666;">Cantidad: ${item.quantity} × $${item.price.toFixed(2)}</span>
        </div>
        <div style="font-weight: bold; color: #f0760b;">
          $${(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    `).join('');

    const content = `
      <h2 style="color: #333; margin-bottom: 10px;">¡Gracias por tu compra! 🎉</h2>
      <p style="color: #666; font-size: 16px;">Hemos recibido tu pedido y lo estamos procesando.</p>
      
      <div class="order-box">
        <p style="margin: 0 0 10px 0; color: #666;">Número de orden:</p>
        <p class="order-number">${order.orderNumber}</p>
        <p style="color: #666; margin-top: 10px;">
          Fecha: ${new Date(order.createdAt).toLocaleDateString('es-DO', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          })}
        </p>
      </div>

      <h3 style="color: #333;">Productos:</h3>
      ${itemsHtml}

      <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Subtotal:</span>
          <span>$${order.itemsPrice?.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>ITBIS (18%):</span>
          <span>$${order.taxPrice?.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Envío:</span>
          <span style="color: ${order.shippingPrice === 0 ? '#28a745' : '#333'}">
            ${order.shippingPrice === 0 ? 'GRATIS' : '$' + order.shippingPrice?.toFixed(2)}
          </span>
        </div>
        <div class="total-row" style="display: flex; justify-content: space-between;">
          <span>Total:</span>
          <span style="color: #f0760b;">$${order.totalPrice?.toFixed(2)}</span>
        </div>
      </div>

      <h3 style="color: #333; margin-top: 25px;">Dirección de envío:</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
        <strong>${order.shippingAddress?.name}</strong><br>
        ${order.shippingAddress?.street}<br>
        ${order.shippingAddress?.city}, ${order.shippingAddress?.state}<br>
        ${order.shippingAddress?.country}<br>
        📞 ${order.shippingAddress?.phone}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/orden/${order._id}" class="button">
          Ver Estado del Pedido
        </a>
      </div>

      <p style="color: #666; margin-top: 30px; text-align: center;">
        Te enviaremos un email cuando tu pedido sea enviado.
      </p>
    `;

    const info = await transporter.sendMail({
      from: `"LuxeShop" <${process.env.SMTP_FROM || 'noreply@luxeshop.com'}>`,
      to: userEmail,
      subject: `✅ Pedido Confirmado #${order.orderNumber}`,
      html: getEmailTemplate(content, 'Pedido Confirmado'),
    });

    console.log('📧 Email de confirmación enviado:', info.messageId);
    
    // En desarrollo, mostrar URL de preview
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    // No lanzar error para no interrumpir el flujo de la orden
  }
};

// Email de actualización de estado
export const sendOrderStatusUpdateEmail = async (order, userEmail, newStatus) => {
  try {
    if (!transporter) await createTransporter();

    const statusInfo = {
      processing: { label: 'En Preparación', emoji: '📦', color: '#007bff', message: 'Estamos preparando tu pedido para el envío.' },
      shipped: { label: 'Enviado', emoji: '🚚', color: '#6f42c1', message: '¡Tu pedido está en camino!' },
      delivered: { label: 'Entregado', emoji: '✅', color: '#28a745', message: '¡Tu pedido ha sido entregado!' },
      cancelled: { label: 'Cancelado', emoji: '❌', color: '#dc3545', message: 'Tu pedido ha sido cancelado.' }
    };

    const status = statusInfo[newStatus] || { label: newStatus, emoji: '📋', color: '#333', message: '' };

    const content = `
      <h2 style="color: #333; margin-bottom: 10px;">Actualización de tu Pedido ${status.emoji}</h2>
      
      <div class="order-box" style="text-align: center;">
        <p style="margin: 0 0 15px 0; color: #666;">Pedido:</p>
        <p class="order-number">${order.orderNumber}</p>
        
        <div style="margin-top: 20px;">
          <span class="status-badge" style="background-color: ${status.color}20; color: ${status.color};">
            ${status.emoji} ${status.label}
          </span>
        </div>
      </div>

      <p style="font-size: 16px; color: #666; text-align: center;">
        ${status.message}
      </p>

      ${newStatus === 'shipped' && order.trackingNumber ? `
        <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #666;">Número de seguimiento:</p>
          <p style="font-size: 20px; font-weight: bold; color: #2e7d32; margin: 0;">
            ${order.trackingNumber}
          </p>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/orden/${order._id}" class="button">
          Ver Detalles del Pedido
        </a>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"LuxeShop" <${process.env.SMTP_FROM || 'noreply@luxeshop.com'}>`,
      to: userEmail,
      subject: `${status.emoji} Tu pedido #${order.orderNumber} - ${status.label}`,
      html: getEmailTemplate(content, `Pedido ${status.label}`),
    });

    console.log('📧 Email de actualización enviado:', info.messageId);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error enviando email de actualización:', error);
  }
};

// Email de reset de contraseña
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    if (!transporter) await createTransporter();

    const content = `
      <h2 style="color: #333; margin-bottom: 10px;">Restablecer Contraseña 🔐</h2>
      <p style="color: #666; font-size: 16px;">Hola <strong>${name}</strong>,</p>
      <p style="color: #666; font-size: 16px;">
        Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">
          Restablecer Contraseña
        </a>
      </div>

      <p style="color: #999; font-size: 14px;">
        Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este email.
      </p>
      <p style="color: #999; font-size: 12px; word-break: break-all;">
        Si el botón no funciona, copia y pega esta URL: ${resetUrl}
      </p>
    `;

    const info = await transporter.sendMail({
      from: `"LuxeShop" <${process.env.SMTP_FROM || 'noreply@luxeshop.com'}>`,
      to: email,
      subject: '🔐 Restablecer Contraseña - LuxeShop',
      html: getEmailTemplate(content, 'Restablecer Contraseña'),
    });

    console.log('📧 Email de reset enviado:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error enviando email de reset:', error);
  }
};

// Email de verificación de email
export const sendVerificationEmail = async (email, name, verifyUrl) => {
  try {
    if (!transporter) await createTransporter();

    const content = `
      <h2 style="color: #333; margin-bottom: 10px;">Verifica tu Email ✉️</h2>
      <p style="color: #666; font-size: 16px;">Hola <strong>${name}</strong>,</p>
      <p style="color: #666; font-size: 16px;">
        Gracias por registrarte en LuxeShop. Por favor verifica tu email haciendo clic en el botón de abajo.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" class="button">
          Verificar Email
        </a>
      </div>

      <p style="color: #999; font-size: 14px;">
        Si no creaste esta cuenta, puedes ignorar este email.
      </p>
    `;

    const info = await transporter.sendMail({
      from: `"LuxeShop" <${process.env.SMTP_FROM || 'noreply@luxeshop.com'}>`,
      to: email,
      subject: '✉️ Verifica tu Email - LuxeShop',
      html: getEmailTemplate(content, 'Verificación de Email'),
    });

    console.log('📧 Email de verificación enviado:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
  }
};

// Email de contacto
export const sendContactEmail = async (contactData) => {
  try {
    if (!transporter) await createTransporter();

    const content = `
      <h2 style="color: #333; margin-bottom: 10px;">Nuevo Mensaje de Contacto 📩</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>Nombre:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        ${contactData.phone ? `<p><strong>Teléfono:</strong> ${contactData.phone}</p>` : ''}
        ${contactData.subject ? `<p><strong>Asunto:</strong> ${contactData.subject}</p>` : ''}
      </div>

      <h3 style="color: #333;">Mensaje:</h3>
      <div style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <p style="color: #666; white-space: pre-wrap;">${contactData.message}</p>
      </div>

      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        Recibido el ${new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    `;

    const info = await transporter.sendMail({
      from: `"LuxeShop Contacto" <${process.env.SMTP_FROM || 'noreply@luxeshop.com'}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'admin@luxeshop.com',
      replyTo: contactData.email,
      subject: `📩 Nuevo Contacto: ${contactData.subject || 'Sin asunto'} - ${contactData.name}`,
      html: getEmailTemplate(content, 'Mensaje de Contacto'),
    });

    console.log('📧 Email de contacto enviado:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Error enviando email de contacto:', error);
  }
};

export default { 
  sendOrderConfirmationEmail, 
  sendOrderStatusUpdateEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendContactEmail
};
