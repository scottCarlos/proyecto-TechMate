 # TechMate – Plataforma de e-commerce de tecnología

 **Versión:** v1.0  
 **Fecha:** 2025-12-19  
 **Proyecto:** TechMate – Plataforma de e-commerce de tecnología  
 **Autor:** Jhostin Leonardo Rodriguez Neyra – Desarrollador Full Stack

 Plataforma full-stack orientada a productos tecnológicos. Permite navegar el catálogo, gestionar categorías, subir imágenes, manejar carrito y lista de deseos, gestionar pedidos y devoluciones, reseñas verificadas por compra, FAQs y soporte vía tickets. Incluye panel administrativo para métricas, usuarios, inventario (lotes e historial), pedidos/devoluciones y promociones con registro en historial.

 ---

 ## Tecnologías clave

 **Backend**
 - Node.js 20+
 - Express 5
 - PostgreSQL (`pg`)
 - JWT (`jsonwebtoken`)
 - Bcrypt
 - Multer
 - CORS
 - Dotenv
 - Nodemon

 **Frontend**
 - React 18
 - TypeScript
 - Vite

 **Base de datos**
 - PostgreSQL
 - Scripts en `database/script`

 **Infra/Operación**
 - API REST
 - Almacenamiento local de archivos en `uploads/`
 - CORS para `http://localhost:5173`

 ---

 ## Tabla de contenido

 - [Resumen ejecutivo](#resumen-ejecutivo)
 - [Objetivos y alcance](#objetivos-y-alcance)
 - [Usuarios y casos de uso](#usuarios-y-casos-de-uso)
 - [Arquitectura del sistema](#arquitectura-del-sistema)
 - [Modelo de datos](#modelo-de-datos)
 - [API REST (backend)](#api-rest-backend)
 - [Seguridad](#seguridad)
 - [Flujo de navegación (frontend)](#flujo-de-navegación-frontend)
 - [Proceso de desarrollo y calidad](#proceso-de-desarrollo-y-calidad)
 - [Despliegue y entorno](#despliegue-y-entorno)
 - [Limitaciones y trabajo futuro](#limitaciones-y-trabajo-futuro)
 - [Anexos](#anexos)
 - [Secciones extra para GitHub](#secciones-extra-para-github)

 ---

 # Resumen ejecutivo

 TechMate es una plataforma full-stack de e-commerce orientada a productos tecnológicos.

 **Perfiles de usuario**
 - Cliente
 - Agente
 - Admin

 **Principales funcionalidades**
 - Catálogo con múltiples imágenes por producto (principal + adicionales).
 - Autenticación con JWT, perfil con avatar, direcciones (principal).
 - Carrito y wishlist por usuario; pedidos; devoluciones.
 - Reseñas verificadas con relación a pedidos; estado de reseñas por pedido.
 - Soporte con tickets y mensajes (cliente/soporte).
 - Admin: métricas, usuarios, inventario (lotes/historial), pedidos, devoluciones y promociones (con reglas de solapamiento/verificación).
 - Gestión local de imágenes en `uploads/` (expuesto por backend).

 **Estado actual**
 - MVP avanzado funcional; endpoints, servicios y scripts SQL listos.

 ---

 # Objetivos y alcance

 ## 2.1 Objetivo general

 Proveer un e-commerce robusto y extensible, con operaciones administrativas clave y experiencia de usuario completa.

 ## 2.2 Objetivos específicos

 - API REST segura y modular (Express 5, JWT).
 - SPA en React + TypeScript consumiendo la API.
 - Persistencia en PostgreSQL con esquema normalizado e índices.
 - Gestión de medios (avatars, imágenes de producto) y validaciones.

 ## 2.3 Alcance

 - Backend completo (auth, users, addresses, products, categories, cart, wishlist, orders, returns, reviews, support, admin).
 - Frontend modular por servicios y páginas.
 - Scripts de BD y datos de ejemplo.

 ---

 # Usuarios y casos de uso

 ## 3.1 Perfiles de usuario

 **Admin**
 - Responsabilidades: usuarios, inventario, promociones, pedidos/devoluciones, métricas.
 - Vistas: panel admin, tablas, formularios.

 **Agente**
 - Responsabilidades: soporte y acceso a ciertas vistas/consultas administrativas (según controlador).

 **Cliente**
 - Responsabilidades: navegar catálogo, carrito, compras, reseñas, soporte, perfil y direcciones.

 ## 3.2 Casos de uso principales

 - Cliente: autenticarse, gestionar avatar/direcciones, comprar, devolver, reseñar, abrir tickets.
 - Agente: gestionar tickets, mensajería.
 - Admin: ver métricas, gestionar usuarios, aplicar descuentos por lote, registrar lotes, ver historial de inventario, gestionar pedidos y devoluciones, crear/consultar promociones.

 ---

 # Arquitectura del sistema

 ## 4.1 Vista general

 Cliente (React + TS) → API REST (Express) → PostgreSQL

 - **CORS**: `http://localhost:5173`
 - **Estáticos**: `uploads/` (avatars/products) servidos por backend

 ## 4.2 Tecnologías usadas

 - Backend: `express`, `pg`, `jsonwebtoken`, `bcrypt`, `multer`, `cors`, `dotenv`, `nodemon`
 - Frontend: `react`, `typescript`, `vite`
 - Scripts SQL: DDL completo + datos

 ## 4.3 Estructura del backend

 - `app.js`: CORS, JSON, estáticos (`/uploads`), health check y registro de rutas.
 - `server.js`: arranque, test de conexión a BD.
 - `config/configuration.js`: lectura de `.env` (`PORT`, `DB_*`, `JWT_SECRET`).
 - `database/connection.js`: `Pool` pg, helpers `query`/`testConnection`.
 - `middlewares/auth.js`: verify JWT (`Authorization: Bearer`), attach `req.user`, `generateToken`.
 - `routes/*.routes.js`: definición de endpoints por módulo.
 - `controllers/*.controller.js`: lógica de negocio, validaciones, queries pg.
 - `uploads/`:
   - `avatars/` (`n.jpg`)
   - `products/` (`productId-timestamp-original.ext`)

 ## 4.4 Estructura del frontend

 - `src/services`: módulos API (auth, user, address, products, cart, wishlist, orders, admin, promotions, reviews, support, categories, etc.).
 - `src/pages`: pantallas.
 - `src/components`: UI.
 - `src/contexts`: estado global.
 - Vite para desarrollo y build.

 ---

 # Modelo de datos

 Basado en `database/script/dll.sql`, con tipos `ENUM` para dominios de negocio.

 ## 5.1 Enumeraciones

 - `user_role`: Cliente | Agente | Admin
 - `order_status`: Pendiente | Procesando | Enviado | Entregado | Cancelado
 - `payment_method`: Tarjeta | PayPal | Transferencia
 - `payment_status`: Pendiente | Aprobado | Rechazado | Reembolsado
 - `return_status`: Solicitada | Aprobada | Rechazada | Completada
 - `review_status`: Pendiente | Aprobada | Rechazada
 - `discount_type`: Porcentaje | Monto_Fijo
 - `ticket_priority`: Baja | Media | Alta | Urgente
 - `ticket_status`: Abierto | En_Proceso | Resuelto | Cerrado
 - `inventory_movement_type`: Entrada | Salida | Ajuste_Positivo | Ajuste_Negativo | Devolucion_Cliente

 ## 5.2 Tablas principales y campos

 **USUARIOS**
 - `id_usuario (PK)`, `email (unique)`, `password_hash`, `nombre`, `apellido`, `telefono`, `fecha_registro`, `rol (enum)`, `activo`, `ultima_sesion`, `url_img`

 **DIRECCIONES**
 - `id_direccion`, `id_usuario (FK)`, `calle`, `ciudad`, `estado`, `codigo_postal`, `pais (default Perú)`, `es_principal`, `nombre_direccion`

 **CATEGORIAS**
 - `id_categoria`, `nombre (unique)`, `descripcion`, `categoria_padre (FK)`, `activa`

 **PRODUCTOS**
 - `id_producto`, `id_categoria (FK)`, `nombre`, `descripcion`, `precio (decimal)`, `stock`, `sku (unique)`, `marca`, `especificaciones`, `calificacion_promedio`, `total_resenas`, `activo`, `fecha_creacion`

 **INVENTARIO**
 - `id_inventario`, `id_producto (unique FK)`, `cantidad_disponible`, `cantidad_reservada`, `stock_minimo`, `ultima_actualizacion`

 **MOVIMIENTOS_INVENTARIO**
 - `id_movimiento`, `id_producto (FK)`, `tipo_movimiento (enum)`, `cantidad`, `fecha_movimiento`, `id_usuario_registro (FK)`, `referencia_externa`

 **IMAGENES_PRODUCTO**
 - `id_imagen`, `id_producto (FK)`, `url_imagen`, `es_principal`, `orden`

 **CARRITO**
 - `id_carrito`, `id_usuario (FK)`, `id_producto (FK)`, `cantidad`, `fecha_agregado`
 - Unique: (`id_usuario`, `id_producto`)

 **LISTA_DESEOS**
 - `id_lista`, `id_usuario (FK)`, `id_producto (FK)`, `fecha_agregado`
 - Unique: (`id_usuario`, `id_producto`)

 **PEDIDOS**
 - `id_pedido`, `id_usuario (FK)`, `id_direccion (FK)`, `subtotal`, `impuestos`, `total`, `estado (enum)`, `fecha_pedido`, `fecha_entrega`, `notas`

 **DETALLE_PEDIDO**
 - `id_detalle`, `id_pedido (FK)`, `id_producto (FK)`, `cantidad`, `precio_unitario`, `subtotal`

 **PAGOS**
 - `id_pago`, `id_pedido (unique FK)`, `metodo_pago (enum)`, `monto`, `estado (enum)`, `transaccion_id (unique)`, `fecha_pago`

 **DEVOLUCIONES**
 - `id_devolucion`, `id_pedido (FK)`, `motivo`, `estado (enum)`, `monto_reembolso`, `fecha_solicitud`, `fecha_resolucion`

 **RESENAS**
 - `id_resena`, `id_producto (FK)`, `id_usuario (FK)`, `id_pedido (FK)`, `calificacion (1-5)`, `titulo`, `comentario`, `compra_verificada`, `votos_utiles`, `votos_no_utiles`, `estado (enum)`, `fecha_publicacion`, `fecha_moderacion`
 - Unique: (`id_usuario`, `id_producto`, `id_pedido`)

 **IMAGENES_RESENA, VALORACIONES_RESENA**
 - Soporte para contenido visual y votos a reseñas.

 **PROMOCIONES, PRODUCTOS_PROMOCIONES**
 - PROMOCIONES: `codigo (unique)`, `tipo_descuento (enum)`, `valor_descuento`, `fecha_inicio/fin`, `usos_maximos/actuales`, `activa`
 - PRODUCTOS_PROMOCIONES (N:M), Unique: (`id_producto`, `id_promocion`)

 **TICKETS_SOPORTE, MENSAJES_TICKET**
 - Tickets con prioridad/estado y mensajes asociados.

 **FAQS**
 - Preguntas frecuentes (categoría opcional, orden y activa).

 **LOGS_SISTEMA, HISTORIAL_PRECIOS**
 - Log de acciones y tracking de precios de productos.

 ## 5.3 Índices y claves

 - Unicidad en: `USUARIOS.email`, `PRODUCTOS.sku`, `RESENAS (id_usuario, id_producto, id_pedido)`, `PAGOS.id_pedido` y `transaccion_id`, `PRODUCTOS_PROMOCIONES (id_producto, id_promocion)`.
 - Índices por FK y campos de consulta (estados, fechas, activos, etc.).

 ---

 # API REST (backend)

 ## 6.1 Convenciones generales

 - **Base URL**: `/api/...`
 - **Formato**: JSON
 - **Auth**: `Authorization: Bearer <token>`
 - **CORS**: origin `http://localhost:5173`, `credentials: true`, `allowedHeaders: Content-Type, Authorization`
 - **Rutas públicas**: health, ciertos listados (p.ej., productos/FAQs); resto requiere JWT.

 ## Sistema

 - `GET /health` → `{ "status": "ok" }`

 ## Autenticación (`/api/auth`) — `auth.controller.js`

 - `POST /login`
   - Body: `{ email, password, portal? }`
   - Respuesta: `{ token, user: { id, email, nombre, apellido, rol, url_img, foto } }`
   - Validaciones: email y password obligatorios; usuario activo; `bcrypt.compare`; `portal=client` exige rol `Cliente`.

 - `POST /register`
   - Body: `{ email, password, confirmPassword, nombre, apellido, telefono? }`
   - Reglas password: ≥8, mayúscula, minúscula, número.
   - Valida email único. `bcrypt.hash(10)`.
   - Devuelve token y datos de usuario.

 - `POST /change-password` (auth)
   - Body: `{ currentPassword, newPassword, confirmPassword }`
   - Valida fuerza de contraseña y coincidencia; verifica hash actual; actualiza hash.

 ## Usuario (`/api/users`) — `user.controller.js`

 - `GET /me` (auth): datos del usuario autenticado.
 - `PUT /me` (auth): actualización de perfil (campos soportados en controller).
 - `POST /me/last-session` (auth): actualiza `ultima_sesion`.
 - `POST /me/avatar` (auth, multipart `avatar`)
   - Guarda en `uploads/avatars/{userId}.jpg` (2MB máx, `image/*`).
   - Actualiza `USUARIOS.url_img` con `baseUrl = VITE_API_URL|API_URL` (si existe).
 - `DELETE /me/avatar` (auth)
   - Borra archivo físico si existe y limpia `url_img`.

 ## Direcciones (`/api/addresses`) — `address.controller.js`

 - `GET /` (auth): lista mis direcciones.
 - `GET /me` (auth): dirección principal.
 - `POST /me` (auth): crear/actualizar dirección.
 - `PATCH /:id/set-default` (auth): marcar principal.

 ## Productos (`/api/products`) — `product.controller.js`, `reviews.controller.js`

 - `GET /`: lista de productos (filtros según controller).
 - `POST /` (auth; rol Admin): crear producto.
 - `PUT /:id` (auth; Admin): actualizar.
 - `DELETE /:id` (auth; Admin): eliminar.
 - `GET /:id/reviews`: reseñas del producto.

 **Imágenes de producto**
 - `POST /:id/images` (auth; Admin; Multer)
   - Hasta 4 imágenes, 5MB c/u, `image/*`.
   - Nombre: `{id}-{timestamp}-{safeName}`.
   - Si no hay principal, marca la primera subida como principal.
   - Inserta en `IMAGENES_PRODUCTO`.
   - Retorna `{ images: [...] }`.
 - `GET /:id/images`: obtiene imágenes (principal primero).
 - `DELETE /images/:imageId` (auth; Admin): borra imagen y archivo si existe.
 - `POST /images/:imageId/principal` (auth; Admin): marca una como principal (desmarca el resto).

 ## Categorías (`/api/categories`) — `category.controller.js`

 - `GET /`
 - `POST /` (auth; Admin)
 - `DELETE /:id` (auth; Admin)

 ## Carrito (`/api/cart`) — `cart.controller.js` (auth obligatorio en router)

 - `GET /`
 - `POST /`
 - `PUT /:productId`
 - `DELETE /:productId`
 - `DELETE /`

 ## Wishlist (`/api/wishlist`) — `wishlist.controller.js` (auth obligatorio)

 - `GET /`
 - `POST /`
 - `DELETE /:productId`

 ## Pedidos (`/api/orders`) — `order.controller.js`

 - `GET /` (auth): pedidos del usuario.
 - `GET /:id` (auth): detalle del pedido del usuario.
 - `POST /` (auth): crear pedido (usa dirección del usuario; ver reglas en controller).
 - `POST /:id/return` (auth): solicitar devolución.
 - `GET /:id/return` (auth): ver devolución asociada.

 ## Reseñas (`/api/reviews`) — `reviews.controller.js`

 - `GET /order/:id/status` (auth): estado/elegibilidad de reseñas por pedido.
 - `POST /from-order` (auth): crear reseña verificada (por pedido).

 ## Soporte (`/api/support`) — `support.controller.js`

 - `GET /tickets/mine` (auth)
 - `GET /tickets/:id/messages` (auth)
 - `POST /tickets/:id/messages` (auth)

 ## Admin (`/api/admin`) — `admin.controller.js`, `order.controller.js`

 - `GET /stats/overview` (auth; Admin/Agente según controller)
 - `GET /users` (auth; Admin)
 - `POST /users` (auth; Admin)
 - `DELETE /users/:id` (auth; Admin)
 - `POST /products/batch-discount` (auth; Admin): aplicar descuento masivo.
 - `POST /products/:id/lot` (auth; Admin): registrar lote (mínimo 20 unidades).
 - `GET /inventory/history` (auth; Admin/Agente): historial (limit <= 200; default 50).
 - `GET /orders` (auth; Admin)
 - `GET /orders/:id` (auth; Admin)
 - `PATCH /orders/:id/status` (auth; Admin)
 - `GET /returns` (auth; Admin)
 - `PATCH /returns/:id/status` (auth; Admin)

 **Promociones**
 - `GET /promotions` (auth; Admin/Agente)
 - `POST /promotions` (auth; Admin)
   - Validaciones:
     - Código único.
     - `tipo_descuento` ∈ {`Porcentaje`, `Monto_Fijo`}.
     - `valor_descuento > 0`.
     - Fechas: inicio ≥ hoy; fin > inicio.
     - `productIds`: existentes, >0, sin promociones activas vigentes.
   - Efectos:
     - Inserta `PROMOCIONES` y asocia en `PRODUCTOS_PROMOCIONES`.
     - Calcula y actualiza precio del producto (no negativo).
     - Inserta en `HISTORIAL_PRECIOS` motivo `Aplicación de promoción: {codigo}`.
     - Respuesta: promoción y `json_agg` de productos asociados.

 ## 6.3 Validaciones y reglas de negocio clave

 **Autenticación y rol**
 - `authMiddleware` exige `Authorization: Bearer ...`.
 - Admin-only: creación/edición de productos/categorías, imágenes de productos, lotes e inventario, promociones, gestión global de usuarios, pedidos, devoluciones.
 - Admin/Agente: algunos listados de inventario y métricas (ver controller).

 **Subida de archivos**
 - Avatar: 2MB máx, `image/*`, nombre `{userId}.jpg`, carpeta `uploads/avatars`.
 - Productos: hasta 4 imágenes; 5MB c/u; `image/*`; carpeta `uploads/products`; marca principal si no existe.

 **Promociones**
 - Evita solapamiento sobre productos con promos activas.
 - Recalcula precio producto (Porcentaje o Monto_Fijo), nunca negativo.

 **Inventario**
 - Registrar lotes requiere cantidad mínima 20 unidades.

 **Contraseñas**
 - Registro y cambio: ≥8, mayúscula, minúscula, número.

 **Errores comunes**
 - 400: entradas inválidas
 - 401: token inválido/ausente
 - 403: rol sin permiso
 - 404: no encontrado
 - 409: conflicto (email duplicado)
 - 500: error servidor

 ## 6.4 Códigos de estado

 - 200 OK, 201 Created, 204 No Content
 - 400 Bad Request, 401 Unauthorized, 403 Forbidden
 - 404 Not Found, 409 Conflict
 - 500 Internal Server Error

 ---

 # Seguridad

 - Autenticación: JWT (`jsonwebtoken`), expiración 1h por defecto.
 - Autorización: chequeos de `req.user.rol` en controladores sensibles (Admin/Agente).
 - CORS: origin `http://localhost:5173`, `credentials: true`, headers `Content-Type`/`Authorization`.
 - Passwords: `bcrypt.hash` / `bcrypt.compare`.
 - Archivos: validación `mimetype` y tamaño con Multer.

 **Recomendaciones (futuras)**
 - Rate limiting.
 - Refresh tokens e invalidación de tokens.
 - Helmet.
 - Validación exhaustiva de inputs (cele/zod).
 - Logs estructurados.

 ---

 # Flujo de navegación (frontend)

 **Cliente**
 - Home → Catálogo → Detalle → Carrito → Checkout (dirección principal) → Pedido
 - Mi Cuenta → Perfil (avatar, datos) → Direcciones (principal) → Pedidos y Devoluciones
 - Reseñas: desde pedido; estado elegibilidad por pedido
 - Soporte → Tickets → Mensajes

 **Agente**
 - Panel de soporte: tickets asignados, mensajería

 **Admin**
 - Panel Admin → Usuarios
 - Inventario: registrar lotes, ver historial
 - Pedidos/Devoluciones: gestión de estado
 - Promociones: creación y listado
 - Métricas generales

 **Servicios (frontend)**
 - Ubicación: `frontend/src/services`
 - Módulos: `auth.ts`, `user.ts`, `address.service.ts`, `products.ts`, `cart.ts`, `wishlist.ts`, `order.ts`, `order.service.ts`, `reviews.ts`, `support.ts`, `admin.ts`, `promotions.ts`, `categories.ts`, `faqs.ts`, etc.
 - `api.ts`: configuración base (headers con `Authorization`).

 ---

 # Proceso de desarrollo y calidad

 - Control de versiones: Git.
 - Estilo backend:
   - Express modular por router/controller.
   - Middlewares.
   - Configuración por dotenv.
   - Separación de conexión PG y queries.
 - Estilo frontend:
   - Servicios desacoplados.
   - Componentes reutilizables.
   - Contextos de estado.

 **Testing (pendiente)**
 - Recomendado: Jest + Supertest (backend).
 - Recomendado: React Testing Library / Playwright (frontend).

 **QA**
 - Flujos críticos: autenticación, compra, devolución, promociones, subida de imágenes, roles.

 ---

 # Despliegue y entorno

 ## 10.1 Variables de entorno (`backend/.env`)

 ```env
 PORT=
 NODE_ENV=
 DB_HOST=
 DB_PORT=
 DB_USER=
 DB_PASSWORD=
 DB_DATABASE=
 JWT_SECRET=
 API_URL=
 VITE_API_URL=
 ```

 - `API_URL` o `VITE_API_URL` se usa para construir URLs absolutas de imágenes.

 ## 10.2 Levantar localmente

 **BD**
 - Crear DB `techmate`.
 - Ejecutar:
   - `database/script/dll.sql`
   - `database/script/datos.sql`

 **Backend**
 ```bash
 npm i
 npm run dev
 ```

 - Health: `GET http://localhost:3000/health`

 **Frontend**
 ```bash
 npm i
 npm run dev
 ```

 - App: `http://localhost:5173`
 - CORS habilitado para `5173`.
 - Estáticos en `/uploads`.

 ## 10.3 Perfiles

 - `NODE_ENV`: `development` / `production`. Afecta logs/mensajes de error.

 ## 10.4 Despliegue

 **Backend**
 - Node app (PM2/Docker) detrás de Nginx/Apache reverse proxy.
 - Variables de entorno configuradas.
 - Persistencia para `uploads/` si se usa almacenamiento local.

 **Frontend**
 - `npm run build`.
 - Servir estáticos (NGINX/Netlify/Vercel).

 **BD**
 - PostgreSQL administrado (cloud u on-premise).

 **Recomendación**
 - Migrar imágenes a almacenamiento externo (S3/GCS) y servir por CDN.

 ---

 # Limitaciones y trabajo futuro

 ## Limitaciones actuales

 - Paginación/filtros avanzados no uniformes en todas las listas.
 - No hay integración con pasarela de pagos real (modelo preparado).
 - Falta suite de tests automatizados y pipeline CI/CD.
 - Autorización por rol genérico; falta RBAC granular.

 ## Trabajo futuro

 - OpenAPI/Swagger y clientes generados.
 - Paginación y filtros consistentes (products, orders, admin).
 - Integración pagos (Stripe/PayPal) con webhooks y conciliación.
 - Almacenamiento de imágenes en S3/GCS, CDN, expiración de URLs.
 - RBAC granular con permisos por recurso/acción.
 - Observabilidad: logs estructurados, métricas, tracing.
 - Seguridad avanzada: rate limiting, refresh tokens, rotación de secrets, Helmet.

 ---

 # Anexos

 **Scripts SQL**
 - `database/script/dll.sql`: creación de DB, ENUMs, tablas, índices, FKs
 - `database/script/datos.sql`: datos de ejemplo

 **Configuración backend (referencia)**
 - `app.js`: CORS, JSON, estáticos `/uploads`, registro de rutas y health
 - `server.js`: arranque, test de conexión
 - `configuration.js`: dotenv y mapeo de variables
 - `auth.js`: verify JWT y `generateToken`
 - `connection.js`: pg Pool, `query` y `testConnection`

 **Estáticos**
 - `uploads/avatars` y `uploads/products` expuestos en `/uploads`

 ---

 # Secciones extra para GitHub

 ## README rápido

 **Título**
 - TechMate – E-commerce de tecnología

 **Descripción breve**
 - Plataforma web para catálogo de productos tecnológicos, compras, devoluciones, reseñas, soporte y panel administrativo (usuarios, inventario, promociones, pedidos, devoluciones).

 **Tecnologías**
 - Backend: Node.js, Express 5, PostgreSQL (pg), JWT, Bcrypt, Multer, CORS, Dotenv
 - Frontend: React 18, TypeScript, Vite

 **Arquitectura (resumen)**
 - SPA React consume API REST Express.
 - Persistencia PostgreSQL.
 - JWT y CORS para seguridad de sesión.

 **Cómo ejecutar localmente**
 - BD: ejecutar `dll.sql` y `datos.sql` en DB `techmate`.
 - Backend: configurar `.env`; `npm i`; `npm run dev`; `http://localhost:3000/health`.
 - Frontend: `npm i`; `npm run dev`; `http://localhost:5173`.

 ## Arquitectura de carpetas

 - `backend/src`: `app.js`, `server.js`, `config/`, `database/`, `middlewares/auth.js`, `routes/`, `controllers/`, `uploads/`
 - `frontend/src`: `pages/`, `components/`, `services/`, `contexts/`, `config/`, `App.tsx`, `main.tsx`
 - `database/script`: `dll.sql`, `datos.sql`

 ## Endpoints principales (muestra)

 - Auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/change-password`
 - Users: `GET /api/users/me`, `PUT /api/users/me`, avatar `POST/DELETE`
 - Addresses: `GET /api/addresses`, `GET /api/addresses/me`, `POST /api/addresses/me`, `PATCH /api/addresses/:id/set-default`
 - Products: `GET/POST/PUT/DELETE /api/products`, imágenes (POST/GET/DELETE/mark principal), `GET /api/products/:id/reviews`
 - Cart/Wishlist: CRUD autenticado
 - Orders: `GET/POST /api/orders`, `GET /api/orders/:id`, return `POST/GET`
 - Reviews: `GET /api/reviews/order/:id/status`, `POST /api/reviews/from-order`
 - Support: `GET /api/support/tickets/mine`, `GET/POST /api/support/tickets/:id/messages`
 - Admin: overview, users CRUD, batch-discount, product lot, inventory history, orders, returns, promotions

 ## Autor

 Jhostin Leonardo Rodriguez Neyra  
 Desarrollador Full Stack

 ## Notas y acciones recomendadas

 - Generar OpenAPI/Swagger del backend directamente de las rutas para estandarizar consumo.
 - Añadir paginación y filtros en endpoints de listados grandes.
 - Migrar almacenamiento de imágenes a S3/GCS con URLs firmadas.
 - Incorporar tests y CI/CD.
 - Endurecer seguridad (rate limiting, refresh tokens, Helmet).
 - Publicar esta documentación en PDF/DOCX y versionarla con el código (tag v1.0).

 **Estado de entrega**
 - Documentación completa y formal generada con base en los archivos reales del proyecto TechMate: backend Express + PostgreSQL y frontend React TS.
 - Si deseas, se puede convertir a PDF/DOCX y/o agregar diagramas UML y un `openapi.yaml`.
