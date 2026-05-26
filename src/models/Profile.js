const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  photo_url: DataTypes.STRING(255),
  name: DataTypes.STRING(50),
  surname: DataTypes.STRING(50),
  phone: DataTypes.STRING(15),
  country: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
  },
  postal_code: {
    type: DataTypes.STRING(15),
    allowNull: false,
    defaultValue: '',
  },
  biography: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  fk_usuarios_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'profiles',
  timestamps: false,
});

module.exports = Profile;