'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserToGroup = sequelize.define('UserToGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: 'user_group'
    },
    group_id: {
      type: DataTypes.INTEGER,
      unique: 'user_group'
    }
  });

  return UserToGroup;
};
