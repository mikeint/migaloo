const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('AutoComplete', function() {
    let server 
    this.timeout(15000);
    before( done => {
        delete require.cache[require.resolve('../server')];
        server = require( '../server' )
        server.on( "app_started", ()=>{
            post('/api/auth/login', {email:'r1@test.com', password:'test'}).then((res)=>{
                process.env.recruiterToken = res.token
                done()
            }).catch(done)
        })
    })
    after((done)=>{
        server.close(done)
    })
    describe('Job Type', () => {
        it('check list', () => {
            return get(`/api/autocomplete/jobType`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobTypeList, null)
                    assert.notStrictEqual(res.jobTypeList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search', () => {
            return get(`/api/autocomplete/jobType/Soft`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobTypeList, null)
                    assert.notStrictEqual(res.jobTypeList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Open reason', () => {
        it('check list', () => {
            return get(`/api/autocomplete/openReason`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.openReasonList, null)
                    assert.notStrictEqual(res.openReasonList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search', () => {
            return get(`/api/autocomplete/openReason/New`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.openReasonList, null)
                    assert.notStrictEqual(res.openReasonList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Tags', () => {
        it('check list', () => {
            return get(`/api/autocomplete/tag`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.notStrictEqual(res.tagList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search', () => {
            return get(`/api/autocomplete/tag/c`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.notStrictEqual(res.tagList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check list by id', () => {
            return get(`/api/autocomplete/tagById/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.strictEqual(res.tagList.length, 1)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check list by id multiple', () => {
            return get(`/api/autocomplete/tagById/1,2,3`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.strictEqual(res.tagList.length, 3)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check list by type', () => {
            return get(`/api/autocomplete/tagByType/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.notStrictEqual(res.tagList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search by type', () => {
            return get(`/api/autocomplete/tagByType/1/c`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.notStrictEqual(res.tagList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search by type', () => {
            return get(`/api/autocomplete/tagByType/1/c`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.notStrictEqual(res.tagList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check add by type', () => {
            return post(`/api/autocomplete/addTag/1/blahblahblah`, {}, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagId, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search added by type', () => {
            return get(`/api/autocomplete/tagByType/1/blahblahblah`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.tagList, null)
                    assert.strictEqual(res.tagList.length, 1)
                    assert.strictEqual(res.tagList[0].tagName, 'blahblahblah')
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Denial reason', () => {
        it('check list', () => {
            return get(`/api/autocomplete/denialReason`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.denialReasonList, null)
                    assert.notStrictEqual(res.denialReasonList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check search', () => {
            return get(`/api/autocomplete/denialReason/Other`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.denialReasonList, null)
                    assert.notStrictEqual(res.denialReasonList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Plan', () => {
        it('check list', () => {
            return get(`/api/autocomplete/plans`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.plans, null)
                    assert.notStrictEqual(res.plans.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    
});
