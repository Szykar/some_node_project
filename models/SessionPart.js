'use strict';
module.exports = (sequelize, DataTypes) => {
  const SessionPart = sequelize.define('SessionPart', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    order: DataTypes.INTEGER,
    inProgress: DataTypes.BOOLEAN,
    voteLimit: DataTypes.INTEGER
  }, {

  });

  SessionPart.associate = function(models) {
    models.SessionPart.belongsTo(models.Session, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    models.SessionPart.hasMany(models.Voting);
  };

  SessionPart.prototype.changeOrder = function(position) {
    if (position == this.order)
      return;

    if (position < this.order) {
      sequelize.query("UPDATE SessionParts SET `order` = `order` + '1' WHERE `SessionId`='" + this.SessionId + "' AND `order` < '" + this.order + "' AND `order` >= '" + position + "'");
      sequelize.query("UPDATE SessionParts SET `order` = '" + position + "' WHERE `id`='" + this.id + "'");
    } else {
      sequelize.query("UPDATE SessionParts SET `order` = `order` - '1' WHERE `SessionId`='" + this.SessionId + "' AND `order` > '" + this.order + "' AND `order` <= '" + position + "'");
      sequelize.query("UPDATE SessionParts SET `order` = '" + position + "' WHERE `id`='" + this.id + "'");
    }
  };

  return SessionPart;
};
