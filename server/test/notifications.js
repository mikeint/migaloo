const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Notifications', function() {
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
    describe('Get last Id', () => {
        it('should return ok and last id', () => {
            return get('/api/notifications/lastId', process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.lastNotificationId, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List New Notifications', () => {
        it('check that can list', () => {
            return get(`/api/notifications/listNew`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.notificationList, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can list after', () => {
            return get(`/api/notifications/listNew/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.notificationList, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Set Seen', () => {
        it('check do nothing success', () => {
            return post(`/api/notifications/setSeen`, {
                notificationIds:[]
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
        it('check can set seen', () => {
            return post(`/api/notifications/setSeen`, {
                notificationIds:[1]
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
    
    describe('List Any Notifications', () => {
        it('check that can list', () => {
            return get(`/api/notifications/list`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.notificationList, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can list after', () => {
            return get(`/api/notifications/list/10/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.notificationList, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
});
