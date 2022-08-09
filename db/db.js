const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false
});


sequelize.authenticate()
    .then(() => {
        console.log("SQLite connection has been established successfully");
    }).catch(err => {
        console.error('Unable to connect to the database:', err);
    })

sequelize.sync()
    .then(() => {
        console.log("Synced db.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    });

module.exports = {
    sequelize,
    Sequelize,
    Video: require("./models/video")(sequelize, Sequelize),
}

