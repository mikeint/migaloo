const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Plan', function() {
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
    var planId
    describe('Set Plan', () => {
        it('should return ok', () => {
            return post('/api/plan/setPlan', {
                "planTypeId":2,
                "companyId":500,
                "subscriptionValue":500000
            }, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.planId, null)
                    planId = res.planId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return new plan', () => {
            return get('/api/company/get/500', process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.equal(res.companies[0].subscriptionRemaining, 500000)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Add to Plan', () => {
        it('should return ok', () => {
            return post('/api/plan/addToPlan', {
                "companyId":500,
                "planId":planId,
                "subscriptionValue":500000
            }, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return updated plan', () => {
            return get('/api/company/get/500', process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.equal(res.companies[0].subscriptionRemaining, 500000+500000)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    
});
