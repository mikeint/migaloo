const db = require('../config/db');
const logger = require('./logging'); 
const postgresdb = db.postgresdb
const pgp = db.pgp
const camalize = db.camalize
const camelColumnConfig = db.camelColumnConfig


// address_id bigserial,
// address_line_1 varchar(128),
// address_line_2 varchar(128),
// place_id varchar(128),
// city varchar(128),
// state_province varchar(128),
// state_province_code varchar(3),
// country varchar(128),
// country_code varchar(3),
// lat float,
// lon float
const convertFieldsToMap = (dataMap) => {
    const addressMap = {}
    addressMap['addressId'] = dataMap['addressId']
    delete dataMap['addressId']
    addressFields.forEach(k=>{
        k = camalize(k)
        addressMap[k] = dataMap[k]
        delete dataMap[k]
    })
    dataMap['address'] = addressMap
    return dataMap
}

const addressFields = ['address_line_1', 'address_line_2', 'city', 'state_province', 'state_province_code', 'country', 'country_code', 'place_id', 'lat', 'lon', 'postal_code'];
const addressUpdate = new pgp.helpers.ColumnSet(['?address_id', ...addressFields.map(camelColumnConfig)], {table: 'address'});

function addAddress(bodyData, transaction=postgresdb){
    if(addressFields.some(a=>bodyData[a] != null)){
        return transaction.one('INSERT INTO address (address_line_1, address_line_2, city, state_province, state_province_code, country, country_code, place_id, lat, lon, postal_code) \
                    VALUES (${addressLine1}, ${addressLine2}, ${city}, ${stateProvince}, ${stateProvinceCode}, ${country}, ${countryCode}, ${placeId}, ${lat}, ${lon}, ${postalCode}) RETURNING address_id',
                    bodyData)
    }else{
        return Promise.resolve({address_id: null})
    }
}
function updateAddress(bodyData, transaction=postgresdb){
    if(addressFields.some(a=>bodyData[a] != null)){
        if(bodyData['addressId']  == null)
            throw Error('Missing field address_id')

        return transaction.none(pgp.helpers.update(bodyData, addressUpdate) + ' WHERE address_id = ${addressId}', {addressId:bodyData['addressId']})
    }else{
        return Promise.resolve({address_id: null})
    }
}

module.exports = {
    addAddress:addAddress,
    convertFieldsToMap:convertFieldsToMap,
    updateAddress:updateAddress
};