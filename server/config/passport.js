const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys');
const passport = require('passport'); 
const jwt = require('jsonwebtoken');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

function init(app){
    app.use(passport.initialize())
    passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
        return done(null, jwtPayload);
    }));
}
function signToken(payload){
    return new Promise((resolve, reject)=>{
        jwt.sign(payload, keys.secretOrKey, { expiresIn: "1d" }, (err, token) => {
            if(err) return reject(err)
            resolve(token)
        });
    })
}
module.exports = {
    init: init,
    signToken: signToken,
    authentication: function(req, res, next) {
        passport.authenticate('jwt',  { session: false }, function(err, jwtPayload) {
            if (err) { return next(err); }
            if (!jwtPayload) { return res.redirect('/login'); }
            req.body.jwtPayload = jwtPayload
            next()
        })(req, res, next);
    }
}