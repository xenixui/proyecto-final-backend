const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('USER', 'MODERATOR', 'ADMINISTRATOR'),
    allowNull: false,
    defaultValue: 'USER',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'BLOCKED', 'DELETED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  update_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;