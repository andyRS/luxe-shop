import PDFDocument from 'pdfkit';

/**
 * Genera una factura PDF para una orden
 * @param {Object} order - Objeto de la orden
 * @param {Object} res - Response object de Express para streaming
 */
export const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ 
    size: 'A4',
    margin: 50,
    info: {
      Title: `Factura ${order.orderNumber}`,
      Author: 'LuxeShop',
      Subject: 'Factura de compra',
    }
  });

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=factura-${order.orderNumber}.pdf`);
  
  // Pipe al response
  doc.pipe(res);

  // Tasa de cambio
  const EXCHANGE_RATE = 58.50;
  const fmtRD = (n) => `RD$ ${(n * EXCHANGE_RATE).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtUSD = (n) => `USD $${Number(n).toFixed(2)}`;

  // Colores
  const primaryColor = '#f0760b';
  const textColor = '#333333';
  const lightGray = '#f5f5f5';

  // === HEADER ===
  // Logo/Nombre de la empresa
  doc.fontSize(28)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('LUXESHOP', 50, 50);
  
  doc.fontSize(10)
     .fillColor('#666')
     .font('Helvetica')
     .text('Tienda de Moda Premium', 50, 82);

  // Información de la empresa (derecha)
  doc.fontSize(9)
     .fillColor(textColor)
     .text('LuxeShop RD', 400, 50, { align: 'right' })
     .text('Santo Domingo, República Dominicana', { align: 'right' })
     .text('Tel: (809) 555-1234', { align: 'right' })
     .text('contacto@luxeshop.com', { align: 'right' })
     .text('RNC: 1-23-45678-9', { align: 'right' });

  // Línea separadora
  doc.moveTo(50, 115)
     .lineTo(545, 115)
     .strokeColor(primaryColor)
     .lineWidth(2)
     .stroke();

  // === INFORMACIÓN DE FACTURA ===
  doc.fontSize(20)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('FACTURA', 50, 135);

  // Número y fecha
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#666')
     .text(`Número: ${order.orderNumber}`, 50, 165)
     .text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-DO', { 
       year: 'numeric', month: 'long', day: 'numeric' 
     })}`, 50, 180)
     .text(`NCF: B0100000${String(order._id).slice(-6)}`, 50, 195);

  // Estado de pago
  const paymentStatus = order.isPaid ? 'PAGADO' : 'PENDIENTE';
  const statusColor = order.isPaid ? '#28a745' : '#dc3545';
  
  doc.roundedRect(400, 135, 145, 30, 5)
     .fill(statusColor);
  
  doc.fontSize(12)
     .fillColor('#fff')
     .font('Helvetica-Bold')
     .text(paymentStatus, 400, 145, { width: 145, align: 'center' });

  // === DATOS DEL CLIENTE ===
  doc.roundedRect(50, 220, 495, 80, 5)
     .fill(lightGray);

  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('DATOS DEL CLIENTE', 65, 235);

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Nombre: ${order.shippingAddress?.name || 'N/A'}`, 65, 255)
     .text(`Dirección: ${order.shippingAddress?.street || 'N/A'}`, 65, 270)
     .text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}`, 65, 285);

  doc.text(`Teléfono: ${order.shippingAddress?.phone || 'N/A'}`, 320, 255)
     .text(`País: ${order.shippingAddress?.country || 'República Dominicana'}`, 320, 270)
     .text(`Código Postal: ${order.shippingAddress?.zipCode || 'N/A'}`, 320, 285);

  // === TABLA DE PRODUCTOS ===
  let yPos = 320;

  // Header de la tabla
  doc.roundedRect(50, yPos, 495, 25, 3)
     .fill(primaryColor);

  doc.fontSize(10)
     .fillColor('#fff')
     .font('Helvetica-Bold')
     .text('PRODUCTO', 60, yPos + 8)
     .text('CANT.', 320, yPos + 8, { width: 50, align: 'center' })
     .text('PRECIO', 380, yPos + 8, { width: 70, align: 'right' })
     .text('TOTAL', 460, yPos + 8, { width: 75, align: 'right' });

  yPos += 30;

  // Filas de productos
  doc.fillColor(textColor)
     .font('Helvetica');

  order.items.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? '#fff' : lightGray;
    
    doc.rect(50, yPos, 495, 25)
       .fill(bgColor);

    doc.fillColor(textColor)
       .fontSize(9)
       .text(item.name.substring(0, 40), 60, yPos + 8, { width: 250 })
       .text(String(item.quantity), 320, yPos + 8, { width: 50, align: 'center' })
       .text(fmtRD(item.price), 370, yPos + 8, { width: 80, align: 'right' })
       .text(fmtRD(item.price * item.quantity), 450, yPos + 8, { width: 85, align: 'right' });

    yPos += 25;
  });

  // Línea final de productos
  doc.moveTo(50, yPos)
     .lineTo(545, yPos)
     .strokeColor('#ddd')
     .lineWidth(1)
     .stroke();

  // === TOTALES ===
  yPos += 20;
  const totalsX = 350;

  // Subtotal
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(textColor)
     .text('Subtotal:', totalsX, yPos)
     .text(fmtRD(order.itemsPrice || 0), 440, yPos, { width: 95, align: 'right' });

  yPos += 14;
  doc.fontSize(8).fillColor('#999').text(fmtUSD(order.itemsPrice || 0), 440, yPos, { width: 95, align: 'right' });

  yPos += 20;

  // ITBIS
  doc.fontSize(10).fillColor(textColor)
     .text('ITBIS (18%):', totalsX, yPos)
     .text(fmtRD(order.taxPrice || 0), 440, yPos, { width: 95, align: 'right' });

  yPos += 14;
  doc.fontSize(8).fillColor('#999').text(fmtUSD(order.taxPrice || 0), 440, yPos, { width: 95, align: 'right' });

  yPos += 20;

  // Envío
  const shippingText = order.shippingPrice === 0 ? 'GRATIS' : fmtRD(order.shippingPrice || 0);
  doc.fontSize(10).text('Envío:', totalsX, yPos)
     .fillColor(order.shippingPrice === 0 ? '#28a745' : textColor)
     .text(shippingText, 440, yPos, { width: 95, align: 'right' });

  yPos += 5;

  // Línea antes del total
  doc.moveTo(totalsX, yPos + 10)
     .lineTo(535, yPos + 10)
     .strokeColor(primaryColor)
     .lineWidth(2)
     .stroke();

  yPos += 25;

  // Total
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor(primaryColor)
     .text('TOTAL:', totalsX, yPos)
     .text(fmtRD(order.totalPrice || 0), 420, yPos, { width: 115, align: 'right' });

  yPos += 18;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#999')
     .text(fmtUSD(order.totalPrice || 0), 420, yPos, { width: 115, align: 'right' });

  // === INFORMACIÓN DE PAGO ===
  yPos += 50;

  if (order.isPaid) {
    doc.roundedRect(50, yPos, 250, 60, 5)
       .fill('#d4edda');

    doc.fontSize(10)
       .fillColor('#155724')
       .font('Helvetica-Bold')
       .text('✓ PAGO CONFIRMADO', 65, yPos + 15);

    doc.font('Helvetica')
       .fontSize(9)
       .text(`Método: ${order.paymentMethod === 'stripe' ? 'Tarjeta de crédito/débito' : order.paymentMethod}`, 65, yPos + 35)
       .text(`Fecha: ${new Date(order.paidAt || order.createdAt).toLocaleDateString('es-DO')}`, 65, yPos + 50);
  }

  // === FOOTER ===
  const footerY = 750;

  doc.moveTo(50, footerY)
     .lineTo(545, footerY)
     .strokeColor('#ddd')
     .lineWidth(1)
     .stroke();

  doc.fontSize(8)
     .fillColor('#666')
     .font('Helvetica')
     .text('Gracias por tu compra en LuxeShop', 50, footerY + 15, { align: 'center', width: 495 })
     .text('Esta factura es un comprobante válido de tu compra', 50, footerY + 28, { align: 'center', width: 495 })
     .text('Para cualquier consulta: contacto@luxeshop.com | (809) 555-1234', 50, footerY + 41, { align: 'center', width: 495 });

  // Finalizar documento
  doc.end();
};

export default { generateInvoicePDF };
