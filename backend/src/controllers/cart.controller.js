import { query } from '../database/connection.js'

export const getMyCart = async (req, res) => {
  try {
    console.log('=== INICIO getMyCart ===');
    console.log('Headers:', req.headers);
    console.log('Usuario en req.user:', req.user);
    
    const userId = req.user?.id
    console.log('ID de usuario extraído:', userId);
    
    if (!userId) {
      console.log('Error: No se encontró userId en req.user');
      return res.status(401).json({ message: 'No autorizado' });
    }

    console.log('Ejecutando consulta SQL para el usuario ID:', userId);
    const queryText = `
      SELECT c."id_carrito", c."id_producto", c."cantidad", c."fecha_agregado",
             p."id_producto" AS id, p."nombre", p."descripcion", p."precio", 
             p."stock", p."sku", p."marca",
             (
               SELECT img."url_imagen"
               FROM "IMAGENES_PRODUCTO" img
               WHERE img."id_producto" = p."id_producto"
               ORDER BY img."es_principal" DESC, img."id_imagen" ASC
               LIMIT 1
             ) AS imagen
      FROM "CARRITO" c
      JOIN "PRODUCTOS" p ON p."id_producto" = c."id_producto"
      WHERE c."id_usuario" = $1
      ORDER BY c."fecha_agregado" DESC
    `;
    
    console.log('Query SQL:', queryText);
    console.log('Parámetros:', [userId]);
    
    const result = await query(queryText, [userId]);
    console.log('Resultado de la consulta (filas encontradas):', result.rows.length);
    console.log('Primeras 3 filas de resultados:', result.rows.slice(0, 3));

    const items = result.rows.map((row) => ({
      id_carrito: row.id_carrito,
      id_producto: row.id_producto,
      cantidad: row.cantidad,
      fecha_agregado: row.fecha_agregado,
      producto: {
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        precio: row.precio,
        stock: row.stock,
        sku: row.sku,
        marca: row.marca,
        imagen: row.imagen,
      },
    }))

    console.log('Enviando respuesta con', items.length, 'ítems');
    return res.json(items)
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      message: 'Error al obtener carrito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

export const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'No autorizado' })

    const { id_producto, cantidad } = req.body
    const qty = Number(cantidad) || 1
    if (!id_producto || qty <= 0) {
      return res.status(400).json({ message: 'Producto o cantidad inválida' })
    }

    await query(
      `INSERT INTO "CARRITO" ("id_usuario", "id_producto", "cantidad")
       VALUES ($1, $2, $3)
       ON CONFLICT ("id_usuario", "id_producto")
       DO UPDATE SET "cantidad" = "CARRITO"."cantidad" + EXCLUDED."cantidad"`,
      [userId, id_producto, qty],
    )

    return res.status(201).json({ message: 'Producto añadido al carrito' })
  } catch (error) {
    console.error('Error al añadir al carrito:', error)
    return res.status(500).json({ message: 'Error al añadir al carrito' })
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'No autorizado' })

    const productId = Number(req.params.productId)
    const { cantidad } = req.body
    const qty = Number(cantidad)

    if (!productId || Number.isNaN(qty)) {
      return res.status(400).json({ message: 'Producto o cantidad inválida' })
    }

    if (qty <= 0) {
      await query('DELETE FROM "CARRITO" WHERE "id_usuario" = $1 AND "id_producto" = $2', [userId, productId])
      return res.json({ message: 'Producto eliminado del carrito' })
    }

    await query(
      'UPDATE "CARRITO" SET "cantidad" = $3 WHERE "id_usuario" = $1 AND "id_producto" = $2',
      [userId, productId, qty],
    )

    return res.json({ message: 'Cantidad actualizada' })
  } catch (error) {
    console.error('Error al actualizar carrito:', error)
    return res.status(500).json({ message: 'Error al actualizar carrito' })
  }
}

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'No autorizado' })

    const productId = Number(req.params.productId)
    if (!productId) {
      return res.status(400).json({ message: 'Producto inválido' })
    }

    await query('DELETE FROM "CARRITO" WHERE "id_usuario" = $1 AND "id_producto" = $2', [userId, productId])

    return res.json({ message: 'Producto eliminado del carrito' })
  } catch (error) {
    console.error('Error al eliminar del carrito:', error)
    return res.status(500).json({ message: 'Error al eliminar del carrito' })
  }
}

export const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autorizado' });

    await query('DELETE FROM "CARRITO" WHERE "id_usuario" = $1', [userId]);

    return res.json({ message: 'Carrito vaciado correctamente' });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    return res.status(500).json({ 
      message: 'No se pudo vaciar el carrito',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
