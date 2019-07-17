const assert = require('assert');
const {get, post, imageUpload} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Candidate', function() {
    let server 
    let candidateId
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
    describe('Create', () => {
        it('should return ok', () => {
            return post('/api/candidate/create', {
                "firstName": "Test",
                "lastName": "Test",
                "email": "tes1t@test.com",
                "salary": 15,
                "jobTypeId": 2,
                "experience": 3,
                "commute": 10,
                "address": {
                    "address": "Tremont St, Boston, MA, US",
                    "formattedAddress": "Tremont St, Boston, MA, US",
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
                },
                "tagIds": [2, 3],
                "benefitIds": [2, 3],
                "url": "test.com",
                "relocatable": true
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateId, null)
                    candidateId = res.candidateId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that was created', () => {
            return get(`/api/candidate/get/${candidateId}/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.strictEqual(res.candidateList[0].firstName, 'Test')
                    assert.strictEqual(res.candidateList[0].email, 'tes1t@test.com')
                    assert.deepEqual(res.candidateList[0].tagIds, [2, 3])
                    assert.deepEqual(res.candidateList[0].benefitIds, [2, 3])
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Edit', () => {
        it('should return ok', () => {
            return post('/api/candidate/edit', {
                "candidateId":candidateId,
                "firstName": "TestEdit",
                "lastName": "TestEdit",
                "email": "tes2t@test.com",
                "salary": 14,
                "jobTypeId": 3,
                "commute": 10,
                "experience": 4,
                "address": {
                    "address": "Tremont St, Boston, MA, US",
                    "formattedAddress": "Tremont St, Boston, MA, US",
                    "addressLine1": "Tremont St Edit",
                    "addressLine2": "",
                    "placeId": "ChIJj6GqWxd644kRWOvBfFlMVrsEdit",
                    "city": "BostonEdit",
                    "stateProvince": "MassachusettsEdit",
                    "stateProvinceCode": "MA",
                    "country": "United States",
                    "countryCode": "US",
                    "postalCode": "",
                    "lat": 42.340,
                    "lon": -71.077
                },
                "tagIds": [3, 4, 5],
                "benefitIds": [1, 3],
                "url": "test-edit.com",
                "relocatable": false
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
        it('check that was editted', () => {
            return get(`/api/candidate/get/${candidateId}/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.strictEqual(res.candidateList[0].firstName, 'TestEdit')
                    assert.strictEqual(res.candidateList[0].email, 'tes2t@test.com')
                    assert.strictEqual(res.candidateList[0].url, 'test-edit.com')
                    assert.deepEqual(res.candidateList[0].tagIds, [3, 4, 5])
                    assert.deepEqual(res.candidateList[0].benefitIds, [1, 3])
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
            return imageUpload(`/api/candidate/uploadImage/${candidateId}`, process.env.recruiterToken).then((res)=>{
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
            return get(`/api/profileImage/view/candidate/small/${candidateId}`, process.env.recruiterToken).then((res)=>{
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
    describe('Upload pdf', () => {
        it('should return status 200', () => {
            return imageUpload(`/api/resume/upload/${candidateId}`, process.env.recruiterToken).then((res)=>{
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
            return get(`/api/resume/view/${candidateId}`, process.env.recruiterToken).then((res)=>{
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
    
    describe('List', () => {
        it('check can list', () => {
          return get('/api/candidate/list/', process.env.recruiterToken).then((res)=>{
              try{
                  assert.ok(res.success)
                  assert.notEqual(res.candidateList, null)
                  assert.notStrictEqual(res.candidateList.length, 0)
                  return Promise.resolve()
              }catch(e){
                  console.error(res)
                  return Promise.reject(e)
              }
          })
        });
        it('check can search', () => {
            return get('/api/candidate/list/1/test', process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.notStrictEqual(res.candidateList.length, 0)
                    assert.strictEqual(res.candidateList[0].firstName, 'TestEdit')
                    assert.strictEqual(res.candidateList[0].email, 'tes2t@test.com')
                    assert.strictEqual(res.candidateList[0].url, 'test-edit.com')
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List for Job', () => {
        it('check can list', () => {
            return get('/api/candidate/listJobs/1000', process.env.recruiterToken).then((res)=>{
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
    describe('Delete', () => {
        it('check can delete', () => {
            return post('/api/candidate/delete/', {candidateId: candidateId}, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check was deleted search', () => {
            return get(`/api/candidate/get/${candidateId}/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.strictEqual(res.candidateList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('List for job', () => {
        it('check if search returns data', () => {
            return get(`/api/candidate/listForJob/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.notEqual(res.postData, null)
                    assert.equal(res.postData.postId, 1)
                    assert.notStrictEqual(res.candidateList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Notes', () => {
        var addedNoteIds
        it('check if can add notes', () => {
            return post(`/api/candidate/addNote/${candidateId}`, {note: "text of note"}, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.noteIds, null)
                    addedNoteIds = res.noteIds
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check if can list notes', () => {
            return get(`/api/candidate/listNotes/${candidateId}`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.notes, null)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check if can delete notes', () => {
            return post(`/api/candidate/deleteNote/${candidateId}`, {noteId:addedNoteIds[0]}, process.env.recruiterToken).then((res)=>{
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

describe('Candidate Recruiter 2', function() {
    let server 
    let candidateId
    this.timeout(15000);
    before( done => {
        delete require.cache[require.resolve('../server')];
        server = require( '../server' )
        server.on( "app_started", ()=>{
            post('/api/auth/login', {email:'r2@test.com', password:'test'}).then((res)=>{
                process.env.recruiterToken = res.token
                done()
            }).catch(done)
        })
    })
    after((done)=>{
        server.close(done)
    })
    describe('Create', () => {
        it('should return ok', () => {
            return post('/api/candidate/create', {
                "firstName": "Test2",
                "lastName": "Test2",
                "email": "tes2t@test.com",
                "salary": 15,
                "jobTypeId": 2,
                "experience": 3,
                "commute": 10,
                "address": {
                    "address": "Tremont St, Boston, MA, US",
                    "formattedAddress": "Tremont St, Boston, MA, US",
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
                },
                "tagIds": [2, 3],
                "url": "test.com",
                "relocatable": true
            }, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateId, null)
                    candidateId = res.candidateId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that was created', () => {
            return get(`/api/candidate/get/${candidateId}/1`, process.env.recruiterToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.candidateList, null)
                    assert.strictEqual(res.candidateList[0].firstName, 'Test2')
                    assert.strictEqual(res.candidateList[0].email, 'tes2t@test.com')
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
});