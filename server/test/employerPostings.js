const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Employer Postings', function() {
    let server 
    let postId
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
    describe('Create Post', () => {
        it('should return ok', () => {
            return post('/api/employerPostings/create', {
                company:500, 
                title:'Software person', 
                requirements:'Do a bunch of stuff',
                preliminary:true, 
                experience:5, 
                salary:85,
                interviewCount:2, 
                openReason:1,
                openReasonExplain:null, 
                openPositions:1, 
                jobType:1,
                autoAddRecruiters: false,
                tagIds: [1,2,3,4],
                address: {
                    "addressLine1": "Tremont St",
                    "addressLine2": "",
                    "placeId": "ChIJj6GqWxd644kRWOvBfFlMVrs",
                    "city": "Boston",
                    "stateProvince": "Massachusetts",
                    "stateProvinceCode": "MA",
                    "country": "United States",
                    "countryCode": "US",
                    "postalCode": "",
                    "lat": 42.340922,
                    "lon": -71.0773107
                }
            }, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.postId, null)
                    postId = res.postId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that was posted', () => {
            return get(`/api/employerPostings/get/${postId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobPosts, null)
                    assert.notEqual(res.jobPosts.length, 0)
                    assert.strictEqual(res.jobPosts[0].title, 'Software person')
                    assert.strictEqual(res.jobPosts[0].address.addressLine1, 'Tremont St')
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    
    describe('Edit Post', () => {
        it('should return ok', () => {
            return post('/api/employerPostings/edit', {
                postId: postId,
                company:500, 
                title:'Software person Test', 
                requirements:'Do a bunch of stuff Test',
                preliminary:true, 
                experience:5, 
                salary:85,
                interviewCount:2, 
                openReason:1,
                openReasonExplain:null, 
                openPositions:1, 
                jobType:1,
                autoAddRecruiters: false,
                tagIds: [1,2,3,4],
                address: {
                    "addressLine1": "Tremont St Test",
                    "addressLine2": "",
                    "placeId": "ChIJj6GqWxd644kRWOvBfFlMVrs",
                    "city": "Boston",
                    "stateProvince": "Massachusetts",
                    "stateProvinceCode": "MA",
                    "country": "United States",
                    "countryCode": "US",
                    "postalCode": "",
                    "lat": 42.340922,
                    "lon": -71.0773107
                }
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
        it('check that was editted', () => {
            return get(`/api/employerPostings/get/${postId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobPosts, null)
                    assert.notEqual(res.jobPosts.length, 0)
                    assert.strictEqual(res.jobPosts[0].title, 'Software person Test')
                    assert.strictEqual(res.jobPosts[0].address.addressLine1, 'Tremont St Test')
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List Posts', () => {
        it('check that can list', () => {
            return get(`/api/employerPostings/list`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.jobPosts, null)
                    assert.notEqual(res.jobPosts.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List Recruiters', () => {
        it('check that can list', () => {
            return get(`/api/employerPostings/listRecruiters/${1}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.recruiters, null)
                    assert.notEqual(res.recruiters.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List New Recruiters', () => {
        it('check that can list', () => {
            return get(`/api/employerPostings/listNewRecruiters/${postId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.recruiters, null)
                    assert.notEqual(res.recruiters.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
});
