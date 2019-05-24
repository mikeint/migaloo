const http = require('http');
process.env.NODE_ENV = 'mocha'
const get = (path, token) =>{
    return new Promise((resolve, reject)=>{
        http.get({
            hostname: 'localhost',
            port: 5000,
            path: path,
            headers: {
                ...{'Authorization': token != null ? token : null}
            }
        }, (res)=>{
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try{
                    resolve({...JSON.parse(rawData), statusCode:res.statusCode })
                }catch(e){
                    console.error(rawData, e)
                    resolve(e)
                }
            });
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
            resolve(e)
        });
    })
}
const post = (path, body, token) =>{
    const postData = JSON.stringify(body);
    return new Promise((resolve, reject)=>{
        let rawData = '';
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            method: 'POST',
            path: path,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                ...{'Authorization': token != null ? token : null}
            }
        }, (res)=>{
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try{
                    resolve({...JSON.parse(rawData), statusCode:res.statusCode })
                }catch(e){
                    console.error(rawData, e)
                    reject(e.message)
                }
            });
        })
        req.on('error', (e) => {
            console.error(`Got error: ${e.message}`);
            reject(e.message)
        });
        // Write data to request body
        req.write(postData);
        req.end();
    })
}
module.exports = {get, post}