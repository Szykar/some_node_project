'use strict';
const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Voting = sequelize.define('Voting', {
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    inProgress: DataTypes.BOOLEAN,
    open: DataTypes.BOOLEAN
  }, {
    hooks: {
      beforeCreate: (voting) => {
        voting.slug = slugify(voting.title)
      },
      beforeUpdate: (voting) => {
        voting.slug = slugify(voting.title)
      },
    },
    classMethods: {
      associate: function(models) {

      }
    }
  });

  Voting.associate = function(models) {
    models.Voting.belongsTo(models.SessionPart, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    models.Voting.hasMany(models.Vote);
  };

  return Voting;
};
