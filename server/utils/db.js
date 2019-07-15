var pgp = require('pg-promise')();
const settings = require('../config/settings');
var db = pgp(settings.dbConfig);
const camalize = (str) => {
    return str.replace(/_(.)/g, function(match, chr)
    {
        return chr.toUpperCase();
    });
}
const camelColumnConfig = name=>{
    return {
        name: name,
        prop: camalize(name),
        skip: col => {
            return col.source[camalize(name)] == null;
        }
    }
}

const camelizeFields = (dataMap) => {
    const newMap = {}
    Object.keys(dataMap).forEach(k=>{
        newMap[camalize(k)] = dataMap[k]
    })
    return newMap
}
module.exports = {
    postgresdb: db,
    pgp: pgp,
    camalize: camalize,
    camelColumnConfig: camelColumnConfig,
    camelizeFields: camelizeFields
};