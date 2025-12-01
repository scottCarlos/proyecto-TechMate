import { useState } from 'react'
import { login, register, type AuthUser } from '../services/auth'

export type AuthTab = 'login' | 'register'

interface AuthFormProps {
  onAuthSuccess: (user: AuthUser, token: string) => void
}

function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPasswordStrength = (value: string) => {
    let score = 0
    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[a-z]/.test(value)) score++
    if (/[0-9]/.test(value)) score++

    if (score <= 1) return { label: 'Débil', level: 'weak' as const }
    if (score === 2 || score === 3) return { label: 'Media', level: 'medium' as const }
    return { label: 'Fuerte', level: 'strong' as const }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setNombre('')
    setApellido('')
    setTelefono('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await login(email, password, { portal: 'client' })

      if (res.user.rol !== 'Cliente') {
        setError('No cuentas con una cuenta válida para iniciar sesión en esta plataforma')
        return
      }

      onAuthSuccess(res.user, res.token)
      resetForm()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await register(email, password, confirmPassword, nombre, apellido, telefono)
      onAuthSuccess(res.user, res.token)
      resetForm()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex rounded-full bg-gray-100 dark:bg-[#141926] p-1">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              tab === 'login'
                ? 'bg-white dark:bg-[#1C1F27] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              tab === 'register'
                ? 'bg-white dark:bg-[#1C1F27] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
          {tab === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </p>
        <p className="text-gray-500 dark:text-[#9da6b9] text-sm sm:text-base font-normal leading-normal">
          {tab === 'login'
            ? 'Inicia sesión para continuar.'
            : 'Regístrate para empezar a comprar y gestionar tus pedidos.'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-3 py-2 rounded-lg mb-2">
          {error}
        </p>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <label className="flex flex-col w-full">
            <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-2">Correo Electrónico</p>
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
                mail
              </span>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] pl-12 pr-4 text-sm sm:text-base font-normal leading-normal"
                placeholder="tu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="flex flex-col w-full">
            <div className="flex justify-between items-center pb-2">
              <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal">Contraseña</p>
              <span className="text-primary text-xs sm:text-sm font-medium leading-normal cursor-default">
                ¿Olvidaste tu contraseña?
              </span>
            </div>
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
                lock
              </span>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] pl-12 pr-4 text-sm sm:text-base font-normal leading-normal"
                placeholder="Ingresa tu contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center whitespace-nowrap font-medium text-base h-11 sm:h-12 px-6 rounded-lg w-full bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-[#9da6b9] mt-2">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => setTab('register')}
              className="font-medium text-primary hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-1">Nombre</p>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-3 text-sm sm:text-base font-normal leading-normal"
                placeholder="Tu nombre"
              />
            </label>
            <label className="flex flex-col">
              <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-1">Apellido</p>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-3 text-sm sm:text-base font-normal leading-normal"
                placeholder="Tu apellido"
              />
            </label>
          </div>

          <label className="flex flex-col">
            <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-1">Correo electrónico</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-3 text-sm sm:text-base font-normal leading-normal"
              placeholder="tu@email.com"
            />
          </label>

          <label className="flex flex-col">
            <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-1">Contraseña</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-3 text-sm sm:text-base font-normal leading-normal"
              placeholder="Crea una contraseña segura"
            />
            {password && (
              <div className="mt-2 text-xs">
                {(() => {
                  const { label, level } = getPasswordStrength(password)
                  return (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-[#222838] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            level === 'weak'
                              ? 'bg-red-500 w-1/3'
                              : level === 'medium'
                                ? 'bg-amber-500 w-2/3'
                                : 'bg-emerald-500 w-full'
                          }`}
                        />
                      </div>
                      <p className="text-gray-500 dark:text-[#9da6b9]">Fuerza de la contraseña: {label}</p>
                    </div>
                  )
                })()}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-[#9da6b9] mt-1">
              La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.
            </p>
          </label>

          <label className="flex flex-col">
            <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-1">Confirmar contraseña</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-3 text-sm sm:text-base font-normal leading-normal"
              placeholder="Repite tu contraseña"
            />
          </label>

          <label className="flex flex-col">
            <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal pb-1">Teléfono (opcional)</p>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-[#3b4354] bg-gray-50 dark:bg-[#101622] h-11 placeholder:text-gray-400 dark:placeholder:text-[#9da6b9] px-3 text-sm sm:text-base font-normal leading-normal"
              placeholder="Número de contacto"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center whitespace-nowrap font-medium text-base h-11 sm:h-12 px-6 rounded-lg w-full bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-[#9da6b9] mt-2">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => setTab('login')}
              className="font-medium text-primary hover:underline"
            >
              Inicia sesión
            </button>
          </p>
        </form>
      )}
    </div>
  )
}

export default AuthForm
