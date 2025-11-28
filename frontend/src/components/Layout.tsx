import { useEffect, useState, type PropsWithChildren } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { AuthUser } from '../services/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Layout({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    const loadAuth = () => {
      try {
        const stored = localStorage.getItem('auth')
        if (!stored) {
          setAuthUser(null)
          return
        }
        const parsed = JSON.parse(stored) as { user?: AuthUser | null }
        if (parsed.user) {
          setAuthUser(parsed.user)
        } else {
          setAuthUser(null)
        }
      } catch {
        setAuthUser(null)
      }
    }

    loadAuth()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'auth') {
        loadAuth()
      }
    }

    const handleAuthChanged = () => {
      loadAuth()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('auth-changed', handleAuthChanged as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('auth-changed', handleAuthChanged as EventListener)
    }
  }, [location.pathname])

  const getInitials = (user: AuthUser) => {
    const first = (user.nombre || '').trim().charAt(0)
    const last = (user.apellido || '').trim().charAt(0)
    const combined = `${first}${last}`.trim()
    if (combined) return combined.toUpperCase()
    return (user.email || '?').charAt(0).toUpperCase()
  }

  const handleLogout = async () => {
    try {
      const stored = localStorage.getItem('auth')
      let token: string | null = null
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { token?: string }
          token = parsed.token ?? null
        } catch {
          token = null
        }
      }

      if (token) {
        await fetch(`${API_URL}/api/users/me/last-session`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Si falla no bloqueamos el logout
        })
      }
    } finally {
      // Clear auth and cart from localStorage
      localStorage.removeItem('auth')
      localStorage.removeItem('cart')
      localStorage.removeItem('carItems') // Clean up old key if it exists
      
      // Clear auth user state
      setAuthUser(null)
      setIsProfileOpen(false)
      
      // Redirect to home
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-gray-200/80 dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 px-4 sm:px-6 lg:px-10 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-gray-900 dark:text-white">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/img/logo.png"
              alt="TechMate"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="hidden md:flex flex-1 justify-center items-center gap-9">
          <Link
            to="/"
            className={`${
              isActive('/')
                ? 'text-primary font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            } text-sm transition-colors`}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`$\{
              isActive('/about')
                ? 'text-primary font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            } text-sm transition-colors`}
          >
            Quienes Somos
          </Link>
          <Link
            to="/products"
            className={`${
              isActive('/products')
                ? 'text-primary font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            } text-sm transition-colors`}
          >
            Productos
          </Link>
          <Link
            to="/contact"
            className={`${
              isActive('/contact')
                ? 'text-primary font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            } text-sm transition-colors`}
          >
            Contáctanos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!authUser && (
            <Link
              to="/auth"
              state={{ from: location.pathname }}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-colors"
            >
              <span className="truncate">Iniciar Sesión</span>
            </Link>
          )}
          {authUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex p-0 h-10 w-10 items-center justify-center rounded-full overflow-hidden border border-primary/40 bg-primary/5"
              >
                {authUser.url_img && authUser.foto ? (
                  <img
                    src={authUser.url_img.startsWith('http') ? authUser.url_img : `${API_URL}${authUser.url_img}`}
                    alt={authUser.nombre}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(authUser)}
                  </span>
                )}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl bg-gray-900 dark:bg-[#1C1F27] shadow-2xl ring-1 ring-black/40 focus:outline-none z-50">
                  <div className="flex flex-col p-4">
                    {/* Info de usuario */}
                    <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-semibold overflow-hidden">
                        {authUser.url_img && authUser.foto ? (
                          <img
                            src={authUser.url_img.startsWith('http') ? authUser.url_img : `${API_URL}${authUser.url_img}`}
                            alt={authUser.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitials(authUser)
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {authUser.nombre} {authUser.apellido}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{authUser.email}</p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="mt-4 flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false)
                          navigate('/dashboard')
                        }}
                        className="group flex items-center gap-4 rounded-lg px-3 py-3 bg-transparent text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary text-left"
                      >
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-primary">
                          person
                        </span>
                        <p className="text-base font-normal leading-normal">Ver perfil</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false)
                          navigate('/orders')
                        }}
                        className="group flex items-center gap-4 rounded-lg px-3 py-3 bg-transparent text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary text-left"
                      >
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-primary">
                          inventory_2
                        </span>
                        <p className="text-base font-normal leading-normal">Mis pedidos</p>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex items-center gap-4 rounded-lg px-3 py-3 bg-transparent text-red-500 hover:bg-red-500/10 text-left"
                      >
                        <span className="material-symbols-outlined text-red-500">logout</span>
                        <p className="text-base font-normal leading-normal">Cerrar sesión</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gray-100 dark:bg-gray-900/70 text-gray-900 dark:text-white text-sm font-medium tracking-wide hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors border border-gray-200/70 dark:border-gray-700"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">shopping_cart_checkout</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
              0
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="mt-10 border-t border-gray-200/80 dark:border-gray-800 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} TechMate. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default Layout
