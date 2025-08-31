'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Assets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      serialNumber: { type: Sequelize.STRING, unique: true, allowNull: false },
      make: { type: Sequelize.STRING },
      model: { type: Sequelize.STRING },
      value: { type: Sequelize.FLOAT, defaultValue: 0 },
      status: { type: Sequelize.STRING, defaultValue: 'stock' },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onDelete: 'CASCADE'
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      branch: { type: Sequelize.STRING }, // If you want branch per asset
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Assets');
  }
};