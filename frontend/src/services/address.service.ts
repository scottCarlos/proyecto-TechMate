import { API_URL } from '../config';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  type: 'home' | 'office' | 'other';
  created_at?: string;
  updated_at?: string;
}

export const getMyAddresses = async (token: string): Promise<Address[]> => {
  console.log('Iniciando getMyAddresses');
  
  if (!token) {
    console.error('No se proporcionó token de autenticación');
    throw new Error('No se proporcionó token de autenticación');
  }

  try {
    console.log('Realizando petición a:', `${API_URL}/api/addresses`);
    const response = await fetch(`${API_URL}/api/addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Respuesta recibida, status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor inicia sesión nuevamente.');
      }
      
      let errorMessage = 'Error al cargar las direcciones';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Error en la respuesta:', errorData);
      } catch (e) {
        const textResponse = await response.text();
        console.error('No se pudo parsear el error. Respuesta:', textResponse);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json().catch(async (e) => {
      console.error('Error al parsear la respuesta JSON:', e);
      console.log('Respuesta recibida (texto):', await response.text());
      return [];
    });
    
    console.log('Datos recibidos:', data);
    
    // Asegurarse de que siempre devolvamos un array
    if (!Array.isArray(data)) {
      console.warn('La respuesta no es un array, devolviendo array vacío. Datos recibidos:', data);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error en getMyAddresses:', error);
    // En caso de error, devolver un array vacío en lugar de lanzar el error
    // para que la UI no se rompa
    return [];
  }
};

export const addAddress = async (token: string, address: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<Address> => {
  try {
    if (!token) {
      console.error('No se proporcionó token de autenticación');
      throw new Error('No se proporcionó token de autenticación');
    }

    console.log('Realizando petición a:', `${API_URL}/api/addresses/me`);
    const response = await fetch(`${API_URL}/api/addresses/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al guardar la dirección');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const setDefaultAddress = async (token: string, addressId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/addresses/${addressId}/set-default`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar la dirección predeterminada');
    }
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};