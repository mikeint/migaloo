const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Employer Postings', function() {
    let server 
    let postId
    let candidateId
    let recruiterId
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
                companyId:500, 
                title:'Software person', 
                requirements:'Do a bunch of stuff',
                preliminary:true, 
                experience:5, 
                salary:85,
                interviewCount:2, 
                openingReasonId:1,
                openingReasonComment:null, 
                openPositions:1, 
                jobTypeId:1,
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
                companyId:500, 
                title:'Software person Test', 
                requirements:'Do a bunch of stuff Test',
                preliminary:true, 
                experience:5, 
                salary:85,
                interviewCount:2, 
                openingReasonId:1,
                openingReasonComment:null, 
                openPositions:1, 
                jobTypeId:1,
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
        it('check that can get', () => {
            return get(`/api/employerPostings/get/${postId}`, process.env.accountManagerToken).then((res)=>{
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
    describe('Delist Posts', () => {
        it('check that returns sucess', () => {
            return post(`/api/employerPostings/hide`, {postId:postId}, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that returns sucess', () => {
            return post(`/api/employerPostings/remove`, {postId:postId}, process.env.accountManagerToken).then((res)=>{
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
            return get(`/api/employerPostings/listNewRecruiters/${1}`, process.env.accountManagerToken).then((res)=>{
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
    describe('List Candidates', () => {
        it('check that can list', () => {
            return get(`/api/employerPostings/listCandidates/1`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.notEqual(res.candidateList.length, 0)
                    candidateId = res.candidateList[0].candidateId
                    recruiterId = res.candidateList[0].recruiterId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Set Read', () => {
        it('check returns success', () => {
            return post(`/api/employerPostings/setRead/1/${candidateId}/${recruiterId}`, {}, process.env.accountManagerToken).then((res)=>{
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
    describe('Set Accepted', () => {
        it('check returns success', () => {
            return post(`/api/employerPostings/setAccepted/migaloo/1/${candidateId}/${recruiterId}`, {
                accepted: true
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
        it('check returns success', () => {
            return post(`/api/employerPostings/setAccepted/employer/1/${candidateId}/${recruiterId}`, {
                accepted: true
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
        it('check returns success', () => {
            return post(`/api/employerPostings/setAccepted/job/1/${candidateId}/${recruiterId}`, {
                accepted: true,
                salary: 50000
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
        it('check returns success', () => {
            return post(`/api/employerPostings/setAccepted/migaloo/1/${candidateId}/${recruiterId}`, {
                accepted: false,
                denialReasonId: 1,
                denialComment: 'test',
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
    });
});
