import { query } from '../database/connection.js'

const getBusinessDaysDiff = (startDate, endDate) => {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  if (end < start) return 0

  let count = 0
  const current = new Date(start)

  while (current <= end) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const { id_direccion, subtotal, impuestos, total, metodo_pago, notas, items } = req.body

    if (!id_direccion || !subtotal || !impuestos || !total || !metodo_pago || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Datos de pedido incompletos' })
    }

    const validMethods = ['Tarjeta', 'PayPal', 'Transferencia']
    if (!validMethods.includes(metodo_pago)) {
      return res.status(400).json({ message: 'Método de pago inválido' })
    }

    const orderResult = await query(
      'INSERT INTO "PEDIDOS" ("id_usuario", "id_direccion", "subtotal", "impuestos", "total", "estado", "notas") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "id_pedido"',
      [userId, id_direccion, subtotal, impuestos, total, 'Pendiente', notas ?? null],
    )

    const orderId = orderResult.rows[0]?.id_pedido
    if (!orderId) {
      return res.status(500).json({ message: 'No se pudo crear el pedido' })
    }

    for (const item of items) {
      const precioUnitario = Number(item.precio_unitario)
      const cantidad = Number(item.cantidad)
      const idProducto = Number(item.id_producto)

      if (!idProducto || Number.isNaN(precioUnitario) || Number.isNaN(cantidad) || cantidad <= 0) {
        continue
      }

      const lineSubtotal = Number((precioUnitario * cantidad).toFixed(2))

      await query(
        'INSERT INTO "DETALLE_PEDIDO" ("id_pedido", "id_producto", "cantidad", "precio_unitario", "subtotal") VALUES ($1, $2, $3, $4, $5)',
        [orderId, idProducto, cantidad, precioUnitario, lineSubtotal],
      )
    }

    await query(
      'INSERT INTO "PAGOS" ("id_pedido", "metodo_pago", "monto", "estado", "transaccion_id") VALUES ($1, $2, $3, $4, $5)',
      [orderId, metodo_pago, total, 'Aprobado', null],
    )

    await query('DELETE FROM "CARRITO" WHERE "id_usuario" = $1', [userId])

    return res.status(201).json({ id_pedido: orderId })
  } catch (error) {
    console.error('Error al crear pedido:', error)
    return res.status(500).json({ message: 'Error al crear el pedido' })
  }
}

export const updateReturnStatus = async (req, res) => {
  try {
    const role = req.user?.rol
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'No autorizado' })
    }

    const { id } = req.params
    const returnId = Number(id)
    const { estado } = req.body

    if (!returnId) {
      return res.status(400).json({ message: 'ID de devolución inválido' })
    }

    const allowedStatuses = ['Solicitada', 'Aprobada', 'Rechazada', 'Completada']
    if (!estado || !allowedStatuses.includes(estado)) {
      return res.status(400).json({ message: 'Estado de devolución inválido' })
    }

    const currentResult = await query(
      'SELECT "id_devolucion", "id_pedido", "estado" FROM "DEVOLUCIONES" WHERE "id_devolucion" = $1',
      [returnId],
    )

    if (currentResult.rowCount === 0) {
      return res.status(404).json({ message: 'Devolución no encontrada' })
    }

    const current = currentResult.rows[0]
    const orderId = current.id_pedido

    if (current.estado === estado) {
      return res.status(200).json({ message: 'El estado de la devolución ya es el indicado' })
    }

    await query(
      'UPDATE "DEVOLUCIONES" SET "estado" = $1, "fecha_resolucion" = CURRENT_TIMESTAMP WHERE "id_devolucion" = $2',
      [estado, returnId],
    )

    if (estado === 'Aprobada') {
      await query('UPDATE "PEDIDOS" SET "estado" = $1 WHERE "id_pedido" = $2', ['Cancelado', orderId])
      await query('UPDATE "PAGOS" SET "estado" = $1 WHERE "id_pedido" = $2', ['Reembolsado', orderId])
    } else if (estado === 'Rechazada') {
      await query('UPDATE "PEDIDOS" SET "estado" = $1 WHERE "id_pedido" = $2', ['Entregado', orderId])
    }

    if (estado === 'Rechazada' || estado === 'Completada') {
      await query(
        'UPDATE "TICKETS_SOPORTE" SET "estado" = $1, "fecha_actualizacion" = CURRENT_TIMESTAMP WHERE "id_pedido" = $2 AND "estado" <> $1',
        ['Cerrado', orderId],
      )
    }

    return res.json({ message: 'Estado de devolución actualizado correctamente' })
  } catch (error) {
    console.error('Error al actualizar estado de devolución:', error)
    return res.status(500).json({ message: 'No se pudo actualizar el estado de la devolución' })
  }
}

export const createReturnRequest = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const { id } = req.params
    const orderId = Number(id)
    const { motivo, motivo_tipo } = req.body

    if (!orderId || !motivo || typeof motivo !== 'string' || motivo.trim().length < 5) {
      return res.status(400).json({ message: 'Datos de devolución inválidos' })
    }

    const motivoTipo = typeof motivo_tipo === 'string' ? motivo_tipo : 'General'
    const esDefectuoso = motivoTipo === 'Defectuoso'

    const orderResult = await query(
      'SELECT "id_pedido", "id_usuario", "estado", "subtotal", "impuestos", "total", "fecha_pedido", "fecha_entrega" FROM "PEDIDOS" WHERE "id_pedido" = $1',
      [orderId],
    )

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    const order = orderResult.rows[0]

    if (order.id_usuario !== userId) {
      return res.status(403).json({ message: 'No puedes solicitar devolución para este pedido' })
    }

    if (order.estado !== 'Entregado') {
      return res.status(400).json({ message: 'Solo se pueden solicitar devoluciones de pedidos entregados' })
    }

    const existingReturn = await query(
      'SELECT 1 FROM "DEVOLUCIONES" WHERE "id_pedido" = $1 AND "estado" = $2 LIMIT 1',
      [orderId, 'Solicitada'],
    )

    if (existingReturn.rowCount > 0) {
      return res.status(400).json({ message: 'Ya existe una devolución pendiente para este pedido' })
    }

    const detallesResult = await query(
      'SELECT COALESCE(SUM("subtotal"), 0) AS productos_total FROM "DETALLE_PEDIDO" WHERE "id_pedido" = $1',
      [orderId],
    )

    const productosTotal = Number(detallesResult.rows[0]?.productos_total ?? 0)
    if (!Number.isFinite(productosTotal) || productosTotal <= 0) {
      return res.status(400).json({ message: 'No se encontraron montos de productos para este pedido' })
    }

    const fechaReferencia = order.fecha_entrega || order.fecha_pedido
    const fechaEntrega = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia)
    const ahora = new Date()
    const diasHabiles = getBusinessDaysDiff(fechaEntrega, ahora)

    if (!esDefectuoso && diasHabiles > 10) {
      return res.status(400).json({
        message: 'El periodo de devolución ha expirado. El plazo máximo es de 10 días hábiles desde la entrega',
      })
    }

    const subtotal = Number(order.subtotal ?? 0)
    const impuestos = Number(order.impuestos ?? 0)
    const total = Number(order.total ?? 0)
    const costoEnvio = Number((total - (subtotal + impuestos)).toFixed(2))
    const montoReembolsoBase = total - (costoEnvio > 0 ? costoEnvio : 0)
    const montoReembolso = Number(montoReembolsoBase.toFixed(2))

    if (!Number.isFinite(montoReembolso) || montoReembolso <= 0) {
      return res.status(400).json({ message: 'No se pudo calcular el monto de reembolso para este pedido' })
    }

    const motivoTexto = esDefectuoso ? `[Defectuoso] ${motivo.trim()}` : motivo.trim()

    const insertResult = await query(
      'INSERT INTO "DEVOLUCIONES" ("id_pedido", "motivo", "estado", "monto_reembolso") VALUES ($1, $2, $3, $4) RETURNING "id_devolucion"',
      [orderId, motivoTexto, 'Solicitada', montoReembolso],
    )

    const prioridadTicket = montoReembolso >= 1000 ? 'Alta' : 'Media'

    await query(
      'INSERT INTO "TICKETS_SOPORTE" ("id_usuario", "id_pedido", "asunto", "descripcion", "prioridad") VALUES ($1, $2, $3, $4, $5)',
      [userId, orderId, `Devolución pedido #${orderId}`, motivoTexto, prioridadTicket],
    )

    const id_devolucion = insertResult.rows[0]?.id_devolucion

    return res.status(201).json({
      id_devolucion,
      id_pedido: orderId,
      message: 'Solicitud de devolución registrada correctamente',
    })
  } catch (error) {
    console.error('Error al crear solicitud de devolución:', error)
    return res.status(500).json({ message: 'No se pudo registrar la solicitud de devolución' })
  }
}

export const getMyOrderReturn = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const { id } = req.params
    const orderId = Number(id)

    if (!orderId) {
      return res.status(400).json({ message: 'ID de pedido inválido' })
    }

    const orderResult = await query(
      'SELECT "id_pedido", "id_usuario" FROM "PEDIDOS" WHERE "id_pedido" = $1',
      [orderId],
    )

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    const order = orderResult.rows[0]

    if (order.id_usuario !== userId) {
      return res.status(403).json({ message: 'No autorizado para ver esta devolución' })
    }

    const returnResult = await query(
      'SELECT "id_devolucion", "id_pedido", "motivo", "estado", "monto_reembolso", "fecha_solicitud", "fecha_resolucion" FROM "DEVOLUCIONES" WHERE "id_pedido" = $1 ORDER BY "fecha_solicitud" DESC LIMIT 1',
      [orderId],
    )

    if (returnResult.rowCount === 0) {
      return res.status(404).json({ message: 'No hay devoluciones registradas para este pedido' })
    }

    return res.json(returnResult.rows[0])
  } catch (error) {
    console.error('Error al obtener la devolución del pedido:', error)
    return res.status(500).json({ message: 'No se pudo obtener la devolución del pedido' })
  }
}

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params
    const orderId = Number(id)
    if (!orderId) {
      return res.status(400).json({ message: 'ID de pedido inválido' })
    }

    const orderResult = await query(
      `SELECT p."id_pedido",
              p."fecha_pedido",
              p."estado",
              p."total",
              p."subtotal",
              p."impuestos",
              d."calle",
              d."ciudad",
              d."estado" AS estado_direccion,
              d."codigo_postal",
              d."pais"
       FROM "PEDIDOS" p
       LEFT JOIN "DIRECCIONES" d ON d."id_direccion" = p."id_direccion"
       WHERE p."id_pedido" = $1`,
      [orderId],
    )

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    const order = orderResult.rows[0]

    const itemsResult = await query(
      `SELECT d."id_detalle",
              d."id_producto",
              pr."nombre"        AS producto_nombre,
              d."cantidad",
              d."precio_unitario",
              d."subtotal",
              img."url_imagen"   AS producto_imagen
       FROM "DETALLE_PEDIDO" d
       JOIN "PRODUCTOS" pr ON pr."id_producto" = d."id_producto"
       LEFT JOIN "IMAGENES_PRODUCTO" img
         ON img."id_producto" = d."id_producto" AND img."es_principal" = true
       WHERE d."id_pedido" = $1
       ORDER BY d."id_detalle" ASC`,
      [orderId],
    )

    return res.json({
      order: {
        id_pedido: order.id_pedido,
        fecha_pedido: order.fecha_pedido,
        estado: order.estado,
        subtotal: Number(order.subtotal),
        impuestos: Number(order.impuestos),
        total: Number(order.total),
        direccion: {
          calle: order.calle,
          ciudad: order.ciudad,
          estado: order.estado_direccion,
          codigo_postal: order.codigo_postal,
          pais: order.pais,
        },
      },
      items: itemsResult.rows.map((r) => ({
        id_detalle: r.id_detalle,
        id_producto: r.id_producto,
        producto_nombre: r.producto_nombre,
        producto_imagen: r.producto_imagen ?? null,
        cantidad: Number(r.cantidad),
        precio_unitario: Number(r.precio_unitario),
        subtotal: Number(r.subtotal),
      })),
    })
  } catch (error) {
    console.error('Error al obtener detalles de pedido (admin):', error)
    return res.status(500).json({ message: 'No se pudieron cargar los detalles del pedido' })
  }
}

export const getMyOrderDetails = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const { id } = req.params
    const orderId = Number(id)
    if (!orderId) {
      return res.status(400).json({ message: 'ID de pedido inválido' })
    }

    const orderResult = await query(
      `SELECT p."id_pedido",
              p."id_usuario",
              p."fecha_pedido",
              p."estado",
              p."total",
              p."subtotal",
              p."impuestos",
              d."calle",
              d."ciudad",
              d."estado" AS estado_direccion,
              d."codigo_postal",
              d."pais"
       FROM "PEDIDOS" p
       LEFT JOIN "DIRECCIONES" d ON d."id_direccion" = p."id_direccion"
       WHERE p."id_pedido" = $1`,
      [orderId],
    )

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    const order = orderResult.rows[0]

    if (order.id_usuario !== userId) {
      return res.status(403).json({ message: 'No autorizado para ver este pedido' })
    }

    const itemsResult = await query(
      `SELECT d."id_detalle",
              d."id_producto",
              pr."nombre"        AS producto_nombre,
              d."cantidad",
              d."precio_unitario",
              d."subtotal",
              img."url_imagen"   AS producto_imagen
       FROM "DETALLE_PEDIDO" d
       JOIN "PRODUCTOS" pr ON pr."id_producto" = d."id_producto"
       LEFT JOIN LATERAL (
         SELECT i."url_imagen"
         FROM "IMAGENES_PRODUCTO" i
         WHERE i."id_producto" = d."id_producto"
         ORDER BY i."es_principal" DESC, i."id_imagen" ASC
         LIMIT 1
       ) img ON TRUE
       WHERE d."id_pedido" = $1
       ORDER BY d."id_detalle" ASC`,
      [orderId],
    )

    return res.json({
      order: {
        id_pedido: order.id_pedido,
        fecha_pedido: order.fecha_pedido,
        estado: order.estado,
        subtotal: Number(order.subtotal),
        impuestos: Number(order.impuestos),
        total: Number(order.total),
        direccion: {
          calle: order.calle,
          ciudad: order.ciudad,
          estado: order.estado_direccion,
          codigo_postal: order.codigo_postal,
          pais: order.pais,
        },
      },
      items: itemsResult.rows.map((r) => ({
        id_detalle: r.id_detalle,
        id_producto: r.id_producto,
        producto_nombre: r.producto_nombre,
        producto_imagen: r.producto_imagen ?? null,
        cantidad: Number(r.cantidad),
        precio_unitario: Number(r.precio_unitario),
        subtotal: Number(r.subtotal),
      })),
    })
  } catch (error) {
    console.error('Error al obtener detalles de pedido:', error)
    return res.status(500).json({ message: 'No se pudieron cargar los detalles del pedido' })
  }
}

export const getAllReturns = async (req, res) => {
  try {
    const result = await query(
      `SELECT r."id_devolucion",
              r."id_pedido",
              r."motivo",
              r."estado",
              r."monto_reembolso",
              r."fecha_solicitud",
              r."fecha_resolucion",
              p."total"        AS total_pedido
       FROM "DEVOLUCIONES" r
       JOIN "PEDIDOS" p ON p."id_pedido" = r."id_pedido"
       ORDER BY r."fecha_solicitud" DESC`,
    )

    return res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener devoluciones (admin):', error)
    return res.status(500).json({ message: 'No se pudieron cargar las devoluciones' })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const result = await query(
      `SELECT p."id_pedido",
              p."fecha_pedido",
              p."estado",
              p."total",
              (
                SELECT pr."nombre"
                FROM "DETALLE_PEDIDO" d
                JOIN "PRODUCTOS" pr ON pr."id_producto" = d."id_producto"
                WHERE d."id_pedido" = p."id_pedido"
                ORDER BY d."id_detalle" ASC
                LIMIT 1
              ) AS producto_nombre,
              (
                SELECT img."url_imagen"
                FROM "DETALLE_PEDIDO" d
                JOIN "IMAGENES_PRODUCTO" img ON img."id_producto" = d."id_producto" AND img."es_principal" = true
                WHERE d."id_pedido" = p."id_pedido"
                ORDER BY d."id_detalle" ASC, img."id_imagen" ASC
                LIMIT 1
              ) AS producto_imagen,
              (
                SELECT COALESCE(SUM(d."cantidad"), 0)
                FROM "DETALLE_PEDIDO" d
                WHERE d."id_pedido" = p."id_pedido"
              ) AS total_items
       FROM "PEDIDOS" p
       ORDER BY p."fecha_pedido" DESC`,
    )

    return res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener pedidos (admin):', error)
    return res.status(500).json({ message: 'No se pudieron cargar los pedidos' })
  }
}

// Importar la función de actualización de stock
import { updateProductStock } from './product.controller.js';

// Actualizar estado de pedido (uso administrativo / agente)
export const updateOrderStatus = async (req, res) => {
  try {
    const role = req.user?.rol;
    if (role !== 'Admin' && role !== 'Agente') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const { id } = req.params;
    const orderId = Number(id);
    const { estado } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'ID de pedido inválido' });
    }

    const allowedStatuses = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
    if (!estado || !allowedStatuses.includes(estado)) {
      return res.status(400).json({ message: 'Estado de pedido inválido' });
    }

    // Obtener el estado actual del pedido
    const currentOrder = await query(
      'SELECT "estado" FROM "PEDIDOS" WHERE "id_pedido" = $1',
      [orderId],
    );

    if (currentOrder.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const currentStatus = currentOrder.rows[0].estado;

    // Actualizar el estado del pedido
    await query(
      'UPDATE "PEDIDOS" SET "estado" = $1 WHERE "id_pedido" = $2',
      [estado, orderId],
    );

    // Si el estado cambia a "Entregado", disminuir el stock
    if (estado === 'Entregado' && currentStatus !== 'Entregado') {
      const itemsResult = await query(
        'SELECT "id_producto", "cantidad" FROM "DETALLE_PEDIDO" WHERE "id_pedido" = $1',
        [orderId],
      );

      for (const item of itemsResult.rows) {
        const success = await updateProductStock(item.id_producto, -item.cantidad);
        if (!success) {
          console.error(`Error al actualizar stock para el producto ${item.id_producto}`);
        }
      }
    }
    // Si el estado cambia a "Cancelado" y el estado anterior era "Entregado", aumentar el stock
    else if (estado === 'Cancelado' && currentStatus === 'Entregado') {
      const itemsResult = await query(
        'SELECT "id_producto", "cantidad" FROM "DETALLE_PEDIDO" WHERE "id_pedido" = $1',
        [orderId],
      );

      for (const item of itemsResult.rows) {
        const success = await updateProductStock(item.id_producto, item.cantidad);
        if (!success) {
          console.error(`Error al actualizar stock para el producto ${item.id_producto}`);
        }
      }
    }

    return res.json({ message: 'Estado de pedido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado de pedido:', error);
    return res.status(500).json({ message: 'No se pudo actualizar el estado del pedido' });
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const result = await query(
      `SELECT p."id_pedido",
              p."fecha_pedido",
              p."estado",
              p."total",
              EXISTS (
                SELECT 1 FROM "DEVOLUCIONES" r WHERE r."id_pedido" = p."id_pedido"
              ) AS tiene_devolucion,
              (
                SELECT pr."nombre"
                FROM "DETALLE_PEDIDO" d
                JOIN "PRODUCTOS" pr ON pr."id_producto" = d."id_producto"
                WHERE d."id_pedido" = p."id_pedido"
                ORDER BY d."id_detalle" ASC
                LIMIT 1
              ) AS producto_nombre,
              (
                SELECT img."url_imagen"
                FROM "DETALLE_PEDIDO" d
                JOIN "IMAGENES_PRODUCTO" img ON img."id_producto" = d."id_producto" AND img."es_principal" = true
                WHERE d."id_pedido" = p."id_pedido"
                ORDER BY d."id_detalle" ASC, img."id_imagen" ASC
                LIMIT 1
              ) AS producto_imagen,
              (
                SELECT COALESCE(SUM(d."cantidad"), 0)
                FROM "DETALLE_PEDIDO" d
                WHERE d."id_pedido" = p."id_pedido"
              ) AS total_items
       FROM "PEDIDOS" p
       WHERE p."id_usuario" = $1
       ORDER BY p."fecha_pedido" DESC`,
      [userId],
    )

    return res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener pedidos:', error)
    return res.status(500).json({ message: 'Error al obtener pedidos' })
  }
}
