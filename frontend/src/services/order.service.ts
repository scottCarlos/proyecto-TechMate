import { apiRequest } from './api';

export interface OrderItem {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  nombre?: string;
  imagen?: string;
}

export interface Order {
  id_pedido: number;
  id_usuario: number;
  id_direccion: number;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
  fecha_pedido: string;
  fecha_entrega?: string;
  notas?: string;
  direccion: {
    calle: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    pais: string;
  };
  items: Array<{
    id_producto: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    imagen?: string;
  }>;
}

export interface CreateOrderData {
  id_direccion: number;
  subtotal: number;
  impuestos: number;
  total: number;
  metodo_pago: 'Tarjeta' | 'PayPal' | 'Transferencia';
  notas?: string;
  items: OrderItem[];
}

export const createOrder = async (orderData: CreateOrderData): Promise<{ id_pedido: number }> => {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getMyOrders = async (): Promise<Order[]> => {
  return apiRequest('/api/orders/my-orders');
};

export const getOrderDetails = async (orderId: number): Promise<Order> => {
  return apiRequest(`/api/orders/${orderId}`);
};

export const cancelOrder = async (orderId: number): Promise<void> => {
  return apiRequest(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'Cancelado' }),
  });
};
