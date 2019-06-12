const passport = require('../config/passport');

const db = require('../config/db')
const postgresdb = db.postgresdb

function generateAccessToken(userId, payload) {
    const randNumber = Math.trunc(Math.random()*100000000000)
    payload['accessToken'] = randNumber
    payload['userId'] = userId
    return postgresdb.none('DELETE FROM access_token WHERE user_id = ${userId}', {userId:userId})
    .then(() => { 
        return postgresdb.none('INSERT INTO access_token(user_id, token) VALUES (${userId}, ${token})', {userId:userId, token:randNumber})
    })
    .then(() => { 
        return passport.signToken(payload, 'never')
    });
}
function validateAccessToken(userId, accessToken) {
    return postgresdb.one('SELECT 1 FROM access_token WHERE user_id = ${userId} AND token = ${token}', {userId:userId, token:accessToken})
}

module.exports = {
    generateAccessToken:generateAccessToken,
    validateAccessToken:validateAccessToken
};