'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    emailAddress: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    role: DataTypes.ENUM('user', 'councilor', 'chairman', 'operator', 'admin'),
  }, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      },
      beforeUpdate: (user) => {
        if (user.changed('password')) {
          const salt = bcrypt.genSaltSync();
          user.password = bcrypt.hashSync(user.password, salt);
        }
      },
    },
  });

  User.prototype.generateHash = function(password) {
    return bcrypt.hash(password, bcrypt.genSaltSync(8));
  };

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.prototype.serialize = function() {
    let {password, ...values} = this.get();

    return values;
  };

  User.associate = function(models) {
    models.User.hasMany(models.Task);
    models.User.hasMany(models.Vote);

    models.User.belongsToMany(models.Group, {
      through: {
        model: models.UserToGroup,
        unique: false,
      },
      foreignKey: 'user_id',
      constraints: false,
    });
  };

  return User;
};
