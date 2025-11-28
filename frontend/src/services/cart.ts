const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface CartProduct {
  id: number
  nombre: string
  descripcion?: string | null
  precio: number
  stock?: number | null
  sku?: string | null
  marca?: string | null
  imagen?: string | null
}

export interface CartItem {
  id_carrito: number
  id_producto: number
  cantidad: number
  fecha_agregado: string
  producto: CartProduct
}

export async function getMyCart(token: string): Promise<CartItem[]> {
  const res = await fetch(`${API_URL}/api/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('No se pudo cargar el carrito')
  }

  return res.json()
}

export async function addToCart(token: string, id_producto: number, cantidad = 1): Promise<void> {
  const res = await fetch(`${API_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id_producto, cantidad }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'No se pudo añadir al carrito')
  }
}

export async function updateCartItem(token: string, id_producto: number, cantidad: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/cart/${id_producto}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cantidad }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'No se pudo actualizar el carrito')
  }
}

export async function removeFromCart(token: string, id_producto: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/cart/${id_producto}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'No se pudo eliminar del carrito')
  }
}

export async function clearCart(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/cart`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'No se pudo vaciar el carrito');
  }
}
