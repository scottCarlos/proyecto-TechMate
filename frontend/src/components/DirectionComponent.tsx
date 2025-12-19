import React, { useEffect, useState } from 'react';
import { getMyAddresses, addAddress, setDefaultAddress } from '../services/address.service';
import type { Address } from '../services/address.service';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

interface NewAddress {
  name: string; // nombre_direccion
  street: string; // calle
  city: string; // ciudad
  state: string; // estado
  postal_code: string; // codigo_postal
  country: string; // pais
  is_default: boolean; // es_principal
  type: 'home' | 'office' | 'other';
}

interface DirectionComponentProps {
  onAddressSelected: (addressId: string) => void;
}


type DeliveryOption = 'main' | 'other' | 'pickup';

const initialNewAddress: NewAddress = {
  name: '', // nombre_direccion
  street: '', // calle
  city: '', // ciudad
  state: '', // estado
  postal_code: '', // codigo_postal
  country: 'Perú', // pais
  type: 'home',
  is_default: false // es_principal
};

const DirectionComponent = ({ onAddressSelected }: DirectionComponentProps) => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('main');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [pickupAddressId, setPickupAddressId] = useState<string | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>(initialNewAddress);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Debes iniciar sesión para ver tus direcciones');
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, navigate]);

  

  // Fetch addresses on component mount or when token changes
  useEffect(() => {
    const fetchAddresses = async () => {
      console.log('Fetching addresses...');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token available, cannot fetch addresses');
        setError('No se pudo cargar la información de autenticación');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Calling getMyAddresses...');
        const data = await getMyAddresses(token);
        console.log('Addresses data received:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Los datos recibidos no son válidos');
        }
        
        // Sort addresses to show default first
        const sortedAddresses = [...data].sort((a, b) => 
          (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)
        );
        
        setAddresses(sortedAddresses);

        // Set the default address as selected if available, otherwise select the first one
        const defaultAddress = sortedAddresses.find(addr => addr.is_default);
        if (defaultAddress) {
          console.log('Setting default address:', defaultAddress.id);
          setSelectedAddress(defaultAddress.id);
        } else if (sortedAddresses.length > 0) {
          console.log('No default address, selecting first one:', sortedAddresses[0].id);
          setSelectedAddress(sortedAddresses[0].id);
        } else {
          console.log('No addresses found');
          setSelectedAddress(null);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error details:', errorMessage);
        setError(`No se pudieron cargar las direcciones: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [token]);

  useEffect(() => {
    const ensurePickupAddress = async () => {
      if (deliveryOption !== 'pickup') return;
      if (!token) return;

      try {
        if (pickupAddressId) {
          setSelectedAddress(pickupAddressId);
          onAddressSelected(pickupAddressId);
          return;
        }

        setIsLoading(true);

        const randomNumber = Math.floor(100 + Math.random() * 900);
        const pickupToSend = {
          name: `Recojo en tienda #${Date.now()}`,
          street: `Av. Principal ${randomNumber}`,
          city: 'Lima',
          state: 'Lima',
          postal_code: '15001',
          country: 'Perú',
          is_default: false,
          type: 'other' as const,
        };

        const created = await addAddress(token, pickupToSend);

        setPickupAddressId(created.id);
        setSelectedAddress(created.id);
        onAddressSelected(created.id);

        setAddresses((prev) => [...prev, created]);
      } catch (err) {
        console.error('Error creando dirección para recojo en tienda:', err);
        message.error('No se pudo preparar la dirección para recojo en tienda');
      } finally {
        setIsLoading(false);
      }
    };

    void ensurePickupAddress();
  }, [deliveryOption, token, pickupAddressId, onAddressSelected]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!token || !newAddress.street || !newAddress.city || !newAddress.postal_code) {
      message.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);
      
      // Preparar los datos para enviar al backend
      const addressToSend = {
        name: newAddress.name,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postal_code: newAddress.postal_code,
        country: newAddress.country,
        is_default: newAddress.is_default,
        type: newAddress.type
      };
      
      console.log('Enviando dirección al servidor:', addressToSend);
      
      const addedAddress = await addAddress(token, addressToSend);
      
      // Actualizar la lista de direcciones
      setAddresses(prev => {
        const updated = [...prev, addedAddress];
        // Si es la primera dirección o está marcada como predeterminada, seleccionarla
        if (addedAddress.is_default || updated.length === 1) {
          setSelectedAddress(addedAddress.id);
          onAddressSelected(addedAddress.id);
        }
        return updated;
      });

      // Reiniciar el formulario
      setNewAddress(initialNewAddress);
      setShowAddAddressForm(false);
      message.success('Dirección guardada correctamente');
    } catch (err) {
      console.error('Error al guardar la dirección:', err);
      message.error(err instanceof Error ? err.message : 'Error al guardar la dirección');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!token || !addressId) return;

    try {
      setIsLoading(true);
      await setDefaultAddress(token, addressId);
      
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        }))
      );
      
      setSelectedAddress(addressId);
      message.success('Dirección predeterminada actualizada');
    } catch (err) {
      console.error('Error setting default address:', err);
      message.error('Error al actualizar la dirección predeterminada');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Error al cargar las direcciones
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
        ¿Cómo quieres recibir tu pedido?
      </h2>

      {/* Delivery Options */}
      <div className="flex flex-col sm:flex-row gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
        {[
          { value: 'main' as const, label: 'Dirección principal' },
          { value: 'pickup' as const, label: 'Recoger en tienda' }
        ].map((option) => (
          <label
            key={option.value}
            className={`flex-1 text-center py-2 px-4 rounded-md cursor-pointer transition-colors ${
              deliveryOption === option.value
                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
          >
            <input
              type="radio"
              name="delivery-option"
              value={option.value}
              checked={deliveryOption === option.value}
              onChange={() => setDeliveryOption(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>

      {/* Address Selection */}
      {deliveryOption !== 'pickup' && (
        <div className="space-y-4 mb-6">
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No tienes direcciones guardadas
              </p>
              <button
                onClick={() => setShowAddAddressForm(true)}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Agregar dirección
              </button>
            </div>
          ) : (
            <>
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddress === address.id
                      ? 'border-primary dark:border-primary/70 bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => {
                    setSelectedAddress(address.id)
                    onAddressSelected(address.id)   // ⭐ AQUÍ ESTÁ LA MAGIA
                  }}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address-selection"
                      checked={selectedAddress === address.id}
                      onChange={() => setSelectedAddress(address.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {address.name}
                          {address.is_default && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded-full">
                              Predeterminada
                            </span>
                          )}
                        </h3>
                        {!address.is_default && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(address.id);
                            }}
                            className="text-xs text-primary hover:text-primary/80"
                          >
                            Establecer como predeterminada
                          </button>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                        {address.street}, {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
                        {address.country}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {!showAddAddressForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddAddressForm(true)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 mt-2 text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Añadir nueva dirección
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="mt-4 space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <h4 className="font-medium text-slate-900 dark:text-white">Nueva dirección</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nombre de la dirección
                    </label>
                    <input
                      type="text"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                      placeholder="Ej: Casa, Oficina, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Calle y número
                    </label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                      placeholder="Calle y número"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                        placeholder="Ciudad"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Estado/Región
                      </label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                        placeholder="Estado/Región"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Código postal
                      </label>
                      <input
                        type="text"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                        placeholder="Código postal"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                        required
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="default-address"
                        checked={newAddress.is_default}
                        onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                        className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-600 rounded"
                      />
                      <label htmlFor="default-address" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                        Establecer como dirección predeterminada
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        style={{color: "#253"}}
                        type="button"
                        onClick={() => setShowAddAddressForm(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                      >
                        {isLoading ? 'Guardando...' : 'Guardar dirección'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Pickup Location */}
      {deliveryOption === 'pickup' && (
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Selecciona una tienda para recoger
          </h3>
          <select
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:text-white"
            defaultValue=""
          >
            <option value="store1">Tienda Principal - Av. Principal 123, Lima</option>
          </select>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Horario de atención: Lunes a Sábado de 9:00 AM a 8:00 PM
          </p>
        </div>
      )}
    </div>
  );

  // Show error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Error al cargar las direcciones
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
};

export default DirectionComponent;
