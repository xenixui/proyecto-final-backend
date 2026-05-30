const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Unknown',
  },
  logo_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'brands',
  timestamps: false,
});

module.exports = Brand;
