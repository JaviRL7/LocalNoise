const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para producción (Render) o desarrollo local
let sequelize;

if (process.env.DATABASE_URL) {
  // Producción - Usar DATABASE_URL (Render, Heroku, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necesario para Render
      }
    }
  });
} else {
  // Desarrollo local - Usar variables individuales
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || null,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: process.env.DB_PASSWORD ? {} : {
        // Permitir autenticación peer para usuarios sin contraseña
      }
    }
  );
}

module.exports = sequelize;
