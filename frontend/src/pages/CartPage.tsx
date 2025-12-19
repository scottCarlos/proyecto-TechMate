import { useEffect, useState } from 'react'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCart, updateCartItem, removeFromCart, addToCart, type CartItem } from '../services/cart'
import { getMyWishlist, removeFromWishlist, type WishlistItem } from '../services/wishlist'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const getProductImagePath = (producto: unknown): string | null => {
  if (!producto || typeof producto !== 'object') return null
  const p = producto as Record<string, unknown>
  const raw =
    (p.imagen as string | null | undefined) ??
    (p.imagen_url as string | null | undefined) ??
    (p.imagenUrl as string | null | undefined) ??
    (p.image_url as string | null | undefined)

  return typeof raw === 'string' && raw.trim() ? raw : null
}

const resolveImageUrl = (url?: string | null) => {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url

  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
}

interface StoredAuth {
  token: string
}

const CartPage: FC = () => {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [wishlistError, setWishlistError] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('auth')
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as StoredAuth
      if (parsed.token) setToken(parsed.token)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      setError(null)
      try {
        const cart = await getMyCart(token)
        setItems(cart)
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  useEffect(() => {
    const loadWishlist = async () => {
      if (!token) return
      setWishlistLoading(true)
      setWishlistError(null)
      try {
        const data = await getMyWishlist(token)
        setWishlist(data)
      } catch (e) {
        setWishlistError((e as Error).message)
      } finally {
        setWishlistLoading(false)
      }
    }

    void loadWishlist()
  }, [token])

  const handleChangeQuantity = async (productId: number, newQty: number) => {
    if (!token) return
    try {
      await updateCartItem(token, productId, newQty)
      setItems((prev) =>
        prev
          .map((it) =>
            it.id_producto === productId
              ? {
                  ...it,
                  cantidad: newQty,
                }
              : it,
          )
          .filter((it) => it.cantidad > 0),
      )
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleRemove = async (productId: number) => {
    if (!token) return
    try {
      await removeFromCart(token, productId)
      setItems((prev) => prev.filter((it) => it.id_producto !== productId))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const handleWishlistAddToCart = async (productId: number) => {
    if (!token) return
    try {
      // 1) Añadir al carrito
      await addToCart(token, productId, 1)

      // 2) Eliminar de la lista de deseos en backend
      await removeFromWishlist(token, productId)

      // 3) Actualizar estado local de wishlist
      setWishlist((prev) => prev.filter((w) => w.id_producto !== productId))

      // 4) Recargar carrito para que subtotales y totales se actualicen
      const cart = await getMyCart(token)
      setItems(cart)
    } catch (e) {
      const msg = (e as Error).message
      // Mostramos el error general en la sección de carrito
      setError(msg)
    }
  }

  const handleWishlistRemove = async (productId: number) => {
    if (!token) return
    try {
      await removeFromWishlist(token, productId)
      setWishlist((prev) => prev.filter((w) => w.id_producto !== productId))
    } catch (e) {
      setWishlistError((e as Error).message)
    }
  }

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.producto.precio) || 0
    return acc + price * item.cantidad
  }, 0)

  const shipping = items.length > 0 ? 15 : 0
  const taxes = items.length > 0 ? Math.round(subtotal * 0.18 * 100) / 100 : 0
  const total = subtotal + shipping + taxes

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#212529] dark:text-white min-h-[calc(100vh-120px)]">
      <div className="relative flex h-auto w-full flex-col overflow-x-hidden">
        <main className="px-4 sm:px-6 lg:px-10 flex-1 justify-center py-8 md:py-10">
          <div className="layout-content-container flex flex-col max-w-7xl mx-auto flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-2 sm:p-4">
              <p className="text-black dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                Mi Carrito de Compras
              </p>
            </div>

            {error && (
              <p className="px-4 text-sm text-red-500 mb-3">{error}</p>
            )}

            {/* Cart + Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 sm:mt-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {loading && items.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-2">Cargando carrito...</p>
                )}

                {!loading && items.length === 0 && !error && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-2">Tu carrito está vacío.</p>
                )}

                {items.map((item) => {
                  const price = Number(item.producto.precio) || 0
                  const lineTotal = price * item.cantidad

                  const imageUrl = resolveImageUrl(getProductImagePath(item.producto))

                  return (
                    <div
                      key={item.id_carrito}
                      className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-white/10"
                    >
                      <div className="w-24 h-24 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.producto.nombre}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.onerror = null
                              target.src = '/img/placeholder-product.png'
                            }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-gray-400 text-2xl">image</span>
                        )}
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-black dark:text-white">{item.producto.nombre}</h3>
                        {item.producto.descripcion && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.producto.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-black dark:text-white"
                          onClick={() => handleChangeQuantity(item.id_producto, item.cantidad - 1)}
                        >
                          -
                        </button>
                        <input
                          className="w-12 text-center bg-transparent border border-gray-300 dark:border-white/20 rounded text-sm"
                          type="text"
                          readOnly
                          value={item.cantidad}
                        />
                        <button
                          type="button"
                          className="p-1 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-black dark:text-white"
                          onClick={() => handleChangeQuantity(item.id_producto, item.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="w-24 text-center sm:text-right">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Precio unitario</p>
                        <p className="font-bold text-black dark:text-white text-sm">S/ {price.toFixed(2)}</p>
                      </div>
                      <div className="w-24 text-center sm:text-right">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Total</p>
                        <p className="font-bold text-black dark:text-white text-sm">S/ {lineTotal.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        className="flex items-center justify-center h-9 w-9 rounded-lg bg-transparent text-red-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-colors"
                        onClick={() => handleRemove(item.id_producto)}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <aside className="lg:col-span-1">
                <div className="bg-white dark:bg-background-dark p-6 rounded-lg border border-gray-200 dark:border-white/10 lg:sticky lg:top-6">
                  <h2 className="text-black dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4 border-b border-gray-200 dark:border-white/10">
                    Resumen del pedido
                  </h2>
                  <div className="py-4 space-y-2 border-b border-gray-200 dark:border-white/10">
                    <div className="flex justify-between gap-x-6">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Subtotal</p>
                      <p className="text-black dark:text-white text-sm font-normal leading-normal text-right">
                        S/ {subtotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between gap-x-6">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Envío</p>
                      <p className="text-black dark:text-white text-sm font-normal leading-normal text-right">
                        S/ {shipping.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between gap-x-6">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Impuestos</p>
                      <p className="text-black dark:text-white text-sm font-normal leading-normal text-right">
                        S/ {taxes.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="py-4">
                    <div className="flex justify-between gap-x-6">
                      <p className="text-black dark:text-white text-lg font-bold leading-normal">Total</p>
                      <p className="text-black dark:text-white text-lg font-bold leading-normal text-right">
                        S/ {total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    className="w-full flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 px-6 hover:bg-primary/90 transition-colors"
                  >
                    Proceder al pago
                  </button>
                </div>
              </aside>
            </div>

            {/* Wishlist Section */}
            <div className="mt-10 sm:mt-12">
              <div className="flex flex-wrap justify-between gap-3 p-2 sm:p-4">
                <h2 className="text-black dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.033em]">
                  Tu lista de deseos
                </h2>
              </div>

              {wishlistError && (
                <p className="px-4 text-xs text-red-500 mb-2">{wishlistError}</p>
              )}

              {wishlistLoading && wishlist.length === 0 && (
                <p className="px-4 text-sm text-gray-500 dark:text-gray-400">Cargando lista de deseos...</p>
              )}

              {!wishlistLoading && wishlist.length === 0 && !wishlistError && (
                <p className="px-4 text-sm text-gray-500 dark:text-gray-400">
                  Aún no tienes productos en tu lista de deseos.
                </p>
              )}

              {wishlist.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4 sm:mt-6">
                  {wishlist.map((item) => {
                    const imageUrl = resolveImageUrl(getProductImagePath(item.producto))

                    return (
                      <div
                        key={item.id_lista}
                        className="bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-white/10 flex flex-col"
                      >
                        <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded mb-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.producto.nombre}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.onerror = null
                                target.src = '/img/placeholder-product.png'
                              }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h3 className="font-bold text-lg text-black dark:text-white line-clamp-2">
                            {item.producto.nombre}
                          </h3>
                          <p className="font-bold text-primary mt-1">
                            S/ {Number(item.producto.precio || 0).toFixed(2)}
                          </p>
                        <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => void handleWishlistAddToCart(item.id_producto)}
                            className="flex-1 flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-primary/90 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                            <span>Añadir al carrito</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleWishlistRemove(item.id_producto)}
                            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-gray-200/50 dark:bg-white/5 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-3"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CartPage
