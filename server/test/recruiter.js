const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Recruiter', function() {
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
    var currentProfile
    describe('Get profile', () => {
        it('should return ok and data', () => {
            return get('/api/recruiter/getProfile', process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.profile.email, null)
                    assert.notEqual(res.profile.firstName, null)
                    currentProfile = res.profile
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Set Profile', () => {
        it('check can set', () => {
            return post(`/api/recruiter/setProfile`, {
                firstName: "Test",
                lastName: "Test2"
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
        it('should return ok and data', () => {
            return get('/api/recruiter/getProfile', process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.profile.email, null)
                    assert.strictEqual(res.profile.firstName, "Test")
                    assert.strictEqual(res.profile.lastName, "Test2")
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('reset data', () => {
            return post(`/api/recruiter/setProfile`, {
                ...currentProfile
            }, process.env.recruiterToken).then((res)=>{                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
});
