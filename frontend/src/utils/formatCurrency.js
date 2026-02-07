// Tasa de cambio por defecto: 1 USD = 58.50 RD$ (se actualiza desde la configuración de la tienda)
export let EXCHANGE_RATE = 58.50;

/**
 * Actualiza la tasa de cambio dinámicamente desde los settings
 */
export const setExchangeRate = (rate) => {
  if (rate && rate > 0) EXCHANGE_RATE = rate;
};

/**
 * Obtiene la tasa actual
 */
export const getExchangeRate = () => EXCHANGE_RATE;

/**
 * Formatea un monto en USD
 */
export const formatUSD = (amount) => {
  const num = Number(amount) || 0;
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formatea un monto en Pesos Dominicanos (convierte de USD a RD$)
 */
export const formatRD = (amount) => {
  const num = (Number(amount) || 0) * EXCHANGE_RATE;
  return `RD$ ${num.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Retorna ambos formatos: RD$ y USD como objeto
 */
export const formatDual = (amount) => {
  return {
    rd: formatRD(amount),
    usd: formatUSD(amount),
  };
};

/**
 * Retorna string combinado: "RD$ X,XXX.XX | USD $XX.XX"
 */
export const formatDualInline = (amount) => {
  return `${formatRD(amount)} | USD ${formatUSD(amount)}`;
};

/**
 * Formatea montos para el admin dashboard (abreviado)
 */
export const formatCompact = (amount) => {
  const num = Number(amount) || 0;
  const rd = num * EXCHANGE_RATE;
  if (rd >= 1000000) return { rd: `RD$ ${(rd / 1000000).toFixed(1)}M`, usd: formatUSD(num) };
  if (rd >= 1000) return { rd: `RD$ ${(rd / 1000).toFixed(1)}K`, usd: formatUSD(num) };
  return { rd: formatRD(num), usd: formatUSD(num) };
};
