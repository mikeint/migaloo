const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Recruiter Jobs', function() {
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
    var jobId
    describe('List Jobs', () => {
        it('should return ok and data', () => {
            return get('/api/recruiterJobs/list', process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobList, null)
                    assert.notStrictEqual(res.jobList.length, 0)
                    jobId = res.jobList[0].postId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return ok and data', () => {
            return get(`/api/recruiterJobs/get/${jobId}`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobList, null)
                    assert.notStrictEqual(res.jobList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List Jobs For Candidates', () => {
        it('should return ok and data', () => {
            return get('/api/recruiterJobs/listForCandidate/1000', process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobList, null)
                    assert.notStrictEqual(res.jobList.length, 0)
                    assert.notEqual(res.candidate, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('should return ok and data', () => {
            return get(`/api/recruiterJobs/getCandidateForJob/1000/${jobId}`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobList, null)
                    assert.notStrictEqual(res.jobList.length, 0)
                    assert.notEqual(res.candidate, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
});
