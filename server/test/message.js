const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Messages', function() {
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
    describe('Create Message', () => {
        it('should return ok', () => {
            return post('/api/message/create', {
                "messageSubjectId":"1",
                "toId":"500",
                "messageType":1,
                "message":"Test Message"
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
    describe('Create Event', () => {
        it('should return ok', () => {
            return post('/api/message/create', {
                "messageSubjectId": "1",
                "toId": "500",
                "messageType": 2,
                "dateOffer": "2050-05-26T12:15:00.000Z",
                "minuteLength": 30,
                "locationType": 1,
                "subject": "Test"
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.messageId, null)
                    eventMessageId = res.messageId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return error', () => {
            return post('/api/message/create', {
                "messageSubjectId": "1",
                "toId": "500",
                "messageType": 2,
                "dateOffer": "1999-05-26T12:15:00.000Z",
                "minuteLength": 30,
                "locationType": 1,
                "subject": "Test"
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
            return post('/api/message/create', {
                "messageSubjectId": "1",
                "toId": "500",
                "messageType": 2,
                "dateOffer": "2050-05-26T12:15:00.000Z",
                "minuteLength": -100,
                "locationType": 1,
                "subject": "Test"
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
    
    describe('List Messages Conversations', () => {
        var messageSubjectId;
        it('check that can list', () => {
            return get(`/api/message/list`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.conversations[0].messageSubjectId, null)
                    messageSubjectId = res.conversations[0].messageSubjectId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can list', () => {
            return get(`/api/message/list/1/test`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can list specific', () => {
            return get(`/api/message/get/${messageSubjectId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.conversations, null)
                    assert.notEqual(res.conversations.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can list messages', () => {
            return get(`/api/message/listConversationMessages/${messageSubjectId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.messages, null)
                    assert.notEqual(res.messages.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that can list messages', () => {
            return get(`/api/message/listConversationMessages/after/${messageSubjectId}/1`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.messages, null)
                    assert.notEqual(res.messages.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    
    describe('List Locations', () => {
        it('check that can list', () => {
            return get(`/api/message/locations`, process.env.accountManagerToken).then((res)=>{
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
