const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Auth', function() {
    let server 
    this.timeout(15000);
    before( done => {
        delete require.cache[require.resolve('../server')];
        server = require( '../server' )
        server.on( "app_started", ()=>{
            done()
        })
    })
    after((done)=>{
        server.close(done)
    })
    describe('Employer Login', () => {
      it('should return ok and a token', () => {
        return post('/api/auth/login', {email:'e1@test.com', password:'test'}).then((res)=>{
            assert.notEqual(res.token, null)
            assert.ok(res.success)
            return Promise.resolve()
        })
      });
      it('should return false', () => {
        return post('/api/auth/login', {email:'e1@test.com', password:'bad'}).then((res)=>{
            assert.ok(!res.success)
            return Promise.resolve()
        })
      });
    });
    describe('Recruiter Login', () => {
      it('should return ok and a token', () => {
        return post('/api/auth/login', {email:'r1@test.com', password:'test'}).then((res)=>{
            assert.notEqual(res.token, null)
            assert.ok(res.success)
            return Promise.resolve()
        })
      })
      it('should return false', () => {
        return post('/api/auth/login', {email:'r1@test.com', password:'bad'}).then((res)=>{
            assert.ok(!res.success)
            return Promise.resolve()
        })
      })
    });
    describe('Bad Email Login', () => {
      it('should return false', () => {
        return post('/api/auth/login', {email:'bad.email', password:'bad'}).then((res)=>{
            assert.ok(!res.success)
            return Promise.resolve()
        })
      })
    });
});