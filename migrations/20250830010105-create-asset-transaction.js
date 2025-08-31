'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AssetTransactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      assetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Assets', key: 'id' },
        onDelete: 'CASCADE'
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Employees', key: 'id' },
        onDelete: 'SET NULL'
      },
      type: { type: Sequelize.STRING, allowNull: false }, // issue, return, scrap
      reason: { type: Sequelize.STRING },
      date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AssetTransactions');
  }
};