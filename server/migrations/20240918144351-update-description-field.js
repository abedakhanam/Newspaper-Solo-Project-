'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('articles', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('articles', 'content', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('articles', 'description', {
      type: Sequelize.STRING(255),
      allowNull: true, // Make sure to set allowNull to true if needed
    });
    await queryInterface.changeColumn('articles', 'content', {
      type: Sequelize.STRING(255),
      allowNull: true, // Make sure to set allowNull to true if needed
    });
  },
};
