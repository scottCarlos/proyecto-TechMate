const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Address {
  id_direccion: number
  id_usuario: number
  nombre_direccion: string | null
  calle: string
  ciudad: string
  estado: string | null
  codigo_postal: string
  pais: string
  es_principal: boolean
}

export async function getMyAddress(token: string): Promise<Address | null> {
  const res = await fetch(`${API_URL}/api/addresses/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('No se pudo cargar la dirección')
  }

  const data = await res.json()
  return data
}

export async function upsertMyAddress(
  token: string,
  data: Pick<Address, 'nombre_direccion' | 'calle' | 'ciudad' | 'estado' | 'codigo_postal' | 'pais'>,
): Promise<Address> {
  const res = await fetch(`${API_URL}/api/addresses/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('No se pudo guardar la dirección')
  }

  return res.json()
}
