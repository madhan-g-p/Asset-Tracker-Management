require('dotenv').config();

const env = process.env.NODE_ENV || 'local';

const config = {
  local: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  development: {
    // ...similar, can be customized...
  },
  production: {
    // ...secure prod config...
  }
};

module.exports = config[env];