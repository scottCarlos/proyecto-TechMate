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
    
    console.log('Datos recibidos del backend:', data);
    
    // Asegurarse de que siempre devolvamos un array
    if (!Array.isArray(data)) {
      console.warn('La respuesta no es un array, devolviendo array vacío. Datos recibidos:', data);
      return [];
    }

    // Mapear los datos del backend al formato del frontend
    return data.map((address: any) => ({
      id: address.id.toString(),
      name: address.name_direction || '',
      street: address.street,
      city: address.city,
      state: address.state || '',
      postal_code: address.postalCode,
      country: address.country,
      is_default: address.isDefault || false,
      type: 'home', // Valor por defecto
      created_at: address.created_at,
      updated_at: address.updated_at
    }));
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

    // Mapear los campos del frontend a los que espera el backend
    const requestBody = {
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
      type: address.type || 'home' // Asegurarse de que siempre se envíe un tipo
    };

    console.log('Enviando datos al backend:', requestBody);
    console.log('Realizando petición a:', `${API_URL}/api/addresses/me`);
    
    const response = await fetch(`${API_URL}/api/addresses/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error en la respuesta del servidor:', errorData);
      throw new Error(errorData.message || 'Error al guardar la dirección');
    }

    const responseData = await response.json();
    console.log('Respuesta del servidor:', responseData);
    
    // Mapear la respuesta del backend al formato que espera el frontend
    return {
      id: responseData.id_direccion.toString(),
      name: responseData.nombre_direccion || '',
      street: responseData.calle,
      city: responseData.ciudad,
      state: responseData.estado || '',
      postal_code: responseData.codigo_postal,
      country: responseData.pais,
      is_default: responseData.es_principal || false,
      type: 'home', // Valor por defecto
      created_at: responseData.created_at,
      updated_at: responseData.updated_at
    };
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