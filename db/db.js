require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: (msg) => logger.debug(`🗄️  ${msg}`), // Log SQL queries as debug
});

// Test database connection
sequelize.authenticate()
    .then(() => {
        logger.info('🗄️  SQLite database connection established successfully');
    }).catch(err => {
        logger.error('❌ Unable to connect to database:', err);
    });

// Import models
const Video = require('./models/video')(sequelize, Sequelize);
const User = require('./models/user')(sequelize, Sequelize);

// Sync database
const dbSync = sequelize.sync()
    .then(() => {
        logger.info('🔄 Database synchronized successfully');
    })
    .catch((err) => {
        logger.error('❌ Database sync failed:', err);
    });

module.exports = {
    dbSync,
    sequelize,
    Sequelize,
    Video,
    User,
}

