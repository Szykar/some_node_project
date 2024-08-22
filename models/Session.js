'use strict';
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    inProgress: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function (models) {
      }
    }
  });

  Session.associate = function(models) {
    models.Session.hasMany(models.SessionPart);
  };

  return Session;
};
