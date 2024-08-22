'use strict';

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING
  });


  Group.associate = function (models) {
    models.Group.belongsToMany(models.User, {
      through: {
        model: models.UserToGroup,
        unique: false
      },
      foreignKey: 'group_id',
      constraints: false
    });
  };

  return Group;
};
