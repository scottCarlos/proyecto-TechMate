import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, type Product } from '../services/products'

function HomePage() {
  const navigate = useNavigate()
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brokenImages, setBrokenImages] = useState<Record<number, true>>({})

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/api\/?$/, '')

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await getProducts();
        
        // Ensure ratings are properly formatted as numbers
        const productsWithRatings = products.map(p => ({
          ...p,
          calificacion_promedio: p.calificacion_promedio != null 
            ? parseFloat(String(p.calificacion_promedio))
            : 0,
          total_resenas: p.total_resenas || 0
        }));

        // Sort by rating in descending order and take top 4
        const sorted = [...productsWithRatings].sort((a, b) => 
          (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0)
        );
        
        setTopProducts(sorted.slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    
    load()
  }, [])

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-5">
            <div className="flex flex-col max-w-screen-xl flex-1">
              <main className="mt-4 md:mt-8">
                {/* HeroSection */}
                <div className="@container">
                  <div className="p-0 @[480px]:p-4">
                    <div
                      className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 rounded-xl items-start justify-end px-6 pb-10 @[480px]:px-10"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfRP4X5QOaKcm0Lpxtx1tMGa8_26L8yTc2IKOYis8qoOoE8JOv2SktrCbbwBzKh4PPZpruFzRVN_Tl7K7UU05VjtVl8hH7kiLFqpFUzo8RJFW5mtD4GPMYaMSC4ZBlYp1yEC3838hUcYFHygYjjpzdQY444xVA4KoBtfAcSXziHo8ZpY_e0m2l9OjBTsEX-yzh_Teqk4rEoyi3uTZPhZsygV6abmxEQFT6EsEruZtN5om4gIoAiITrHcMh4-9dJQPQ5sYC1hleUEA")',
                      }}
                    >
                      <div className="flex flex-col gap-2 text-left max-w-xl">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                          La Nueva Era de la Conectividad
                        </h1>
                        <h2 className="text-gray-200 text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                          Descubre el smartphone de última generación que lo cambia todo. Rendimiento sin precedentes y un diseño que te cautivará.
                        </h2>
                      </div>
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-primary/90 transition-colors">
                        <span className="truncate">Descúbrelo</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SectionHeader */}
                <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-12">
                  Los Más Vendidos
                </h2>

                {error && (
                  <p className="px-4 text-sm text-red-400">{error}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                  {loading && topProducts.length === 0 && (
                    <p className="col-span-full text-center text-gray-400">Cargando productos...</p>
                  )}

                  {!loading && topProducts.length === 0 && !error && (
                    <p className="col-span-full text-center text-gray-400">No hay productos disponibles.</p>
                  )}

                  {topProducts.map((p) => {
                    // Construir la URL completa de la imagen
                    const imagenPrincipal = p.imagen_principal
                      ? String(p.imagen_principal).replace(/\/api\/uploads\//, '/uploads/')
                      : null

                    const imageUrl = !brokenImages[p.id] && imagenPrincipal
                      ? imagenPrincipal.startsWith('http')
                        ? imagenPrincipal
                        : `${apiBaseUrl}${imagenPrincipal}`
                      : null
                      
                    // Obtener la calificación como número
                    const rating = p.calificacion_promedio 
                      ? parseFloat(String(p.calificacion_promedio))
                      : 0;
                    
                    const handleProductClick = () => {
                      // Navegar a la página de productos con el ID del producto
                      navigate(`/products?productId=${p.id}`)
                      // Desplazarse al inicio de la página para asegurar que el modal sea visible
                      window.scrollTo(0, 0)
                    }

                    return (
                      <div
                        key={p.id}
                        onClick={handleProductClick}
                        className="flex flex-col gap-3 pb-3 rounded-lg bg-background-light dark:bg-white/5 p-4 transition-transform hover:scale-105 h-full cursor-pointer"
                      >
                        <div 
                          className="w-full bg-center bg-cover bg-no-repeat aspect-square rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={p.nombre}
                              className="w-full h-full object-contain bg-white"
                              onError={() => {
                                setBrokenImages((prev) => ({ ...prev, [p.id]: true }))
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col">
                          <h3 className="text-gray-900 dark:text-white text-base font-medium leading-normal line-clamp-2 h-12">
                            {p.nombre}
                          </h3>
                          <p className="text-primary text-lg font-bold mt-2">
                            S/ {parseFloat(String(p.precio)).toFixed(2)}
                          </p>
                          <div className="mt-2">
                          <button 
                            className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navegar a la página de productos con el ID del producto
                              navigate(`/products?productId=${p.id}`)
                              // Desplazarse al inicio de la página para asegurar que el modal sea visible
                              window.scrollTo(0, 0)
                            }}
                          >
                            Ver producto
                          </button>
                        </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </main>

              {/* Footer */}
              <footer className="flex flex-col gap-10 px-5 py-16 text-center @container mt-16 border-t border-gray-200/50 dark:border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
                  <div className="flex flex-col gap-4 items-center sm:items-start">
                    <div className="flex items-center gap-2">
                      <div className="text-primary size-5">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
                        </svg>
                      </div>
                      <h2 className="text-gray-900 dark:text-white text-md font-bold leading-tight">TechStore</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Tu tienda de confianza para los mejores productos tecnológicos.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 items-center sm:items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Navegación</h3>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Home
                    </a>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Productos
                    </a>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Quiénes Somos
                    </a>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Contáctanos
                    </a>
                  </div>

                  <div className="flex flex-col gap-3 items-center sm:items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Legal</h3>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Términos y Condiciones
                    </a>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Política de Privacidad
                    </a>
                    <a className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal hover:text-primary dark:hover:text-primary transition-colors" href="#">
                      Política de Cookies
                    </a>
                  </div>

                  <div className="flex flex-col gap-3 items-center sm:items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contacto</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">support@techstore.com</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">+1 (234) 567-890</p>
                    <div className="flex justify-center sm:justify-start gap-4 mt-2">
                      {/* Social icons (simplificados o tal cual del HTML original) */}
                      <a className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" href="#">
                        <span className="material-symbols-outlined">alternate_email</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200/50 dark:border-white/10 pt-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                    © 2024 TechStore. Todos los derechos reservados.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
