const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Employer', function() {
    let server 
    let companyId
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
        it('should return ok', () => {
            return get('/api/employer/getAccountManagers', process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.accountManagers, null)
                    assert.notEqual(res.accountManagers.length, 0)
                    
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can search', () => {
            return get(`/api/employer/getAccountManagers/search/Smith`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.accountManagers, null)
                    assert.notEqual(res.accountManagers.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Generate Employer token', () => {
        it('should return ok', () => {
            return post('/api/employer/generateToken', {userId:400}, process.env.accountManagerToken).then((res)=>{
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
