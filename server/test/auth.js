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
			post('/api/auth/login', {email:'e1@test.com', password:'test'}).then((res)=>{
				process.env.accountManagerToken = res.token
				post('/api/auth/login', {email:'r1@test.com', password:'test'}).then((res)=>{
					process.env.recruiterToken = res.token
					done()
				}).catch(done)
			}).catch(done)
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
    describe('Get current data', () => {
		it('should return success', () => {
			return get('/api/auth/current', process.env.accountManagerToken).then((res)=>{
				assert.ok(res.success)
				return Promise.resolve()
			})
		})
    });
    describe('Reset Email', () => {
		it('should return success', () => {
			return post('/api/auth/sendPasswordReset', {email:"e1@test.com"}).then((res)=>{
				assert.ok(res.success)
				return Promise.resolve()
			})
		})
    });
});