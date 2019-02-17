var pgp = require('pg-promise')();
const cn = {
    host: 'localhost',
    port: 5432,
    database: 'hireranked_prod',
    user: 'postgres',
    password: 'postgres'
};
var db = pgp(cn);
module.exports = {
    postgresdb: db
};