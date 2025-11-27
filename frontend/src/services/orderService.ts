import { apiRequest } from './api';

export interface OrderItem {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  nombre?: string;
  imagen_url?: string;
}

export interface OrderData {
  id_direccion: number;
  subtotal: number;
  impuestos: number;
  total: number;
  metodo_pago: string;
  notas?: string;
  items: OrderItem[];
}

export const createOrder = async (orderData: OrderData) => {
  try {
    const response = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response;
  } catch (error) {
    console.error('Error al crear la orden:', error);
    throw error;
  }
};

export const getMyOrders = async () => {
  try {
    const response = await apiRequest('/api/orders');
    return response;
  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId: number) => {
  try {
    const response = await apiRequest(`/api/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener los detalles de la orden:', error);
    throw error;
  }
};
