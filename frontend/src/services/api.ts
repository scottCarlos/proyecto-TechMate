const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token from auth object in localStorage
  const getAuthToken = () => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.token || null;
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
    return null;
  };

  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    console.log('Making request to:', `${API_URL}${endpoint}`);
    console.log('Using token:', token ? 'Token exists' : 'No token found');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Asegura que las cookies se envíen con la petición
    });

    console.log('Response status:', response.status);

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      let errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Authentication error:', errorData);
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      // Only redirect if we're not already on the auth page
      const isAuthPage = window.location.pathname.includes('/auth');
      if (!isAuthPage) {
        // Clear all auth-related data
        localStorage.removeItem('auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login with the current URL as the redirect parameter
        const redirectPath = window.location.pathname + window.location.search;
        window.location.href = `/auth?redirect=${encodeURIComponent(redirectPath)}`;
      }
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error:', error);
      throw new Error(error.message || 'Error en la petición');
    }

    return response.json();
  } catch (error) {
    console.error('Error en la petición:', {
      endpoint,
      error,
      token: token ? 'Token exists' : 'No token',
      url: `${API_URL}${endpoint}`
    });
    throw error;
  }
}
