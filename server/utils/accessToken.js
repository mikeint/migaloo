const passport = require('../config/passport');

const db = require('../config/db')
const postgresdb = db.postgresdb

function generateAccessToken(userId) {
    var payload
    return postgresdb.one('\
        SELECT l.user_id, l.email, c.company_name, l.user_type_id, c.company_id \
        FROM login l \
        INNER JOIN company_contact cc ON cc.company_contact_id = l.user_id \
        INNER JOIN company c ON cc.company_id = c.company_id \
        WHERE c.active AND l.active AND l.user_id = ${user_id}', {user_id:userId})
    .then((args) => { 
        payload = {
            id: args.user_id,
            companyName: args.company_name,
            userType: args.user_type_id,
            companyId: args.company_id,
            email: args.email,
            accessToken: Math.trunc(Math.random()*100000000000),
            userId: args.user_id
        }
        return postgresdb.none('DELETE FROM access_token WHERE user_id = ${userId}', {userId:userId})
    })
    .then(() => { 
        return postgresdb.none('INSERT INTO access_token(user_id, token) VALUES (${userId}, ${token})', {userId:userId, token:payload['accessToken']})
    })
    .then(() => { 
        return passport.signToken(payload, 'never')
    });
}
module.exports = {
    generateAccessToken:generateAccessToken
};