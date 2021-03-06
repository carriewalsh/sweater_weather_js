'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'UserCities',
      'cityName',
      {
        type: Sequelize.STRING
      }
    )

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
     "UserCities",
     "cityName"
   );
  }
};
