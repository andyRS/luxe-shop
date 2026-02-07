import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Truck, ShieldCheck, Lock, CheckCircle, AlertCircle,
  MapPin, User, Phone, Mail, Package, ArrowLeft, Loader2, Info,
  Calendar, CreditCard as CreditCardIcon, Tag, X
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';
import { orderService } from '../services/orderService';
import * as couponService from '../services/couponService';
import { formatUSD, formatRD } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const settings = useSettingsStore(s => s.settings);

  const taxRate = settings?.taxRate ?? 0.18;
  const taxName = settings?.taxName || 'ITBIS';
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 50;
  const flatShippingCost = settings?.flatShippingCost ?? 10;
  const defaultCountry = settings?.defaultCountry || 'República Dominicana';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: defaultCountry,
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [cardType, setCardType] = useState('');

  // Estado del cupón
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const total = getTotal();
  const discount = appliedCoupon ? (appliedCoupon.discountType === 'percentage' 
    ? total * (appliedCoupon.discountValue / 100) 
    : appliedCoupon.discountValue) : 0;
  const discountedTotal = total - discount;
  const tax = discountedTotal * taxRate;
  const shipping = discountedTotal >= freeShippingThreshold ? 0 : flatShippingCost;
  const finalTotal = discountedTotal + tax + shipping;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito');
      return;
    }
    
    // Verificar que todos los productos tengan IDs válidos de MongoDB
    const invalidItems = items.filter(item => !item._id || !item._id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidItems.length > 0) {
      toast.error('Algunos productos en tu carrito no son válidos. Por favor, vacía el carrito y agrega los productos nuevamente.');
      navigate('/carrito');
    }
  }, [items, navigate]);

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    return '';
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatPhone = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 10) {
      return `(${v.substring(0, 3)}) ${v.substring(3, 6)}-${v.substring(6, 10)}`;
    } else if (v.length >= 6) {
      return `(${v.substring(0, 3)}) ${v.substring(3, 6)}-${v.substring(6)}`;
    } else if (v.length >= 3) {
      return `(${v.substring(0, 3)}) ${v.substring(3)}`;
    }
    return v;
  };

  // Funciones para manejar cupones
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await couponService.validateCoupon(couponCode.trim(), total);
      setAppliedCoupon(response.coupon);
      toast.success(`¡Cupón "${response.coupon.code}" aplicado!`);
      setCouponCode('');
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Cupón inválido');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast.success('Cupón removido');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      setCardType(detectCardType(formattedValue));
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateShipping = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'El teléfono debe tener al menos 10 dígitos';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'La dirección es obligatoria';
    } else if (formData.street.trim().length < 5) {
      newErrors.street = 'Ingresa una dirección más detallada';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'La provincia es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    const cardNumber = formData.cardNumber.replace(/\s/g, '');

    if (!cardNumber) {
      newErrors.cardNumber = 'El número de tarjeta es obligatorio';
    } else if (cardNumber.length < 15 || cardNumber.length > 16) {
      newErrors.cardNumber = 'El número de tarjeta debe tener 15-16 dígitos';
    } else if (!/^\d+$/.test(cardNumber)) {
      newErrors.cardNumber = 'Solo se permiten números';
    } else if (!luhnCheck(cardNumber)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'El nombre en la tarjeta es obligatorio';
    } else if (formData.cardName.trim().length < 3) {
      newErrors.cardName = 'Ingresa el nombre completo';
    }

    const [month, year] = formData.expiryDate.split('/');
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'La fecha de vencimiento es obligatoria';
    } else if (!month || !year || month.length !== 2 || year.length !== 2) {
      newErrors.expiryDate = 'Formato inválido (MM/AA)';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const expMonth = parseInt(month, 10);
      const expYear = parseInt(year, 10);
      
      if (expMonth < 1 || expMonth > 12) {
        newErrors.expiryDate = 'Mes inválido';
      } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryDate = 'La tarjeta está vencida';
      }
    }

    if (!formData.cvv) {
      newErrors.cvv = 'El CVV es obligatorio';
    } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'CVV inválido (3-4 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const luhnCheck = (num) => {
    let arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    let sum = arr.reduce((acc, val, i) => {
      if (i % 2 !== 0) {
        val = val * 2;
        if (val > 9) val = val - 9;
      }
      return acc + val;
    }, 0);
    return sum % 10 === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && validatePayment()) {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || item.images?.[0] || ''
        })),
        shippingAddress: {
          name: formData.fullName.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode || '00000',
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: 'stripe',
        paymentInfo: {
          id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'completed',
          cardLast4: formData.cardNumber.replace(/\s/g, '').slice(-4),
          cardBrand: cardType || 'card',
          update_time: new Date()
        },
        notes: formData.notes
      };

      const createdOrder = await orderService.create(orderData);
      setStep(3);
      
      setTimeout(() => {
        toast.success('¡Pedido realizado con éxito!');
        clearCart();
        navigate(`/orden-confirmada/${createdOrder._id}`, { 
          state: { order: createdOrder } 
        });
      }, 2000);

    } catch (error) {
      console.error('Error al crear orden:', error);
      const errorMessage = error.response?.data?.message || 'Error al procesar el pago. Intenta nuevamente.';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const CardTypeIcon = () => {
    const iconClass = "h-8 w-auto";
    switch(cardType) {
      case 'visa':
        return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className={iconClass} />;
      case 'mastercard':
        return <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className={iconClass} />;
      case 'amex':
        return <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg" alt="Amex" className={iconClass} />;
      default:
        return <CreditCardIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-display font-bold text-gray-900">Finalizar Compra</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[
              { num: 1, label: 'Envío', icon: Truck },
              { num: 2, label: 'Pago', icon: CreditCard },
              { num: 3, label: 'Confirmación', icon: CheckCircle }
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step >= s.num 
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 border-transparent text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle size={24} /> : <s.icon size={24} />}
                </div>
                <span className={`ml-2 font-medium hidden sm:block ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                {index < 2 && (
                  <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded transition-all duration-300 ${
                    step > s.num ? 'bg-gradient-to-r from-orange-500 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="text-orange-600" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Información de Envío</h2>
                    <p className="text-sm text-gray-500">¿Dónde enviamos tu pedido?</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                        errors.fullName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(809) 555-1234"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Dirección de Envío *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Calle, número, apartamento, sector"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                        errors.street 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                    />
                    {errors.street && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.street}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Santo Domingo"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none ${
                        errors.city 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Provincia *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-white ${
                        errors.state 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                      }`}
                    >
                      <option value="">Selecciona una provincia</option>
                      <option value="Distrito Nacional">Distrito Nacional</option>
                      <option value="Santo Domingo">Santo Domingo</option>
                      <option value="Santiago">Santiago</option>
                      <option value="La Vega">La Vega</option>
                      <option value="San Cristóbal">San Cristóbal</option>
                      <option value="Puerto Plata">Puerto Plata</option>
                      <option value="La Romana">La Romana</option>
                      <option value="San Pedro de Macorís">San Pedro de Macorís</option>
                      <option value="Otra">Otra</option>
                    </select>
                    {errors.state && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Código Postal</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="10101"
                      maxLength="6"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 outline-none cursor-not-allowed"
                      readOnly
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notas de Entrega (Opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Instrucciones especiales para la entrega..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="mt-8 w-full bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continuar al Pago
                  <CreditCard size={20} />
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="text-purple-600" size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Información de Pago</h2>
                    <p className="text-sm text-gray-500">Pago seguro y encriptado</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-800">Pago 100% Seguro</p>
                    <p className="text-sm text-green-700">Tus datos están protegidos con encriptación SSL</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-blue-800">Modo Demostración</p>
                    <p className="text-sm text-blue-700">
                      Usa la tarjeta de prueba: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">4242 4242 4242 4242</code>
                    </p>
                    <p className="text-sm text-blue-700">Fecha: cualquier fecha futura | CVV: cualquier 3 dígitos</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className={`w-full px-4 py-3 pr-16 rounded-xl border-2 transition-all duration-200 outline-none font-mono text-lg ${
                          errors.cardNumber 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CardTypeIcon />
                      </div>
                    </div>
                    {errors.cardNumber && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre en la Tarjeta *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="NOMBRE COMO APARECE EN LA TARJETA"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none uppercase ${
                        errors.cardName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      }`}
                    />
                    {errors.cardName && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />{errors.cardName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Vencimiento *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/AA"
                        maxLength="5"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none font-mono text-center text-lg ${
                          errors.expiryDate 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        }`}
                      />
                      {errors.expiryDate && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />{errors.expiryDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Lock size={16} className="inline mr-1" />
                        CVV *
                      </label>
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="•••"
                        maxLength="4"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none font-mono text-center text-lg ${
                          errors.cvv 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                        }`}
                      />
                      {errors.cvv && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} />{errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handlePrevStep}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Volver
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={processing}
                    className="flex-1 sm:flex-[2] bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Pagar {formatRD(finalTotal)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Completado!</h2>
                <p className="text-gray-600 mb-6">
                  Tu orden está siendo procesada. Serás redirigido en unos segundos...
                </p>
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Preparando confirmación...</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} />
                Resumen del Pedido
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 pb-3 border-b border-gray-100">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                      <p className="text-sm font-semibold text-orange-600">{formatRD(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatUSD(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                {/* Cupón de descuento */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Tienes un cupón?
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-green-600" />
                        <span className="text-green-700 font-medium">{appliedCoupon.code}</span>
                        <span className="text-green-600 text-sm">
                          (-{appliedCoupon.discountType === 'percentage' 
                            ? `${appliedCoupon.discountValue}%` 
                            : formatRD(appliedCoupon.discountValue)})
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="Código de cupón"
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          couponError ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {couponLoading ? <Loader2 size={16} className="animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-500 text-xs mt-1">{couponError}</p>
                  )}
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatRD(total)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>-{formatRD(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>{taxName} ({(taxRate * 100).toFixed(0)}%)</span>
                  <span>{formatRD(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? '¡Gratis!' : formatRD(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-gradient">{formatRD(finalTotal)}</span>
                    <p className="text-xs font-normal text-gray-400">{formatUSD(finalTotal)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span>Compra 100% segura</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Truck size={16} className="text-blue-600" />
                  <span>Envío gratis en compras +RD$ 2,925</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock size={16} className="text-purple-600" />
                  <span>Datos encriptados SSL</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Aceptamos:</p>
                <div className="flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Checkout;
