const { sequelize, User, Band } = require('../backend/src/models');

async function initDatabase() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✓ Conexión establecida correctamente');

    console.log('Sincronizando modelos...');
    await sequelize.sync({ force: false }); // Cambiar a true para resetear DB
    console.log('✓ Modelos sincronizados');

    console.log('Base de datos inicializada correctamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDatabase();
