'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    vote: DataTypes.ENUM('for', 'against', 'abstention', 'absent')
  }, {
    classMethods: {
      associate: function(models) {
      }
    }
  });

  Vote.associate = function(models) {
    models.Vote.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    models.Vote.belongsTo(models.Voting, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Vote;
};
