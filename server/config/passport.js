const JwtStrategy = require('passport-jwt').Strategy;
var SamlStrategy = require('passport-saml').Strategy;
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
    passport.use(new SamlStrategy(
        {  
          protocol: 'http://',
          path: '/auth/saml/callback',
          entryPoint: 'https://accounts.google.com/o/saml2/idp?idpid=C033v4rka',
          issuer: 'https://accounts.google.com/o/saml2?idpid=C033v4rka',
          cert: 'MIIDdDCCAlygAwIBAgIGAWmrAmu+MA0GCSqGSIb3DQEBCwUAMHsxFDASBgNVBAoTC0dvb2dsZSBJbmMuMRYwFAYDVQQHEw1Nb3VudGFpbiBWaWV3MQ8wDQYDVQQDEwZHb29nbGUxGDAWBgNVBAsTD0dvb2dsZSBGb3IgV29yazELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWEwHhcNMTkwMzIzMTQ0NDE1WhcNMjQwMzIxMTQ0NDE1WjB7MRQwEgYDVQQKEwtHb29nbGUgSW5jLjEWMBQGA1UEBxMNTW91bnRhaW4gVmlldzEPMA0GA1UEAxMGR29vZ2xlMRgwFgYDVQQLEw9Hb29nbGUgRm9yIFdvcmsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs9XUUXorN64uCKwJvszkzedD1cq/T0YNncORN5BHuaahtkrxwofTccj2QZB89rqJr3zMkw/MjNNV9KlPbcrlzFAeLbeZW3kuQPSz2GExnLh4IJeSqseZ3OIkpn90p3lkoDMMNzyr58PeJxQttwBIDyhj3XDyV26jSpJqiME429l95ESkZrdl8Y/eOvFkLJc+8CCIRF2v2u+MGs/aP2BCu7Cn95DyJUpgaDBjEB0JoFDOzir9joe0tQByn737W7Ejhz5/dC3oyrsb5w24Aybomyy2nolMIFLcGYjTpoKkOOiN4g74Rbk7yTlgL9Mn594T/L+Gk+otpzt0H7MFQIeuiQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQA/qr/gwHxS03VzId44GzthuK/z7mHBYh6WbrfZp+y4qpRPSYBEbRJHnskHP9zoUDYeJKS7ha/099n4N2WiAZCv3/EhhPCIzZ6+1KOD5nDMBI6xfD7/+4WWO9Tm9Cjq1MajKCAbSjeGhVg2TupYasdUZe0A9okgY9M0X6Al0OHFmmViMGi04PmBs9fm2UAK7RqndCHT6Zj7bqAq2GNtbEKvZOXmVdBdSApCt+Terxul66UyS/NoQmxh2Ko9ubbzpzm0CN2l5oeHnsdh4AfcmlYwbqWukwlrZPVx90CjfU2z+PC6QkNGkVyTm0Pd22ZZ2inDnjqKlQnLki7IloMoSfVO',
        },
        function(profile, done) {
            console.log("saml strat, ", profile)
            done(null, {
                email: profile.email,
                name: profile.name
            })
        }
    ));
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
    passportObject: passport,
    authentication: function(req, res, next) {
        passport.authenticate('jwt',  { session: false }, function(err, jwtPayload) {
            if (err) { return next(err); }
            if (!jwtPayload) { return res.redirect('/login'); }
            req.body.jwtPayload = jwtPayload;
            next()
        })(req, res, next);
    }
}