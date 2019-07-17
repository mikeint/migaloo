const assert = require('assert');
const {get, post, imageUpload} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Account Manager', function() {
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
    describe('Get account managers', () => {
        let profile
        it('should return ok', () => {
            return get('/api/accountManager/getProfile', process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.profile, null)
                    profile = res.profile
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return ok', () => {
            return post(`/api/accountManager/setProfile`, profile, process.env.accountManagerToken).then((res)=>{
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
    describe('Upload image', () => {
        it('should return status 200', () => {
            return imageUpload(`/api/accountManager/uploadImage`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.strictEqual(res.statusCode, 200)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return success', () => {
            return get(`/api/profileImage/view/accountManager/small`, process.env.accountManagerToken).then((res)=>{
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
});
