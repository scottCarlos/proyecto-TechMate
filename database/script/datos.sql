-- 1. INSERCIÓN DE CATEGORÍAS PADRE
-- Todas las categorías principales se insertan primero con categoria_padre = NULL.
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Informática y Computación', 'Equipos, componentes y periféricos para el hogar y la oficina.', NULL, TRUE),
('Movilidad y Smartphones', 'Dispositivos de comunicación personal y accesorios portátiles.', NULL, TRUE),
('Gaming', 'Productos dedicados al entretenimiento y videojuegos (consolas, accesorios y PCs).', NULL, TRUE),
('Audio y Video', 'Dispositivos de entretenimiento, sonido e imagen.', NULL, TRUE),
('Hogar Inteligente', 'Dispositivos conectados para la automatización y seguridad del hogar.', NULL, TRUE),
('Redes y Almacenamiento', 'Infraestructura de red y soluciones de almacenamiento de datos.', NULL, TRUE);

-- 2. INSERCIÓN DE SUBCATEGORÍAS
-- Se insertan las subcategorías referenciando el ID de su padre usando subconsultas.

-- Subcategorías de 'Informática y Computación'
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Laptops y Notebooks', 'Portátiles, 2-en-1 y ultrabooks.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Informática y Computación'), TRUE),
('PCs de Escritorio y All-in-One', 'Torres, PCs de marca y equipos compactos.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Informática y Computación'), TRUE),
('Monitores y Proyectores', 'Pantallas, monitores gaming y equipos de proyección.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Informática y Computación'), TRUE),
('Componentes de PC', 'CPUs, GPUs, RAM, Placas Base, Almacenamiento (SSD/HDD).', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Informática y Computación'), TRUE),
('Periféricos', 'Teclados, Ratones, Webcams, Alfombrillas.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Informática y Computación'), TRUE);

-- Subcategorías de 'Movilidad y Smartphones'
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Smartphones', 'Teléfonos móviles de todas las marcas y gamas.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Movilidad y Smartphones'), TRUE),
('Tablets y E-readers', 'Dispositivos de pantalla táctil y lectura electrónica.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Movilidad y Smartphones'), TRUE),
('Smartwatches y Wearables', 'Relojes inteligentes, pulseras de actividad y accesorios corporales.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Movilidad y Smartphones'), TRUE),
('Accesorios Móviles', 'Carcasas, Protectores de Pantalla, Cargadores Portátiles.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Movilidad y Smartphones'), TRUE);

-- Subcategorías de 'Gaming'
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Consolas de Videojuegos', 'PS5, Xbox Series X/S, Nintendo Switch y accesorios.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Gaming'), TRUE),
('Sillas y Escritorios Gamer', 'Mobiliario ergonómico para largas sesiones de juego.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Gaming'), TRUE),
('Auriculares y Micrófonos Gaming', 'Equipos de audio especializados para comunicación y sonido inmersivo.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Gaming'), TRUE),
('PC Gaming', 'Equipos de alto rendimiento pre-ensamblados o por piezas.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Gaming'), TRUE);

-- Subcategorías de 'Audio y Video'
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Televisores y Smart TV', 'Pantallas de alta definición, 4K, 8K, OLED/QLED.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Audio y Video'), TRUE),
('Sistemas de Sonido', 'Barras de Sonido, Equipos de Home Cinema, Altavoces.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Audio y Video'), TRUE),
('Auriculares (No Gaming)', 'Audífonos Bluetooth, Inalámbricos, con Cancelación de Ruido.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Audio y Video'), TRUE),
('Cámaras y Fotografía', 'Cámaras DSLR, Mirrorless, Drones y Cámaras de Acción.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Audio y Video'), TRUE);

-- Subcategorías de 'Hogar Inteligente'
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Asistentes de Voz', 'Altavoces inteligentes y pantallas con asistentes.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Hogar Inteligente'), TRUE),
('Seguridad y Vigilancia', 'Cámaras de seguridad, timbres inteligentes y alarmas.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Hogar Inteligente'), TRUE),
('Iluminación Inteligente', 'Bombillas y sistemas de iluminación controlados por app.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Hogar Inteligente'), TRUE),
('Pequeños Electrodomésticos Inteligentes', 'Aspiradoras robot, cafeteras y otros aparatos conectados.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Hogar Inteligente'), TRUE);

-- Subcategorías de 'Redes y Almacenamiento'
INSERT INTO "CATEGORIAS" (nombre, descripcion, categoria_padre, activa) VALUES
('Routers y Repetidores', 'Equipos para mejorar la conexión WiFi (Mesh, WiFi 6).', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Redes y Almacenamiento'), TRUE),
('Almacenamiento Externo', 'Discos Duros (HDD), SSD Portátiles y Pendrives.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Redes y Almacenamiento'), TRUE),
('Servidores NAS', 'Sistemas de almacenamiento conectado a red.', (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Redes y Almacenamiento'), TRUE);

-- FIN DEL SCRIPT DE CATEGORÍAS

-- 1. INSERCIÓN DE PRODUCTOS DE EJEMPLO (TABLA "PRODUCTOS")
-- Usamos comillas dobles solo para el nombre de la tabla.

INSERT INTO "PRODUCTOS" (id_categoria, nombre, descripcion, precio, stock, sku, marca, especificaciones, calificacion_promedio, total_resenas, activo) VALUES
(
    (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Laptops y Notebooks'),
    'Laptop UltraBook X1 Carbon Gen 10',
    'Portátil empresarial premium con procesador Intel Core i7 de última generación, ideal para trabajo remoto y alto rendimiento.',
    1899.99,
    15,
    'LTX1C10-I7',
    'TechBrand',
    '{"procesador": "Core i7", "ram": "16GB", "almacenamiento": "512GB SSD", "pantalla": "14\" OLED"}',
    4.5,
    120,
    TRUE
),
(
    (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Smartphones'),
    'Smartphone Galaxy Z Fold 4 256GB',
    'Teléfono plegable de última tecnología. Máximo rendimiento y pantalla dual. Color negro cósmico.',
    1299.00,
    22,
    'SMGZF4-256',
    'TechBrand',
    '{"pantalla_principal": "7.6\" AMOLED", "memoria": "12GB RAM", "bateria": "4400 mAh", "camara_principal": "50MP"}',
    4.8,
    85,
    TRUE
),
(
    (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Auriculares (No Gaming)'),
    'Auriculares Inalámbricos Pro X ANC',
    'Audífonos con cancelación activa de ruido (ANC) y hasta 30 horas de batería. Audio Hi-Res.',
    199.50,
    50,
    'HDPX-ANC-BLK',
    'TechSound',
    '{"tipo": "Over-Ear", "cancelacion": "Activa", "conexion": "Bluetooth 5.2", "duracion_bateria": "30 horas"}',
    4.7,
    350,
    TRUE
),
(
    (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Consolas de Videojuegos'),
    'Consola Gaming NextGen 500GB Edición Digital',
    'Consola de última generación para juegos digitales. Cargas ultra rápidas y gráficos 4K.',
    399.00,
    8,
    'CGNG-500D',
    'TechPlay',
    '{"almacenamiento": "SSD 500GB", "resolucion": "Hasta 4K", "lector_disco": "No"}',
    4.9,
    500,
    TRUE
),
(
    (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Routers y Repetidores'),
    'Router Mesh Tri-Banda WiFi 6 (Unidad Central)',
    'Sistema Mesh de alto rendimiento para cobertura total en hogares grandes. Velocidad y estabilidad.',
    249.99,
    30,
    'RMTB-W6-UC',
    'TechNet',
    '{"estandard": "WiFi 6 (802.11ax)", "bandas": "Tri-Banda", "puertos_lan": "3"}',
    4.6,
    95,
    TRUE
),
(
    (SELECT id_categoria FROM "CATEGORIAS" WHERE nombre = 'Seguridad y Vigilancia'),
    'Cámara de Seguridad Exterior 4K Pro',
    'Cámara resistente a la intemperie con visión nocturna a color y detección de movimiento avanzada.',
    110.25,
    45,
    'CSE-4K-PRO',
    'TechGuard',
    '{"resolucion": "4K UHD", "resistente": "IP67", "audio": "Doble Vía", "almacenamiento": "MicroSD/Nube"}',
    4.4,
    60,
    TRUE
);

---

-- 2. INSERCIÓN DE INVENTARIO (TABLA "INVENTARIO")

INSERT INTO "INVENTARIO" (id_producto, cantidad_disponible, stock_minimo) VALUES
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'LTX1C10-I7'), 15, 5 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'SMGZF4-256'), 22, 7 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'HDPX-ANC-BLK'), 50, 10 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'CGNG-500D'), 8, 3 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'RMTB-W6-UC'), 30, 8 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'CSE-4K-PRO'), 45, 12 );

---

-- 3. INSERCIÓN DE HISTORIAL DE PRECIOS (TABLA "HISTORIAL_PRECIOS")
-- Se asume un usuario con ID 1 ya existe en la tabla "USUARIOS".

INSERT INTO "HISTORIAL_PRECIOS" (id_producto, precio_anterior, precio_nuevo, id_usuario_cambio) VALUES
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'LTX1C10-I7'), 1899.99, 1899.99, 1 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'SMGZF4-256'), 1299.00, 1299.00, 1 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'HDPX-ANC-BLK'), 199.50, 199.50, 1 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'CGNG-500D'), 399.00, 399.00, 1 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'RMTB-W6-UC'), 249.99, 249.99, 1 ),
( (SELECT id_producto FROM "PRODUCTOS" WHERE sku = 'CSE-4K-PRO'), 110.25, 110.25, 1 );

-- FIN DEL SCRIPT CORREGIDO

INSERT INTO "FAQS" (pregunta, respuesta, orden, activa)
VALUES
('¿Cómo creo una cuenta en TechMate?', 'Solo necesitas tu correo, contraseña y algunos datos básicos. Ve a “Crear cuenta”, completa el formulario y confirma tu correo electrónico.', 1, true),
('Olvidé mi contraseña, ¿cómo la recupero?', 'Haz clic en “¿Olvidaste tu contraseña?” e ingresa tu correo. Te enviaremos un enlace para restablecerla.', 2, true),
('¿Puedo cambiar mi correo o número de teléfono?', 'Sí. En tu perfil, entra a “Configuración de la cuenta” y actualiza tus datos personales.', 3, true),
('¿Es seguro registrar mi información personal?', 'Sí. Usamos cifrado, servidores seguros y buenas prácticas para proteger tu información.', 4, true),

('¿Cómo realizo un pedido?', 'Elige un producto, agrégalo al carrito, selecciona tu dirección y método de pago, y confirma el pedido.', 5, true),
('¿Puedo modificar o cancelar un pedido?', 'Puedes cancelar o modificar solo si aún está en estado Pendiente. Una vez procesado, ya no es editable.', 6, true),
('¿Cómo rastreo mi pedido?', 'En tu cuenta, entra a “Mis pedidos” y revisa el estado en tiempo real.', 7, true),
('¿Por qué mi pedido aparece como Pendiente o Procesando?', 'Pendiente significa que aún no se procesa. Procesando indica que está siendo preparado para envío.', 8, true),

('¿Qué métodos de pago aceptan?', 'Tarjeta de crédito/débito, PayPal y transferencia bancaria.', 9, true),
('¿Es seguro pagar con tarjeta?', 'Sí. Usamos pasarelas certificadas y no almacenamos los datos de tu tarjeta.', 10, true),
('Mi pago fue rechazado, ¿qué hago?', 'Verifica saldo, datos correctos o contacta a tu banco. También puedes intentar con otro método de pago.', 11, true),
('¿Cómo solicito un reembolso?', 'Desde Mis pedidos, selecciona el pedido y solicita una devolución. El reembolso se procesa según el método de pago.', 12, true),

('¿A qué lugares realizan envíos?', 'Realizamos envíos a todo el Perú.', 13, true),
('¿Cuánto demora la entrega?', 'Entre 1 a 5 días hábiles, dependiendo de tu ubicación.', 14, true),
('¿Cuáles son los costos de envío?', 'Varían según la zona. El costo exacto aparece antes de confirmar tu compra.', 15, true),
('¿Qué pasa si no estoy en casa cuando llega mi pedido?', 'El courier realiza un segundo intento. Si no te encuentran, podrás coordinar una nueva entrega.', 16, true),

('¿Los productos tienen garantía?', 'Sí. Todos cuentan con garantía del fabricante y/o de tienda.', 17, true),
('¿Cómo sé si un producto está disponible?', 'Si aparece como “En stock”, está disponible. Si está agotado, no podrás añadirlo al carrito.', 18, true),
('¿Los productos son nuevos y originales?', 'Sí. Todos nuestros productos son 100% nuevos, sellados y originales.', 19, true),
('¿Qué significan las especificaciones del producto?', 'Son características técnicas como capacidad, compatibilidad, funciones, materiales, etc.', 20, true),

('¿Cómo solicito una devolución?', 'Ve a Mis pedidos, elige el pedido y presiona Solicitar devolución.', 21, true),
('¿En qué casos puedo pedir un reembolso?', 'Producto defectuoso, error en el envío, daños o insatisfacción dentro del plazo permitido.', 22, true),
('¿Cuánto tarda procesar una devolución?', 'Normalmente entre 3 y 7 días hábiles.', 23, true),
('¿Debo pagar por enviar el producto de vuelta?', 'Solo si la devolución no se debe a falla del producto o error de envío.', 24, true),

('¿Cómo uso un código de descuento?', 'En el carrito, ingresa el código en el campo Cupón antes de pagar.', 25, true),
('Mi cupón no funciona, ¿qué hago?', 'Verifica que esté vigente, no haya alcanzado el límite de uso o que aplique al producto.', 26, true),
('¿Los cupones tienen fecha de vencimiento?', 'Sí. Cada promoción tiene un periodo de validez.', 27, true),
('¿Puedo usar más de un cupón por pedido?', 'No. Solo puede aplicarse un cupón por compra.', 28, true),

('¿Por cuánto tiempo se guardan los productos en mi carrito?', 'Tu carrito se guarda indefinidamente, pero el stock no se reserva.', 29, true),
('¿Qué diferencia hay entre el carrito y la lista de deseos?', 'El carrito es para compras próximas; la lista es para guardar productos que te interesan.', 30, true),

('¿Cómo contacto al soporte?', 'Desde la sección Soporte o desde tu cuenta, creando un ticket.', 31, true),
('¿Cómo funciona el sistema de tickets?', 'Registras tu consulta, un agente la revisa y te responde dentro de la misma plataforma.', 32, true),
('¿Qué hago si tengo un problema con mi pedido?', 'Abre un ticket indicando el problema y el número de pedido.', 33, true),

('¿Cómo dejo una reseña?', 'En la página del producto, selecciona Escribir reseña, agrega tu calificación y comentario.', 34, true),
('¿Qué significa compra verificada?', 'Indica que la reseña fue escrita por alguien que realmente compró el producto.', 35, true),
('¿Puedo editar o eliminar mi reseña?', 'Sí, siempre que siga en estado Pendiente o Aprobada.', 36, true);



