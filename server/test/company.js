const assert = require('assert');
const {get, post} = require('./http');
process.env.NODE_ENV = 'mocha'

describe('Company', function() {
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
    describe('Create', () => {
        it('should return ok', () => {
            return post('/api/company/addCompany', {
                "companyName": "Test Company",
                "department": "Test Dept",
                "imageId": 1,
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
                }
            }, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.companyId, null)
                    companyId = res.companyId
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
        it('check that was created', () => {
            return get(`/api/company/get/${companyId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.companies, null)
                    assert.strictEqual(res.companies[0].companyName, 'Test Company')
                    assert.strictEqual(res.companies[0].address.addressLine1, 'Tremont St')
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
            return post('/api/company/setCompanyProfile', {
                "companyId":companyId,
                "companyName": "Test Company Edit",
                "department": "Test Dept Edit",
                "imageId": 2,
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
            return get(`/api/company/get/${companyId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.companies, null)
                    assert.strictEqual(res.companies[0].companyName, 'Test Company Edit')
                    assert.strictEqual(res.companies[0].address.addressLine1, 'Tremont St Edit')
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
          return get('/api/company/list/', process.env.accountManagerToken).then((res)=>{
              try{
                  assert.ok(res.success)
                  assert.notEqual(res.companies, null)
                  assert.notStrictEqual(res.companies.length, 0)
                  return Promise.resolve()
              }catch(e){
                  console.error(res)
                  return Promise.reject(e)
              }
          })
        });
    });
    describe('Add Contact', () => {
        it('by email', () => {
            return post('/api/company/addContactToCompany/', {
                companyId:companyId,
                userIds: [],
                emails: ["e2@test.com"]
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
        it('by ids', () => {
            return post('/api/company/addContactToCompany/', {
                companyId:companyId,
                userIds: [102], // e3
                emails: []
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
        it('by email and id', () => {
            return post('/api/company/addContactToCompany/', {
                companyId:companyId,
                userIds: [103], // e4
                emails: ["e5@test.com"]
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
    describe('Set admin', () => {
        it('add as primary', () => {
            return post(`/api/company/setContactAdmin`, {
                companyId:companyId,
                isPrimary:true,
                companyContactId: 101
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
        it('remove as primary', () => {
            return post(`/api/company/setContactAdmin`, {
                companyId:companyId,
                isPrimary:false,
                companyContactId: 101
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
        it('remove self', () => {
            return post(`/api/company/setContactAdmin`, {
                companyId:companyId,
                isPrimary:false,
                companyContactId: 100
            }, process.env.accountManagerToken).then((res)=>{
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
    describe('List Contacts', () => {
        it('list', () => {
            return get(`/api/company/getCompanyContactList/${companyId}`, process.env.accountManagerToken).then((res)=>{
                try{
                    assert.ok(res.success)
                    assert.notEqual(res.contactList, null)
                    assert.notStrictEqual(res.contactList.length, 0)
                    return Promise.resolve()
                }catch(e){
                    console.error(res)
                    return Promise.reject(e)
                }
            })
        });
    });
    describe('Remove Contact', () => {
        it('check if search returns data', () => {
            return post(`/api/company/removeContactFromCompany`, {
                companyId:companyId,
                userIds: [101, 102, 103, 104]
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
    describe('Remove Company', () => {
        it('check if returns ok', () => {
            return post(`/api/company/deleteCompany`, {
                companyId:companyId
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
