import { query } from '../database/connection.js'

export const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const result = await query(
      `SELECT 
        id_direccion as "id",
        id_usuario as "userId",
        calle as "street",
        ciudad as "city",
        estado as "state",
        codigo_postal as "postalCode",
        pais as "country",
        es_principal as "isDefault"
      FROM "DIRECCIONES" 
      WHERE "id_usuario" = $1 
      ORDER BY "es_principal" DESC, "id_direccion" ASC`,
      [userId],
    )

    return res.json(result.rows)
  } catch (error) {
    console.error('Error en getMyAddresses:', error)
    return res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Keep the old function for backward compatibility
export const getMyAddress = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const result = await query(
      'SELECT * FROM "DIRECCIONES" WHERE "id_usuario" = $1 AND "es_principal" = true LIMIT 1',
      [userId],
    )

    if (result.rowCount === 0) {
      return res.json(null)
    }

    const address = result.rows[0]
    return res.json({
      id: address.id_direccion,
      userId: address.id_usuario,
      street: address.calle,
      city: address.ciudad,
      state: address.estado,
      postalCode: address.codigo_postal,
      country: address.pais,
      isDefault: address.es_principal
    })
  } catch (error) {
    console.error('Error en getMyAddress:', error)
    return res.status(500).json({ message: 'Error en el servidor' })
  }
}

export const upsertMyAddress = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const {
      name,          // nombre_direccion
      street,        // calle
      city,          // ciudad
      state,         // estado
      postal_code,   // codigo_postal
      country,       // pais
      is_default,    // es_principal
      type           // NO lo usas, pero lo recibimos para evitar errores
    } = req.body;

    // Mapear correctamente
    const nombre_direccion = name || null;
    const calle = street;
    const ciudad = city;
    const estado = state || null;
    const codigo_postal = postal_code;
    const pais = country || "Perú";
    const es_principal = is_default ?? false;

    const existing = await query(
      'SELECT "id_direccion" FROM "DIRECCIONES" WHERE "id_usuario" = $1 ORDER BY "es_principal" DESC, "id_direccion" ASC LIMIT 1',
      [userId],
    )

    const esPrincipal = existing.rowCount === 0

    if (existing.rowCount === 0) {
      const insert = await query(
        'INSERT INTO "DIRECCIONES" ("id_usuario", "nombre_direccion", "calle", "ciudad", "estado", "codigo_postal", "pais", "es_principal") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "id_direccion", "id_usuario", "nombre_direccion", "calle", "ciudad", "estado", "codigo_postal", "pais", "es_principal"',
        [userId, nombre_direccion ?? null, calle, ciudad, estado ?? null, codigo_postal, pais || 'Perú', esPrincipal],
      )
      return res.status(201).json(insert.rows[0])
    }

    const idDireccion = existing.rows[0].id_direccion

    const update = await query(
      'UPDATE "DIRECCIONES" SET "nombre_direccion" = $1, "calle" = $2, "ciudad" = $3, "estado" = $4, "codigo_postal" = $5, "pais" = $6 WHERE "id_direccion" = $7 RETURNING "id_direccion", "id_usuario", "nombre_direccion", "calle", "ciudad", "estado", "codigo_postal", "pais", "es_principal"',
      [nombre_direccion ?? null, calle, ciudad, estado ?? null, codigo_postal, pais || 'Perú', idDireccion],
    )

    return res.json(update.rows[0])
  } catch (error) {
    console.error('Error en upsertMyAddress:', error)
    return res.status(500).json({ message: 'Error en el servidor' })
  }
}
