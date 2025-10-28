const sequelize = require('../config/database');
const User = require('./User');
const Band = require('./Band');

// Relaciones
// Un usuario puede agregar muchas bandas
User.hasMany(Band, {
  foreignKey: 'addedBy',
  as: 'bands'
});

Band.belongsTo(User, {
  foreignKey: 'addedBy',
  as: 'contributor'
});

module.exports = {
  sequelize,
  User,
  Band
};
