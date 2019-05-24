var pgp = require('pg-promise')();
const cn = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'migaloo_prod',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
};
var db = pgp(cn);
const camalize = (str) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr)
    {
        return chr.toUpperCase();
    });
}
const camelColumnConfig = name=>{
    return {
        name: name,
        prop: camalize(name),
        skip: col => {
            return col.source[name] == null;
        }
    }

}
module.exports = {
    postgresdb: db,
    pgp: pgp,
    camalize: camalize,
    camelColumnConfig: camelColumnConfig
};