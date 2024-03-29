let Sequelize = require('sequelize');
let fs        = require('fs');
let path      = require('path');

let db        = {};
let basename  = path.basename(module.filename);
let config    = {
    "username": 'postgres',
    "password": 'postgres',
    "database": 'postgres',
    "host": "localhost",
    "port" : "5432",
    "dialect": "postgres",
    "timezone": 'Europe/Moscow'
};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;



