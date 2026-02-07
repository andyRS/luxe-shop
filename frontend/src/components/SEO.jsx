import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'LuxeShop', 
  description = 'Tu tienda de moda premium con las últimas tendencias. Vestidos, blusas, accesorios y más con envío a toda República Dominicana.',
  keywords = 'moda, ropa, vestidos, blusas, accesorios, tienda online, República Dominicana, LuxeShop',
  image = '/og-image.jpg',
  url = '',
  type = 'website'
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://luxeshop.com';
  const fullUrl = `${siteUrl}${url}`;
  const fullTitle = title === 'LuxeShop' ? title : `${title} | LuxeShop`;

  return (
    <Helmet>
      {/* Título */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:locale" content="es_DO" />
      <meta property="og:site_name" content="LuxeShop" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default SEO;
