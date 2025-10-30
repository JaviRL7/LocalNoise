const { Band, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllBands = async (req, res) => {
  try {
    const { limit, offset, genre, country, city } = req.query;

    const where = {};
    if (genre) where.genre = genre;
    if (country) where.country = country;
    if (city) where.city = city;

    const bands = await Band.findAndCountAll({
      where,
      limit: limit ? parseInt(limit) : 1000,
      offset: offset ? parseInt(offset) : 0,
      include: [{
        model: User,
        as: 'contributor',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: bands.count,
      bands: bands.rows
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBandById = async (req, res) => {
  try {
    const band = await Band.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'contributor',
        attributes: ['id', 'username', 'city', 'country']
      }]
    });

    if (!band) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    res.json(band);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createBand = async (req, res) => {
  try {
    const {
      name,
      city,
      country,
      latitude,
      longitude,
      genre,
      description,
      // yearFormed,
      website,
      spotifyUrl,
      spotifyId,
      spotifyImageUrl,
      isVerified,
      youtubeUrl,
      instagramUrl,
      twitterUrl,
      tiktokUrl,
      isActive
    } = req.body;

    // Ajustar coordenadas si ya hay bandas cercanas en la misma ciudad
    let adjustedLat = parseFloat(latitude);
    let adjustedLon = parseFloat(longitude);

    // Buscar bandas muy cercanas (dentro de 0.001 grados, ~100 metros)
    const nearbyBands = await Band.findAll({
      where: {
        city: city,
        latitude: {
          [Op.between]: [adjustedLat - 0.001, adjustedLat + 0.001]
        },
        longitude: {
          [Op.between]: [adjustedLon - 0.001, adjustedLon + 0.001]
        }
      }
    });

    // Si hay bandas cercanas, añadir un pequeño offset para evitar superposición
    if (nearbyBands.length > 0) {
      // Offset basado en el número de bandas cercanas
      const offset = 0.0002 * nearbyBands.length; // ~20 metros por banda
      const angle = (nearbyBands.length * 60) % 360; // Distribución circular
      const angleRad = angle * (Math.PI / 180);

      adjustedLat += offset * Math.cos(angleRad);
      adjustedLon += offset * Math.sin(angleRad);
    }

    const band = await Band.create({
      name,
      city,
      country,
      latitude: adjustedLat,
      longitude: adjustedLon,
      genre,
      description,
      // yearFormed,
      website,
      spotifyUrl,
      spotifyId,
      spotifyImageUrl,
      isVerified: isVerified || false,
      youtubeUrl,
      instagramUrl,
      twitterUrl,
      tiktokUrl,
      isActive,
      addedBy: req.user.id
    });

    const bandWithContributor = await Band.findByPk(band.id, {
      include: [{
        model: User,
        as: 'contributor',
        attributes: ['id', 'username']
      }]
    });

    res.status(201).json(bandWithContributor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBand = async (req, res) => {
  try {
    const band = await Band.findByPk(req.params.id);

    if (!band) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    // Solo el usuario que agregó la banda puede editarla
    if (band.addedBy !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para editar esta banda'
      });
    }

    await band.update(req.body);

    const updatedBand = await Band.findByPk(band.id, {
      include: [{
        model: User,
        as: 'contributor',
        attributes: ['id', 'username']
      }]
    });

    res.json(updatedBand);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBand = async (req, res) => {
  try {
    const band = await Band.findByPk(req.params.id);

    if (!band) {
      return res.status(404).json({ error: 'Banda no encontrada' });
    }

    // Solo el usuario que agregó la banda puede eliminarla
    if (band.addedBy !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar esta banda'
      });
    }

    await band.destroy();
    res.json({ message: 'Banda eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.searchBands = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        error: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }

    const bands = await Band.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { city: { [Op.iLike]: `%${q}%` } },
          { country: { [Op.iLike]: `%${q}%` } },
          { genre: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 50,
      include: [{
        model: User,
        as: 'contributor',
        attributes: ['id', 'username']
      }]
    });

    res.json(bands);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
