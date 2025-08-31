'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

// Load config dynamically
const env = process.env.NODE_ENV || 'local';
const config = require(path.join(__dirname , '../config/config.js'));

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};

// Dynamically load all models in this directory except index.js
fs
  .readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    (file.slice(-3) === '.js' || file.slice(-3) === '.ts')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export sequelize and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;