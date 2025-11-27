import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Calcular totales
  const subtotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const shipping = 10.00; // Costo fijo de envío
  const taxes = subtotal * 0.18; // 18% de impuestos
  const total = subtotal + shipping + taxes;

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Por favor, ingresa una dirección de envío');
      return;
    }

    if (paymentMethod === 'tarjeta' && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      toast.error('Por favor, completa todos los campos de la tarjeta');
      return;
    }

    setIsLoading(true);

    try {
      // Aquí deberías validar la tarjeta con tu pasarela de pago
      // Por ahora, simulamos una validación exitosa
      
      const orderData = {
        id_direccion: 1, // Esto debería venir de la dirección seleccionada
        subtotal: subtotal,
        impuestos: taxes,
        total: total,
        metodo_pago: paymentMethod === 'tarjeta' ? 'Tarjeta' : paymentMethod,
        notas: orderNotes,
        items: cartItems.map(item => ({
          id_producto: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          nombre: item.nombre,
          imagen_url: item.imagen_url
        }))
      };

      const response = await createOrder(orderData);
      
      // Limpiar el carrito después de una compra exitosa
      clearCart();
      
      // Redirigir a la página de confirmación
      navigate(`/order-confirmation/${response.id_pedido}`);
      
      toast.success('¡Pedido realizado con éxito!');
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      toast.error('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si el carrito está vacío, redirigir al carrito
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <Link to="/products" className="text-blue-500 hover:underline">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
      <div className="w-full bg-background-light dark:bg-background-dark">
        <div className="container mx-auto px-4 py-8">
              <div className="flex flex-wrap justify-between gap-4 p-4 items-center">
                <div className="flex min-w-72 flex-col gap-3">
                  <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Finaliza tu Compra
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                    Revisa tu pedido y elige un método de pago.
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="truncate">Volver al carrito</span>
                </Link>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 mt-8 p-4">
                {/* Sección de métodos de pago */}
                <form onSubmit={handleSubmit} className="w-full lg:w-3/5">
                  <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                    Información de envío
                  </h2>
                  
                  <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700">
                    <div className="mb-4">
                      <label className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-2">
                        Dirección de envío
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Ingresa tu dirección completa"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-2">
                        Notas para el envío (opcional)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        rows={3}
                        placeholder="Instrucciones especiales para la entrega"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                    Elige tu método de pago
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Método: Yape */}
                    <div className="group flex flex-col rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6OX8X0SfXY71o-fZj5mTBhKy22qt0IbEdrYMaaGWmqdL7tOPm6GOlrM2Tect3VfNN45uYPlEf5XVqZUMQtFSqwx05wfLMzKv0M0tcE3A_8DVv8o5WvqQZSLsRw8uFf-3bBLbEkXeQpLG5WorpRA7q54n9x2xNkpgSdLb1fugaSpVIx4st8kDMQUK14OE4jk_xDIvzU8StsAJv_MAYkLUX0OxwT81gYFWIGykaBNCuNvAeGk6Ja40qxuz3zw1fuAy-9H6RO17vUIk" 
                            alt="Yape" 
                            className="h-6" 
                          />
                          <span className="text-slate-900 dark:text-white">Yape</span>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="h-5 w-5 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Método: Plin */}
                    <div className="group flex flex-col rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0TLAerzRZLidrV072ygkvCEF3ZFRPkoT5z7RsikBslMwykanlW0auKztwntSDCjg2rHybJeZhy92f_XjiyuxKl0lhHZ6HpQaEeNRv8O0JAEH1G7clsKHD1SgQLUb6ZURJuZ2TR40KtmpwniDnqk_SLRw3FJO5R1o8LO8gtdaYAy77dl8ZPMHW5YKuaXZ3GymvrBR63CtFhPUaEqEyU-wX6g3eqfN1czgIL79R48gehn1FGdqA4DXlC4rw2LaUYNhNoFBOjhsD8uQ" 
                            alt="Plin" 
                            className="h-6" 
                          />
                          <span className="text-slate-900 dark:text-white">Plin</span>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="h-5 w-5 text-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Método: Tarjeta de Crédito/Débito */}
                    <div className="group flex flex-col rounded-xl border-2 border-primary bg-primary/10 dark:bg-primary/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-primary">credit_card</span>
                          <span className="text-slate-900 dark:text-white font-medium">
                            Tarjeta de Crédito o Débito
                          </span>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="h-5 w-5 text-primary focus:ring-primary"
                          checked={paymentMethod === 'tarjeta'}
                          onChange={() => handlePaymentMethodChange('tarjeta')}
                        />
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-2">
                            Número de Tarjeta
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                              placeholder="0000 0000 0000 0000"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              disabled={paymentMethod !== 'tarjeta'}
                            />
                            <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">
                              credit_card
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-2">
                            Nombre del Titular
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Juan Pérez"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            disabled={paymentMethod !== 'tarjeta'}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-2">
                              Fecha de Vencimiento
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                              placeholder="MM/AA"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              disabled={paymentMethod !== 'tarjeta'}
                            />
                          </div>
                          <div>
                            <label className="block text-slate-800 dark:text-slate-200 text-sm font-medium mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              disabled={paymentMethod !== 'tarjeta'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Método: PayPal */}
                    <div className="group flex flex-col rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbZBAQf_Yl3Xminp53lhxMmgvK_FQ5LYiH-WcRprSDEi5QlZKq4qHKjj-YafQsOAUdACa6eGpVb7r6ys1BnAM_1n8tHl0RzD9mh_Beuc0wOxGec8dRUySW65H_m-TLCWZ02xa-NLd9ba-wMAnbCDnIkYOKpBZozKfSfZWFRt57cCYNCVFC4pIweXm5lwjlS2O9T90i-LoSNJD6CdzJJaIaR0NTfBOXsYihbJsDGbrddzq0mbBxBg9VtOwOwjJ_gXU33gc39Ow7b4I" 
                            alt="PayPal" 
                            className="h-6" 
                          />
                          <span className="text-slate-900 dark:text-white">PayPal</span>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          className="h-5 w-5 text-primary focus:ring-primary"
                        />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
                        Serás redirigido a PayPal para completar tu compra de forma segura.
                      </p>
                    </div>
                  </div>
                </form>

                {/* Resumen del pedido */}
                <div className="w-full lg:w-2/5">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6 sticky top-6">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-6">
                      Resumen de tu pedido
                    </h3>
                    
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            {item.imagen_url ? (
                              <img 
                                src={item.imagen_url} 
                                alt={item.nombre} 
                                className="w-16 h-16 rounded-lg object-cover" 
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-slate-400">Sin imagen</span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                {item.nombre}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Cantidad: {item.cantidad}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                ${item.precio.toFixed(2)} c/u
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <p className="text-slate-500 dark:text-slate-400">Subtotal</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          ${subtotal.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-slate-500 dark:text-slate-400">Envío</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          ${shipping.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>
                    
                    <div className="flex justify-between">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        Total a pagar
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        ${total.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 mt-8 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">lock</span>
                          <span>Confirmar Pedido (${total.toFixed(2)})</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
                      Tu pago es 100% seguro. Todos los datos están encriptados.
                    </p>
                  </div>
                </div>
          </div>
        </div>
      </div>
  );
};

export default CheckoutPage;
