import type { FC } from 'react';

export const STORE_ADDRESS = {
  name: 'Tienda Principal Miraflores',
  street: 'Av. José Larco 123',
  city: 'Miraflores',
  state: 'Lima',
  postal_code: '15074',
  country: 'Perú',
  phone: '+51 123 456 789',
  email: 'tienda@techmate.com',
  schedule: 'Lunes a Sábado: 9:00 AM - 9:00 PM',
  coordinates: {
    lat: -12.1194,
    lng: -77.0282
  }
};

const AboutPage: FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-[calc(100vh-120px)]">
      <div className="relative flex w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-6">
            <div className="layout-content-container flex w-full max-w-[960px] flex-1 flex-col">
              <main className="flex-1">
                {/* Hero Section */}
                <div className="@container py-4 md:py-6">
                  <div className="@[480px]:p-4">
                    <div
                      className="flex min-h-[360px] md:min-h-[420px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4 md:p-8 text-center"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(16, 22, 34, 0.78) 0%, rgba(16, 22, 34, 0.85) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAozhX9Vzuii1y7fl8Fy42xFWI19fFLAf7yB2p53_OfJCCHJWPMwrS8FPspeYTvk4oDAKrUb9-jEVHa2GuHfy-qBd68F35wMTFzDovT9lQmYs1KLXBE1ydLVcNin9xOBQnmorS4l9T6u2tKYFFEJJURd0vF317SlrnzF6-IMKf1xxE1dn1qVY-QNUPEqoL3-mqhnQM2X1bhH1TsYnN_hBEUlUN41Qhg7Pvx3x77qkjtQTAnoFkelxWDAkOCIhbtJR96TrfeboN1LkI")',
                      }}
                    >
                      <div className="flex flex-col gap-3 max-w-2xl">
                        <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">
                          Innovación y Pasión por la Tecnología
                        </h1>
                        <h2 className="text-gray-300 text-sm md:text-base font-normal leading-relaxed">
                          Descubre la historia detrás de nuestra dedicación a ofrecerte las últimas novedades en laptops,
                          PCs, smartphones, equipos gaming, soluciones de audio y video, productos de hogar inteligente,
                          y lo mejor en redes y almacenamiento. En TechMate, estamos aquí para potenciar tu futuro digital.
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nuestros Pilares */}
                <section className="mt-6 md:mt-8">
                  <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-1 sm:px-0 pb-3">
                    Nuestros Pilares
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 md:gap-6 py-2">
                    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark p-4">
                      <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold leading-tight">Misión</h3>
                        <p className="text-sm font-normal leading-relaxed text-text-muted-light dark:text-text-muted-dark">
                          Ofrecer la mejor y más completa selección de tecnología con un servicio excepcional y
                          asesoramiento experto, haciendo que la innovación sea accesible para todos y potenciando el
                          futuro digital de nuestros clientes.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark p-4">
                      <span className="material-symbols-outlined text-primary text-2xl">visibility</span>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold leading-tight">Visión</h3>
                        <p className="text-sm font-normal leading-relaxed text-text-muted-light dark:text-text-muted-dark">
                          Ser el e-commerce líder y de mayor confianza en la región, reconocido por la excelencia en el
                          servicio y la vanguardia en productos, desde equipos de gaming de alto rendimiento hasta
                          soluciones avanzadas de hogar inteligente y redes.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-card-light dark:bg-card-dark p-4">
                      <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-base font-bold leading-tight">Valores</h3>
                        <ul className="space-y-1 text-sm font-normal leading-relaxed text-text-muted-light dark:text-text-muted-dark list-disc list-inside">
                          <li>
                            <span className="font-semibold">Compromiso con la Calidad:</span> Solo ofrecemos productos que
                            cumplen con los más altos estándares.
                          </li>
                          <li>
                            <span className="font-semibold">Pasión por la Innovación:</span> Nos mantenemos a la vanguardia
                            de las últimas tendencias en laptops, smartphones y almacenamiento.
                          </li>
                          <li>
                            <span className="font-semibold">Integridad Inquebrantable:</span> Transparencia y honestidad en
                            cada interacción.
                          </li>
                          <li>
                            <span className="font-semibold">Enfoque en el Cliente:</span> Tu satisfacción y crecimiento
                            digital es nuestro motor.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Conoce al Equipo */}
                <section className="mt-8 md:mt-10">
                  <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-1 sm:px-0 pb-3">
                    Conoce al Equipo
                  </h2>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 py-2">
                    <div className="flex flex-col items-center text-center gap-3 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <img
                        className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuApWjjgQ7Tl4RyRSrEkTlt_Wr_VuPUBo9JbVJ-dNlCqnURUyuvRnj5oH1dNS7k2nKi8XwRxzWyaTLn3DFvjhkMB0LPRT06KhrA-3f0Sm9gQEBFARZqXQG3a2w-TKARNQJETdKgBYrpNFBCkVhHTnxHcnZijdfpW9BvJgj8mgpQTvm-AHfbjNa2plfH17ZP2wWDcOxt5jdmoCo1jDn1lGj8w82GFUSajOoKi9AopRvzSSvQYqngE86VxQ29jYB9I46qqht6vL9nayHY"
                        alt="Foto de perfil de Ana García"
                      />
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold">Ana García</h4>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark">
                          CEO &amp; Fundadora
                        </p>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mt-1">
                          Impulsada por la visión de hacer la tecnología accesible, Ana lidera TechMate con una dedicación
                          inquebrantable a la innovación y la calidad. Su pasión por el sector es el motor de nuestra empresa.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <img
                        className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzLlAjiHR7pqAJ7nRzdNw_wQjsZsQjfKLVfvd7WMI7q3rb9LKF1aq09-f7ZtT_5A3qfo1JC2zqbJuW8nSzAEQvSULs6Q-o_0-Gvs6-I4HXKohdZD6M-M0P_i6QOINbpTvXqVlzzenOTa6bR-wMUCEeMHjqDf4kyYlT55-VFkNS_TqyUU67ABBM1q8Zigqi_ERxsIVoxuZRB3Mdd2JcZwokZ81-yJ848OQYlYSmvy_nnWUJ-Oc2vK-I3fVreFhkWgvp-9nmi-s7C6M"
                        alt="Foto de perfil de Carlos Rodriguez"
                      />
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold">Carlos Rodriguez</h4>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark">
                          Director de Tecnología (CTO)
                        </p>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mt-1">
                          El cerebro detrás de la selección de productos. Carlos asegura que solo lo último en PCs, redes y
                          audio y video llegue a nuestro catálogo, garantizando la excelencia técnica y el rendimiento.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <img
                        className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9YwOHms0K7IxnKu_ZRqlpCqmFm-fQexV0nXOjIsMtDyU7Kkssk2lsPcEFuEBk7LvWQNExy1h1AFLafYvolpvvGAlsVUE_THAo5XI3QnYU44ROsmKpeOnkv03Oj5W6QeaPl5ulpMuv729VyMnoiFg2eQk9zAU_7_D67eeUwb0BQZn73sddXTYxu3fg1jnIt6KkPk4SEfxbY6kp7Rs1l9aOY-Tz21fDDg1GxdWrtk1uU0_hzH2XU1cb1bifMxhVd_IS0nbtas50Vfo"
                        alt="Foto de perfil de Luis Martinez"
                      />
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold">Luis Martinez</h4>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark">
                          Jefe de Operaciones (COO)
                        </p>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mt-1">
                          Luis es el encargado de que tu experiencia de compra sea impecable, desde que navegas por nuestra
                          web hasta que recibes tu nuevo equipo de gaming o hogar inteligente. Eficiencia y logística en cada
                          paso.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center gap-3 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <img
                        className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpHyGT4lpPDulXUs04qy0qHoQllPLqdg0Z-c-nOA04hw3aXrCFrmL_ZGKtxusggAKb0y_Hi0TUSrok5HGMfohhLvMtPijYh0-_ibuZaDUhNrd5y1vAjz7F6HRhM9Y9Dax5hPoyMwlX_tgHABB8jJ9xTcnFYRRr00IPZbQyeDQw25TZGVZBMBHwncOxq1x71LAIkY7LWy-SPDA1cUHEkWxzdnZxWxD_xSlLPI3dATlxCg_0XIZ0beOnptFWAXwO1hrwDLJH8XuT0O4"
                        alt="Foto de perfil de Sofía Hernandez"
                      />
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold">Sofía Hernandez</h4>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark">
                          Directora de Marketing
                        </p>
                        <p className="text-xs md:text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed mt-1">
                          Sofía se dedica a conectar a nuestros clientes con la tecnología que realmente necesitan. Comunica
                          el valor de nuestros laptops, smartphones y soluciones de almacenamiento de una manera clara y
                          emocionante.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Ubicación de la Tienda */}
                <section className="mt-8 md:mt-10">
                  <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-1 sm:px-0 pb-3">
                    Nuestra Tienda Principal
                  </h2>
                  <div className="bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-bold mb-4">{STORE_ADDRESS.name}</h3>
                        <div className="space-y-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                          <p>{STORE_ADDRESS.street}</p>
                          <p>{STORE_ADDRESS.city}, {STORE_ADDRESS.state} {STORE_ADDRESS.postal_code}</p>
                          <p>{STORE_ADDRESS.country}</p>
                          <p className="mt-4">
                            <span className="font-medium">Teléfono:</span> {STORE_ADDRESS.phone}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {STORE_ADDRESS.email}
                          </p>
                          <p className="mt-2">{STORE_ADDRESS.schedule}</p>
                        </div>
                      </div>
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${STORE_ADDRESS.coordinates.lat},${STORE_ADDRESS.coordinates.lng}&zoom=15`}
                          allowFullScreen
                          title="Ubicación de la tienda"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CTA Section */}
                <section className="mt-10 md:mt-12 mb-8">
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 p-6 md:p-8 text-center">
                    <h3 className="text-lg md:text-xl font-bold">
                      Transforma tu vida digital con TechMate
                    </h3>
                    <p className="text-sm md:text-base text-text-muted-light dark:text-text-muted-dark max-w-xl">
                      Descubre las últimas innovaciones en Smartphones, Laptops, PCs, Gaming, Audio y Video, Hogar
                      Inteligente, Redes y Almacenamiento. Encuentra la tecnología perfecta para alcanzar tus metas, sea
                      para el trabajo, el entretenimiento o tu vida diaria.
                    </p>
                    <button className="flex min-w-[84px] max-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 md:h-12 px-5 bg-primary text-white text-sm md:text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors mt-2">
                      <span className="truncate">Explora nuestros productos de vanguardia</span>
                    </button>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
