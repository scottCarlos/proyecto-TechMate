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
        nombre_direccion as "name_direction",
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

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    const addressIdRaw = req.params?.id
    const addressId = Number(addressIdRaw)
    if (!addressIdRaw || Number.isNaN(addressId)) {
      return res.status(400).json({ message: 'ID de dirección inválido' })
    }

    const exists = await query(
      'SELECT 1 FROM "DIRECCIONES" WHERE "id_direccion" = $1 AND "id_usuario" = $2 LIMIT 1',
      [addressId, userId]
    )

    if (exists.rowCount === 0) {
      return res.status(404).json({ message: 'Dirección no encontrada' })
    }

    await query(
      'UPDATE "DIRECCIONES" SET "es_principal" = false WHERE "id_usuario" = $1',
      [userId]
    )

    const updated = await query(
      'UPDATE "DIRECCIONES" SET "es_principal" = true WHERE "id_direccion" = $1 AND "id_usuario" = $2 RETURNING *',
      [addressId, userId]
    )

    return res.json(updated.rows[0])
  } catch (error) {
    console.error('Error en setDefaultAddress:', error)
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
    console.log('Iniciando upsertMyAddress con body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.user?.id;
    if (!userId) {
      console.error('No se encontró el ID de usuario en la solicitud');
      return res.status(401).json({ message: 'No autorizado' });
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

    // Validar campos requeridos
    if (!street || !city || !postal_code) {
      console.error('Faltan campos requeridos:', { street, city, postal_code });
      return res.status(400).json({ 
        message: 'Faltan campos requeridos',
        required: ['street', 'city', 'postal_code'],
        received: { street, city, postal_code }
      });
    }

    // Mapear correctamente
    const nombre_direccion = name || null;
    const calle = street;
    const ciudad = city;
    const estado = state || null;
    const codigo_postal = postal_code;
    const pais = country || 'Perú';
    const es_principal = is_default ?? false;

    console.log('Datos mapeados:', { 
      userId, 
      nombre_direccion, 
      calle, 
      ciudad, 
      estado, 
      codigo_postal, 
      pais, 
      es_principal 
    });

    try {
      // Verificar si el usuario ya tiene direcciones
      const existing = await query(
        'SELECT 1 FROM "DIRECCIONES" WHERE "id_usuario" = $1 LIMIT 1',
        [userId]
      );

      // Regla:
      // - Si es la primera dirección del usuario, se marca como predeterminada.
      // - Si el cliente envía is_default=true, esta nueva dirección pasa a ser la predeterminada.
      const shouldBeDefault = existing.rowCount === 0 || es_principal;

      if (shouldBeDefault) {
        await query(
          'UPDATE "DIRECCIONES" SET "es_principal" = false WHERE "id_usuario" = $1',
          [userId]
        );
      }

      console.log('Creando nueva dirección para el usuario:', userId);
      const insert = await query(
        'INSERT INTO "DIRECCIONES" ("id_usuario", "nombre_direccion", "calle", "ciudad", "estado", "codigo_postal", "pais", "es_principal") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [userId, nombre_direccion, calle, ciudad, estado, codigo_postal, pais, shouldBeDefault]
      );

      console.log('Dirección creada exitosamente:', insert.rows[0]);
      return res.status(201).json(insert.rows[0]);
    } catch (dbError) {
      console.error('Error en la consulta a la base de datos:', dbError);
      return res.status(500).json({ 
        message: 'Error en la base de datos',
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Error en upsertMyAddress:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message 
    });
  }
}
