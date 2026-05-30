const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WatchModel = sequelize.define('WatchModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'N/A',
  },
  gender: {
    type: DataTypes.ENUM('MENS', 'WOMENS', 'UNISEX'),
    allowNull: false,
    defaultValue: 'UNISEX',
  },
  movement_type: {
    type: DataTypes.ENUM('AUTOMATIC', 'MANUAL', 'QUARTZ', 'KINETIC'),
    allowNull: false,
    defaultValue: 'AUTOMATIC',
  },
  fk_brands_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'models',
  timestamps: false,
});

module.exports = WatchModel;
