import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCart, removeFromCart, type CartItem, clearCart } from '../services/cart'
import { createOrder } from '../services/order.service'
import { getMyAddresses } from '../services/address.service'
import { message } from 'antd'
import 'material-symbols/outlined.css'
import DirectionComponent from '../components/DirectionComponent'

interface StoredAuth {
  token: string
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  type: string;
  is_default: boolean;
}

type PaymentMethod = 'plin' | 'yape' | 'card' | 'paypal' | null;

interface CheckoutPageProps {}

const CheckoutPage: FC<CheckoutPageProps> = () => {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openPaymentMethod, setOpenPaymentMethod] = useState<PaymentMethod>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isCardFormValid, setIsCardFormValid] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    items: CartItem[];
    paymentMethod: string;
    paymentDetails: any;
    delivery: {
      method: 'delivery' | 'pickup';
      address: Address | null;
    };
    subtotal: number;
    shipping: number;
    taxes: number;
    total: number;
    orderDate: string;
    estimatedDelivery: string;
  } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const togglePaymentMethod = (method: PaymentMethod) => {
    setOpenPaymentMethod(openPaymentMethod === method ? null : method);
  };

  const validateCardNumber = (number: string) => {
    // Basic validation: 13-19 digits, may include spaces or dashes
    const regex = /^[0-9\s-]{13,19}$/;
    if (!number) return 'El número de tarjeta es requerido';
    if (!regex.test(number)) return 'Número de tarjeta inválido';
    return '';
  };

  const validateName = (name: string) => {
    if (!name.trim()) return 'El nombre del titular es requerido';
    return '';
  };

  const validateExpiryDate = (date: string) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!date) return 'La fecha de vencimiento es requerida';
    if (!regex.test(date)) return 'Formato inválido (MM/YY)';
    return '';
  };

  const validateCVV = (cvv: string) => {
    const regex = /^[0-9]{3,4}$/;
    if (!cvv) return 'El CVV es requerido';
    if (!regex.test(cvv)) return 'CVV inválido (3-4 dígitos)';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: validateCardNumber(cardData.cardNumber),
      cardName: validateName(cardData.cardName),
      expiryDate: validateExpiryDate(cardData.expiryDate),
      cvv: validateCVV(cardData.cvv)
    };
    
    setErrors(newErrors);
    
    const isValid = Object.values(newErrors).every(error => !error);
    setIsCardFormValid(isValid);
    
    return isValid;
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } 
    // Format expiry date as MM/YY
    else if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,2})/, (_, p1, p2) => 
          p2 ? `${p1}/${p2}` : p1
        )
        .substring(0, 5);
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } 
    // Only allow numbers for CVV
    else if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').substring(0, 4);
      setCardData(prev => ({ ...prev, [name]: formattedValue }));
    } 
    // For card name, just update normally
    else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      handlePayment();
    }
  };

  const getCardType = (number: string): string => {
    const num = number.replace(/\D/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'American Express';
    return 'Otra tarjeta';
  };

  const getEstimatedDeliveryDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + (deliveryMethod === 'delivery' ? 3 : 1));
    return date.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDeliveryMethodChange = (method: 'delivery' | 'pickup') => {
    setDeliveryMethod(method);
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId);
  };

  useEffect(() => {
    const raw = localStorage.getItem('auth')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as StoredAuth
      if (parsed.token) setToken(parsed.token)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const cart = await getMyCart(token)
        setItems(cart)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  useEffect(() => {
    const loadAddresses = async () => {
      if (!token) return
      try {
        const addresses = await getMyAddresses(token)
        setAddresses(addresses)
      } catch (error) {
        console.error('Error loading addresses:', error)
      }
    }

    loadAddresses()
  }, [token])

  const _handleRemove = async (productId: number) => {
    if (!token) return
    try {
      await removeFromCart(token, productId)
      setItems(prev => prev.filter(item => item.id_producto !== productId))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const price = Number(item.producto?.precio) || 0
      return total + (price * item.cantidad)
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const shipping = items.length > 0 ? 15 : 0
  const taxes = items.length > 0 ? Math.round(subtotal * 0.18 * 100) / 100 : 0
  const total = subtotal + shipping + taxes

  const handlePayment = async () => {
    if (isProcessingOrder) return;
    if (!selectedAddress && deliveryMethod === 'delivery') {
      message.error('Por favor, selecciona una dirección de envío');
      return;
    }

    if (!openPaymentMethod) {
      message.error('Por favor, selecciona un método de pago');
      return;
    }

    if (openPaymentMethod === 'card' && !isCardFormValid) {
      message.error('Por favor, completa los datos de la tarjeta correctamente');
      return;
    }

    setIsProcessingOrder(true);

    try {
      try {
        // Prepare order items
        const orderItems = items.map(item => ({
          id_producto: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio,
          nombre: item.producto.nombre,
          imagen: item.producto.imagen
        }));

        // Map payment method to the expected format
        const paymentMethodMap = {
          card: 'Tarjeta',
          plin: 'Transferencia',
          yape: 'Transferencia'
        };

        // Create order in the database
        const orderResponse = await createOrder({
          id_direccion: Number(selectedAddress),
          subtotal,
          impuestos: taxes,
          total,
          metodo_pago: paymentMethodMap[openPaymentMethod] || 'Transferencia',
          items: orderItems,
          notas: ''
        });

        // Create order details for confirmation
        const orderData = {
          orderId: orderResponse.id_pedido,
          items,
          paymentMethod: openPaymentMethod,
          paymentDetails: openPaymentMethod === 'card' ? {
            lastFour: cardData.cardNumber?.slice(-4) || '****',
            cardType: cardData.cardNumber ? getCardType(cardData.cardNumber) : 'Visa'
          } : { type: openPaymentMethod },
          delivery: {
            method: deliveryMethod,
            address: deliveryMethod === 'delivery' 
              ? addresses.find(addr => addr.id === selectedAddress) || null
              : null
          },
          subtotal,
          shipping,
          taxes,
          total,
          orderDate: new Date().toISOString(),
          estimatedDelivery: getEstimatedDeliveryDate()
        };

        setOrderDetails(orderData);
        setOrderConfirmed(true);
        
        // Clear cart on successful order
        if (token) {
          await clearCart(token);
        }
      } catch (error) {
        console.error('Error processing order:', error);
        throw error;
      }
      
      message.success('¡Pedido realizado con éxito!');
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      message.error('Error al procesar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessingOrder(false);
    }
    console.log('Processing payment with:', {
      method: openPaymentMethod,
      cardData: openPaymentMethod !== 'card' ? 'Using default payment data' : cardData
    });
    
    message.success({
      content: '¡Pago procesado con éxito! Redirigiendo...',
      duration: 2,
      onClose: () => {
        if (token) {
          // Aquí podrías implementar la lógica para limpiar el carrito
          // Por ahora solo redirigimos
          navigate('/orden-completada')
        }
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl animate-spin">
              shopping_cart
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Cargando tu carrito...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-red-500 mb-4">
            <span className="material-symbols-outlined text-5xl">
              error_outline
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Error al cargar el carrito</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Reintentar
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tu carrito está vacío</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Parece que no has agregado ningún producto a tu carrito todavía.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 lg:px-10 xl:px-20 2xl:px-40 py-10 sm:py-12 md:py-16">
        <div className="flex flex-wrap justify-between gap-4 p-4 items-center">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Finaliza tu Compra
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
              Revisa tu pedido y elige un método de pago.
            </p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="truncate">Volver al carrito</span>
          </button>
        </div>

        <div className="flex flex-row lg:flex-row gap-8 mt-8 p-4">
          <div className='flex flex-col'>
            {/* Sección de Métodos de Pago */}
            <div className="w-full lg:w-5/5">
              <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Elige tu método de pago
              </h2>
              
              <div className="flex flex-col gap-3">
                {/* Método Plin */}
                <details 
                  className="flex flex-col rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 group"
                  open={openPaymentMethod === 'plin'}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      togglePaymentMethod('plin');
                    } else if (openPaymentMethod === 'plin') {
                      togglePaymentMethod(null);
                    }
                  }}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <div className="flex items-center gap-4">
                      <img 
                        className="h-6 w-6" 
                        alt="Plin logo" 
                        src="/img/plin-logo.png" 
                      />
                      <p className="text-slate-900 dark:text-white text-base font-medium">Pagar con Plin</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-open:rotate-180 transition-transform duration-300">
                      expand_more
                    </span>
                  </summary>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        Escanea el código QR con la aplicación de Plin para realizar el pago
                      </p>
                      <div className="flex justify-center mb-4">
                        <img 
                          src="/img/plin.jpg" 
                          alt="Código QR de Plin" 
                          className="w-48 h-48 object-contain border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        O envía el pago al número de celular: 999 999 999
                      </p>
                    </div>
                  </div>
                </details>

                {/* Método Yape */}
                <details 
                  className="flex flex-col rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4 group"
                  open={openPaymentMethod === 'yape'}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      togglePaymentMethod('yape');
                    } else if (openPaymentMethod === 'yape') {
                      togglePaymentMethod(null);
                    }
                  }}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <div className="flex items-center gap-4">
                      <img 
                        className="h-6 w-6" 
                        alt="Yape logo" 
                        src="/img/yape-logo.png" 
                      />
                      <p className="text-slate-900 dark:text-white text-base font-medium">Pagar con Yape</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-open:rotate-180 transition-transform duration-300">
                      expand_more
                    </span>
                  </summary>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        Escanea el código QR con la aplicación de Plin para realizar el pago
                      </p>
                      <div className="flex justify-center mb-4">
                        <img 
                          src="/img/yape.jpg" 
                          alt="Código QR de Yape" 
                          className="w-48 h-48 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        O envía el pago al número de celular: 999 999 999
                      </p>
                    </div>
                  </div>
                </details>

                {/* Método Tarjeta de Crédito/Débito */}
                <details 
                  className="flex flex-col rounded-xl border-2 border-primary bg-primary/10 dark:bg-primary/20 px-[15px] py-[7px] group"
                  open={openPaymentMethod === 'card'}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      togglePaymentMethod('card');
                    } else if (openPaymentMethod === 'card') {
                      togglePaymentMethod(null);
                    }
                  }}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary">credit_card</span>
                      <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">
                        Tarjeta de Crédito o Débito
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-open:rotate-180 transition-transform duration-300">
                      expand_more
                    </span>
                  </summary>
                  <div className="border-t border-slate-300 dark:border-slate-700 mt-2 pt-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal pb-4">
                      Paga de forma segura con tu tarjeta de débito o crédito. Aceptamos Visa, Mastercard y American Express.
                    </p>
                    
                    <form onSubmit={handleCardSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="flex flex-col w-full">
                          <div className="flex justify-between items-center">
                            <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal pb-1">
                              Número de Tarjeta
                            </p>
                            {errors.cardNumber && <span className="text-sm text-red-500">{errors.cardNumber}</span>}
                          </div>
                          <div className="relative flex w-full flex-1 items-center">
                            <input 
                              name="cardNumber"
                              value={cardData.cardNumber}
                              onChange={handleCardInputChange}
                              onBlur={() => {
                                setErrors(prev => ({ ...prev, cardNumber: validateCardNumber(cardData.cardNumber) }));
                              }}
                              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${errors.cardNumber ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white/50 dark:bg-slate-800/50 focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal`} 
                              placeholder="0000 0000 0000 0000" 
                              maxLength={19}
                            />
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 absolute right-4">
                              credit_card
                            </span>
                          </div>
                        </label>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="flex flex-col w-full">
                          <div className="flex justify-between items-center">
                            <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal pb-1">
                              Nombre del Titular
                            </p>
                            {errors.cardName && <span className="text-sm text-red-500">{errors.cardName}</span>}
                          </div>
                          <input 
                            name="cardName"
                            value={cardData.cardName}
                            onChange={handleCardInputChange}
                            onBlur={() => {
                              setErrors(prev => ({ ...prev, cardName: validateName(cardData.cardName) }));
                            }}
                            className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${errors.cardName ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white/50 dark:bg-slate-800/50 focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal`} 
                            placeholder="JUAN PEREZ" 
                          />
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                              <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal pb-1">
                                Fecha de Vencimiento
                              </p>
                              {errors.expiryDate && <span className="text-sm text-red-500">{errors.expiryDate}</span>}
                            </div>
                            <input 
                              name="expiryDate"
                              value={cardData.expiryDate}
                              onChange={handleCardInputChange}
                              onBlur={() => {
                                setErrors(prev => ({ ...prev, expiryDate: validateExpiryDate(cardData.expiryDate) }));
                              }}
                              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${errors.expiryDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white/50 dark:bg-slate-800/50 focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal`} 
                              placeholder="MM/AA" 
                              maxLength={5}
                            />
                          </label>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                              <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal pb-1">
                                CVV
                              </p>
                              {errors.cvv && <span className="text-sm text-red-500">{errors.cvv}</span>}
                            </div>
                            <div className="relative">
                              <input 
                                name="cvv"
                                type="password"
                                value={cardData.cvv}
                                onChange={handleCardInputChange}
                                onBlur={() => {
                                  setErrors(prev => ({ ...prev, cvv: validateCVV(cardData.cvv) }));
                                }}
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border ${errors.cvv ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white/50 dark:bg-slate-800/50 focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal`} 
                                placeholder="123" 
                                maxLength={4}
                              />
                              <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 absolute right-4 top-1/2 -translate-y-1/2">
                                lock
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </form>
                  </div>
                </details>

                {/* Método PayPal */}
                <details 
                  className="flex flex-col rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-[15px] py-[7px] group"
                  open={openPaymentMethod === 'paypal'}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      togglePaymentMethod('paypal');
                    } else if (openPaymentMethod === 'paypal') {
                      togglePaymentMethod(null);
                    }
                  }}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 list-none">
                    <div className="flex items-center gap-4">
                      <img 
                        className="h-6" 
                        alt="PayPal logo" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbZBAQf_Yl3Xminp53lhxMmgvK_FQ5LYiH-WcRprSDEi5QlZKq4qHKjj-YafQsOAUdACa6eGpVb7r6ys1BnAM_1n8tHl0RzD9mh_Beuc0wOxGec8dRUySW65H_m-TLCWZ02xa-NLd9ba-wMAnbCDnIkYOKpBZozKfSfZWFRt57cCYNCVFC4pIweXm5lwjlS2O9T90i-LoSNJD6CdzJJaIaR0NTfBOXsYihbJsDGbrddzq0mbBxBg9VtOwOwjJ_gXU33gc39Ow7b4I" 
                      />
                      <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal">PayPal</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-open:rotate-180 transition-transform duration-300">
                      expand_more
                    </span>
                  </summary>
                  <div className="flex flex-col items-start gap-4 pb-4 pt-4 border-t border-slate-300 dark:border-slate-700 mt-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                      Serás redirigido a PayPal para completar tu compra de forma segura.
                    </p>
                    <button 
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#0070BA] px-6 py-3 text-white font-bold hover:bg-[#005EA6] transition-colors"
                      onClick={handlePayment}
                    >
                      <img 
                        className="h-5" 
                        alt="PayPal small logo" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv466XTnwYKUEqy4lamLW0NIlxORtT3JDJyOgu81oAc1ImguUwCvypKY5sIMKlPK5heEDPBevBRZNVNCbsmD0SehgIyy8Dsqmap7k0-TA7XwWK-GdE2W-hMK0aNMZ8G3FsmN1aThdIieBVzhFC9APGL8xQz-0cAQXHTFyH4jR1yqjQSC4QQq8Oqinn8vvCKBYIlP9dxESgaVoUXjf93Urs6kZqRajR1VL8VHwS7-CWKMjMneu4hQknVsxc-W2cHaJAcR3hhT_f3QY" 
                      />
                      <span>Ir a PayPal</span>
                    </button>
                  </div>
                </details>
              </div>
            </div>
            {/* Sección de Dirección de Envío - Movida al final */}
            <div className="w-full mt-8">
              <DirectionComponent  onAddressSelected={setSelectedAddress}/>
            </div>
          </div>

          {/* Resumen del Pedido */}
          <aside className="w-full lg:w-2/5 lg:sticky top-16 h-fit">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6">
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-6">
                Resumen de tu pedido
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id_producto} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-200 dark:border-gray-700">
                        {item.producto?.imagen ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${item.producto.imagen}`} 
                            alt={item.producto.nombre}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              // If image fails to load, show a placeholder
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              target.src = '/img/placeholder-product.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <span className="material-symbols-outlined text-gray-400">
                              image
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {item.producto?.nombre || 'Producto'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      S/ {item.producto?.precio ? (Number(item.producto.precio) * item.cantidad).toFixed(2) : '0.00'}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-slate-500 dark:text-slate-400">Subtotal</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">S/ {subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-500 dark:text-slate-400">Envío</p>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {shipping > 0 ? `S/ ${shipping.toFixed(2)}` : 'Gratis'}
                  </p>
                </div>
                {taxes > 0 && (
                  <div className="flex justify-between">
                    <p className="text-slate-500 dark:text-slate-400">Impuestos</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">S/ {taxes.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>
              
              <div className="flex justify-between">
                <p className="text-lg font-bold text-slate-900 dark:text-white">Total a pagar</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">S/ {total.toFixed(2)}</p>
              </div>
              
              <button 
                className="w-full flex items-center justify-center gap-2 mt-8 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg text-lg transition-colors"
                onClick={handlePayment}
              >
                <span className="material-symbols-outlined">lock</span>
                <span>Confirmar Pedido</span>
              </button>
              
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
                Tu pago es 100% seguro. Todos los datos están encriptados.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage;