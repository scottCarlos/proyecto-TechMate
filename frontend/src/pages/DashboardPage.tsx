import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserProfile } from '../services/user'
import { getMe, updateMe, uploadAvatar, deleteAvatar } from '../services/user'
import type { Address } from '../services/address'
import { getMyAddress, upsertMyAddress } from '../services/address'
import { changePassword } from '../services/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface StoredAuth {
  user: { id: number; email: string; nombre: string; apellido: string; rol: string }
  token: string
}

function DashboardPage() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('auth')
    if (!raw) {
      navigate('/auth', { replace: true, state: { from: '/dashboard' } })
      return
    }

    try {
      const parsed = JSON.parse(raw) as StoredAuth
      if (!parsed.token) {
        navigate('/auth', { replace: true, state: { from: '/dashboard' } })
        return
      }
      setToken(parsed.token)
    } catch {
      navigate('/auth', { replace: true, state: { from: '/dashboard' } })
    }
  }, [navigate])

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      setSuccess(null)
      setPasswordError(null)
      try {
        const [me, addr] = await Promise.all([getMe(token), getMyAddress(token)])
        setProfile(me)
        setAddress(addr)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  if (!token) {
    return null
  }

  const handleSaveProfile = async () => {
    if (!profile || !token) return

    if (!profile.nombre.trim() || !profile.apellido.trim()) {
      setError('Nombre y apellido son obligatorios')
      setPasswordError(null)
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    setPasswordError(null)
    try {
      const updated = await updateMe(token, {
        nombre: profile.nombre,
        apellido: profile.apellido,
        telefono: profile.telefono ?? null,
      })
      setProfile(updated)

      const raw = localStorage.getItem('auth')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredAuth
          const updatedAuth = {
            ...parsed,
            user: {
              ...parsed.user,
              nombre: updated.nombre,
              apellido: updated.apellido,
            },
          }
          localStorage.setItem('auth', JSON.stringify(updatedAuth))
        } catch {
          // ignoramos errores del localStorage
        }
      }

      setSuccess('Cambios guardados correctamente')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return

    const wantsPasswordChange =
      passwordCurrent.trim().length > 0 ||
      passwordNew.trim().length > 0 ||
      passwordConfirm.trim().length > 0

    if (!wantsPasswordChange) {
      return
    }

    if (!passwordCurrent.trim() || !passwordNew.trim() || !passwordConfirm.trim()) {
      setPasswordError('Debes completar todos los campos de contraseña')
      return
    }

    if (passwordNew !== passwordConfirm) {
      setPasswordError('Las contraseñas nuevas no coinciden')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await changePassword(token, {
        currentPassword: passwordCurrent,
        newPassword: passwordNew,
        confirmPassword: passwordConfirm,
      })

      setPasswordCurrent('')
      setPasswordNew('')
      setPasswordConfirm('')
      setPasswordError(null)
      setSuccess('Contraseña actualizada correctamente')
    } catch (e) {
      setPasswordError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAddress = async () => {
    if (!token || !address) return

    const hasAddressInput =
      !!address.calle ||
      !!address.ciudad ||
      !!address.codigo_postal ||
      !!address.estado

    if (!hasAddressInput) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updatedAddress = await upsertMyAddress(token, {
        name: address.nombre_direccion ?? '',
        street: address.calle,
        city: address.ciudad,
        state: address.estado || 'no aplica',
        postal_code: address.codigo_postal,
        country: 'Perú',
        is_default: true,
        type: 'home'
      })
      setAddress(updatedAddress)
      setSuccess('Dirección guardada correctamente')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const isLoadingData = loading || !profile

  const hasAvatar = (() => {
    if (!profile?.url_img) return false

    try {
      const raw = localStorage.getItem('auth')
      if (!raw) return !!profile.url_img

      const parsed = JSON.parse(raw) as { user?: { foto?: boolean } }
      if (typeof parsed.user?.foto === 'boolean') {
        return parsed.user.foto && !!profile.url_img
      }
    } catch {
      // ignoramos errores de parseo
    }

    return !!profile.url_img
  })()

  const handleAvatarUpload = async (file?: File | null) => {
    const targetFile = file ?? avatarFile
    if (!token || !targetFile) return

    console.log('JWT al subir avatar:', token)

    const maxSize = 2 * 1024 * 1024
    if (targetFile.size > maxSize) {
      setError('La imagen de perfil no puede superar los 2MB')
      return
    }

    setAvatarUploading(true)
    setError(null)
    setSuccess(null)
    try {
      const { url_img } = await uploadAvatar(token, targetFile)
      setProfile((prev) => (prev ? { ...prev, url_img } : prev))

      const raw = localStorage.getItem('auth')
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredAuth

          console.log('AUTH antes de actualizar avatar (upload):', parsed.user)

          const updatedAuth = {
            ...parsed,
            user: {
              ...parsed.user,
              url_img,
              foto: true,
            },
          }
          localStorage.setItem('auth', JSON.stringify(updatedAuth))
          console.log('AUTH despues de actualizar avatar (upload):', updatedAuth.user)
          window.dispatchEvent(new Event('auth-changed'))
        } catch {
          // ignoramos errores del localStorage
        }
      }

      setSuccess('Foto de perfil actualizada correctamente')
      setAvatarFile(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setAvatarUploading(false)
    }
  }

  return (
    <div className="flex w-full justify-center px-4 py-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <header>
          <p className="text-black dark:text-white text-4xl font-bold font-display leading-tight tracking-tight">
            Editar perfil
          </p>
        </header>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 px-3 py-2 rounded-lg">
            {success}
          </p>
        )}

        {isLoadingData ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando perfil...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda: foto de perfil */}
            <section className="lg:col-span-1 bg-white dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-white/10 flex flex-col items-center text-center">
              <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-tight pb-6">
                Foto de perfil
              </h3>

              <div className="relative mb-4">
                {hasAvatar ? (
                  (() => {
                    const rawUrl = profile?.url_img ?? ''
                    const avatarUrl = rawUrl.startsWith('http') ? rawUrl : `${API_URL}${rawUrl}`
                    return (
                      <img
                        src={avatarUrl}
                        alt={profile?.nombre ?? 'Avatar'}
                        className="size-40 rounded-full object-cover"
                      />
                    )
                  })()
                ) : (
                  <div className="bg-center bg-no-repeat bg-cover rounded-full size-40 flex items-center justify-center overflow-hidden bg-primary/10 text-primary text-2xl font-semibold">
                    {(() => {
                      const first = (profile?.nombre || '').trim().charAt(0)
                      const last = (profile?.apellido || '').trim().charAt(0)
                      const combined = `${first}${last}`.trim()
                      if (combined) return combined.toUpperCase()
                      return (profile?.email || '?').charAt(0).toUpperCase()
                    })()}
                  </div>
                )}
                <button
                  type="button"
                  aria-label="Editar foto de perfil"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center justify-center size-10 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>

              <p className="text-gray-800 dark:text-gray-200 text-xl font-medium leading-normal">
                {profile?.nombre} {profile?.apellido}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal mb-6">
                {profile?.email}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setAvatarFile(file)
                  if (file) {
                    void handleAvatarUpload(file)
                  }
                }}
              />

              <div className="flex flex-col gap-3 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined mr-2">upload</span>
                  <span>{avatarUploading ? 'Subiendo...' : 'Subir nueva foto'}</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return
                    const confirmed = window.confirm('¿Seguro que deseas eliminar tu foto de perfil?')
                    if (!confirmed) return

                    console.log('JWT al eliminar avatar:', token)

                    try {
                      await deleteAvatar(token)

                      setAvatarFile(null)
                      setProfile((prev) => (prev ? { ...prev, url_img: null } : prev))

                      const raw = localStorage.getItem('auth')
                      if (raw) {
                        try {
                          const parsed = JSON.parse(raw) as StoredAuth

                          console.log('AUTH antes de actualizar avatar (delete):', parsed.user)

                          const updatedAuth = {
                            ...parsed,
                            user: {
                              ...parsed.user,
                              url_img: null,
                              foto: false,
                            },
                          }
                          localStorage.setItem('auth', JSON.stringify(updatedAuth))
                          console.log('AUTH despues de actualizar avatar (delete):', updatedAuth.user)
                          window.dispatchEvent(new Event('auth-changed'))
                        } catch {
                        }
                      }

                      setSuccess('Foto de perfil eliminada correctamente')
                      setError(null)
                    } catch (e) {
                      setError((e as Error).message)
                    }
                  }}
                  disabled={!profile?.url_img}
                  className="flex w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-white/10 px-4 py-3 text-base font-medium text-black dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined mr-2">delete</span>
                  <span>Eliminar foto</span>
                </button>
              </div>
            </section>

            {/* Columna derecha: información personal, contraseña y dirección */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <section className="bg-white dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-white/10">
                <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-tight pb-6">
                Información personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                      Nombre
                    </p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                      value={profile?.nombre ?? ''}
                      onChange={(e) => setProfile((prev) => (prev ? { ...prev, nombre: e.target.value } : prev))}
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                      Apellido
                    </p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                      value={profile?.apellido ?? ''}
                      onChange={(e) =>
                        setProfile((prev) => (prev ? { ...prev, apellido: e.target.value } : prev))
                      }
                    />
                  </label>
                  <label className="flex flex-col col-span-1 md:col-span-2">
                    <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                      Correo electrónico
                    </p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                      type="email"
                      value={profile?.email ?? ''}
                      readOnly
                    />
                  </label>
                  {passwordError && (
                    <p className="col-span-1 md:col-span-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-3 py-2 rounded-lg">
                      {passwordError}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </section>

            {/* Security Section (solo UI por ahora) */}
            <section className="bg-white dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-white/10">
              <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-tight pb-6">
                Cambiar contraseña
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col col-span-1 md:col-span-2">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Contraseña actual
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="password"
                    placeholder="Ingresa tu contraseña actual"
                    value={passwordCurrent}
                    onChange={(e) => setPasswordCurrent(e.target.value)}
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Nueva contraseña
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="password"
                    placeholder="Ingresa una nueva contraseña"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Confirmar nueva contraseña
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="password"
                    placeholder="Confirma la nueva contraseña"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar contraseña'}
                </button>
              </div>
            </section>

            {/* CIERRE FALTANTE DEL GRID */}
            </div>

            {/* Shipping Address Section */}
            <section className="lg:col-span-3 bg-white dark:bg-black/20 p-6 rounded-xl border border-gray-200 dark:border-white/10">
              <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-tight pb-6">
                Dirección de envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col col-span-1 md:col-span-2">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Nombre de la dirección (ej: Casa, Trabajo)
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="text"
                    placeholder="Casa, Trabajo, Departamento, etc."
                    value={address?.nombre_direccion ?? ''}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        id_direccion: prev?.id_direccion ?? 0,
                        id_usuario: prev?.id_usuario ?? (profile?.id ?? 0),
                        nombre_direccion: e.target.value,
                        calle: prev?.calle ?? '',
                        ciudad: prev?.ciudad ?? '',
                        estado: prev?.estado ?? '',
                        codigo_postal: prev?.codigo_postal ?? '',
                        pais: prev?.pais ?? 'Perú',
                        es_principal: prev?.es_principal ?? true,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col col-span-1 md:col-span-2">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Dirección
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="text"
                    placeholder="Calle 123"
                    value={address?.calle ?? ''}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        id_direccion: prev?.id_direccion ?? 0,
                        id_usuario: prev?.id_usuario ?? (profile?.id ?? 0),
                        nombre_direccion: prev?.nombre_direccion ?? null,
                        calle: e.target.value,
                        ciudad: prev?.ciudad ?? '',
                        estado: prev?.estado ?? '',
                        codigo_postal: prev?.codigo_postal ?? '',
                        pais: prev?.pais ?? 'Perú',
                        es_principal: prev?.es_principal ?? true,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Ciudad
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="text"
                    placeholder="Ciudad"
                    value={address?.ciudad ?? ''}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        id_direccion: prev?.id_direccion ?? 0,
                        id_usuario: prev?.id_usuario ?? (profile?.id ?? 0),
                        nombre_direccion: prev?.nombre_direccion ?? null,
                        calle: prev?.calle ?? '',
                        ciudad: e.target.value,
                        estado: prev?.estado ?? '',
                        codigo_postal: prev?.codigo_postal ?? '',
                        pais: prev?.pais ?? 'Perú',
                        es_principal: prev?.es_principal ?? true,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    Código postal
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="text"
                    placeholder="00000"
                    value={address?.codigo_postal ?? ''}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        id_direccion: prev?.id_direccion ?? 0,
                        id_usuario: prev?.id_usuario ?? (profile?.id ?? 0),
                        nombre_direccion: prev?.nombre_direccion ?? null,
                        calle: prev?.calle ?? '',
                        ciudad: prev?.ciudad ?? '',
                        estado: prev?.estado ?? '',
                        codigo_postal: e.target.value,
                        pais: prev?.pais ?? 'Perú',
                        es_principal: prev?.es_principal ?? true,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col">
                  <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
                    País
                  </p>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-white/20 bg-background-light dark:bg-background-dark h-12 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-base font-normal leading-normal"
                    type="text"
                    value={address?.pais ?? 'Perú'}
                    readOnly
                  />
                </label>
                <div className="flex items-center gap-3 col-span-1 md:col-span-2 pt-2">
                  <input
                    className="h-4 w-4 rounded border-gray-300 dark:border-white/30 text-primary bg-gray-100 dark:bg-gray-800 focus:ring-primary dark:focus:ring-offset-background-dark"
                    id="billing-checkbox"
                    type="checkbox"
                    checked
                    readOnly
                  />
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200" htmlFor="billing-checkbox">
                    Usar esta dirección también para facturación
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={saving}
                  className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar dirección'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage

