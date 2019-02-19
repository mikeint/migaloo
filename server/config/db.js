var pgp = require('pg-promise')();
const cn = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'hireranked_prod',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
};
var db = pgp(cn);
module.exports = {
    postgresdb: db,
    pgp: pgp
};