const User = require('./User');
const Profile = require('./Profile');
const Role = require('./Role');

User.hasOne(Profile, {
  foreignKey: 'fk_usuarios_id',
  as: 'profile',
});

Profile.belongsTo(User, {
  foreignKey: 'fk_usuarios_id',
  as: 'user',
});

User.belongsToMany(Role, {
  through: 'users_roles',
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles',
  timestamps: false,
});

Role.belongsToMany(User, {
  through: 'users_roles',
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users',
  timestamps: false,
});

module.exports = {
  User,
  Profile,
  Role,
};
