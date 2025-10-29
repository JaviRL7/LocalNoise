const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Band = sequelize.define('Band', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Género musical principal'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  yearFormed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1900,
      max: new Date().getFullYear()
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  spotifyUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  spotifyId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID de Spotify del artista'
  },
  spotifyImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la imagen del artista en Spotify'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si la banda está verificada con datos de Spotify'
  },
  youtubeUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  instagramUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  twitterUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si la banda sigue activa'
  }
}, {
  timestamps: true,
  indexes: [
    {
      name: 'bands_location_idx',
      fields: ['latitude', 'longitude']
    },
    {
      name: 'bands_city_idx',
      fields: ['city']
    }
  ]
});

module.exports = Band;
