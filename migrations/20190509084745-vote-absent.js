'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Votes', 'vote', {
      type: Sequelize.ENUM('for', 'against', 'abstention', 'absent')
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Votes', 'vote', {
      type: Sequelize.ENUM('for', 'against', 'abstention')
    })
  }
};
