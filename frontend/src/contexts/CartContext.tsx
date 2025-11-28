import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { getMyCart, addToCart as addToCartApi, updateCartItem as updateCartItemApi, removeFromCart as removeFromCartApi } from '../services/cart';
import { apiRequest } from '../services/api';

// Backend cart item type
type BackendCartItem = {
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  fecha_agregado: string;
  producto: {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio: number | string;
    stock: number;
    sku: string | null;
    marca: string | null;
    imagen_url?: string;
  };
};

export type CartItem = {
  id: string;
  id_producto: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
};

export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getItemCount: () => number;
  syncCartWithBackend: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart from backend
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If no token, try to load from localStorage as fallback
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        return;
      }

      const backendCart = await getMyCart(token);
      
      // Transformar los datos del backend al formato esperado por el frontend
      const transformedItems = (backendCart as unknown as BackendCartItem[]).map(item => {
        const price = typeof item.producto.precio === 'string' 
          ? parseFloat(item.producto.precio) 
          : Number(item.producto.precio) || 0;
          
        return {
          id: item.id_carrito.toString(),
          id_producto: item.id_producto,
          name: item.producto.nombre,
          price: price,
          quantity: item.cantidad,
          image_url: item.producto.imagen_url
        };
      });
      
      console.log('Ítems transformados:', transformedItems);

      setCartItems(transformedItems);
      setError(null);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('No se pudo cargar el carrito');
      // Fallback to localStorage if available
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cart on mount and when auth changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    try {
      const token = localStorage.getItem('token');
      
      // If user is not authenticated, update local state only
      if (!token) {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(i => i.id === item.id);
          const newItems = existingItem
            ? prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...prevItems, { ...item, quantity: 1 }];
          
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        });
        return;
      }

      // If user is authenticated, sync with backend
      await addToCartApi(token, item.id_producto, 1);
      await loadCart(); // Refresh cart from backend
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to local update if API fails
      setCartItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id);
        return existingItem
          ? prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...prevItems, { ...item, quantity: 1 }];
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      const itemToRemove = cartItems.find(item => item.id === itemId);
      
      if (!itemToRemove) return;

      // If user is not authenticated, update local state only
      if (!token) {
        setCartItems(prevItems => {
          const newItems = prevItems.filter(item => item.id !== itemId);
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        });
        return;
      }

      // If user is authenticated, sync with backend
      await removeFromCartApi(token, itemToRemove.id_producto);
      await loadCart(); // Refresh cart from backend
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to local update if API fails
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const itemToUpdate = cartItems.find(item => item.id === itemId);
      
      if (!itemToUpdate) return;

      // If user is not authenticated, update local state only
      if (!token) {
        setCartItems(prevItems => {
          const newItems = prevItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        });
        return;
      }

      // If user is authenticated, sync with backend
      await updateCartItemApi(token, itemToUpdate.id_producto, quantity);
      await loadCart(); // Refresh cart from backend
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Fallback to local update if API fails
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // If user is not authenticated, clear local cart only
      if (!token) {
        setCartItems([]);
        localStorage.removeItem('cart');
        return;
      }

      // If user is authenticated, clear cart in backend
      // Note: You might need to implement a clear cart endpoint in your API
      // For now, we'll remove items one by one
      const deletePromises = cartItems.map(item => 
        removeFromCartApi(token, item.id_producto)
      );
      
      await Promise.all(deletePromises);
      await loadCart(); // Refresh cart from backend
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to local clear if API fails
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Function to sync local cart with backend after login
  const syncCartWithBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get local cart items
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (localCart.length === 0) return;

      // Add all local items to backend cart
      for (const item of localCart) {
        try {
          await addToCartApi(token, item.id_producto, item.quantity);
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          // Continue with next item if one fails
        }
      }

      // Clear local cart after successful sync
      localStorage.removeItem('cart');
      
      // Reload cart from backend
      await loadCart();
    } catch (error) {
      console.error('Error syncing cart with backend:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        syncCartWithBackend,
        isLoading,
        error
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
