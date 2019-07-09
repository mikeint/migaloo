const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('landing', function() {
    let server 
    let eventMessageId
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
    describe('Hello There', () => {
        it('should return ok', () => {
            return post('/api/landing/helloThere', {
                "uuid":"1",
                "newUser":false
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Signup Email', () => {
        it('should return ok', () => {
            return post('/api/landing/sendContactEmail', {
                "name":"1",
                "email":"1@1.com",
                "message":"hi"
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return error', () => {
            return post('/api/landing/sendContactEmail', {
                "email":"1@1.com",
                "message":"hi"
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(!res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return error', () => {
            return post('/api/landing/sendContactEmail', {
                "name":"1",
                "message":"hi"
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(!res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return error', () => {
            return post('/api/landing/sendContactEmail', {
                "name":"1",
                "email":"1@1.com"
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(!res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
});
