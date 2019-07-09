const http = require('http');
const FormData = require('form-data');
const fs = require('fs');

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
const imageUpload = (path, token) =>{
    return new Promise((resolve, reject)=>{
        const readStream = fs.createReadStream('./test/image.png');
         
        const form = new FormData();
        form.append('photo', readStream);

        let rawData = '';
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            method: 'POST',
            path: path,
            headers: {
                ...{'Authorization': token != null ? token : null},
                ...form.getHeaders()
            }
        }, (res)=>{
            res.on('data', (chunk) => { rawData += chunk; });
        })
        form.pipe(req);
        req.on('response', function(res) {
            resolve({statusCode:res.statusCode })
        });
        
        req.on('error', (e) => {
            console.error(`Got error: ${e.message}`);
            reject(e.message)
        });
    })
}
const pdfUpload = (path, token) =>{
    return new Promise((resolve, reject)=>{
        const readStream = fs.createReadStream('./test/resume.pdf');
         
        const form = new FormData();
        form.append('file', readStream);

        let rawData = '';
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            method: 'POST',
            path: path,
            headers: {
                ...{'Authorization': token != null ? token : null},
                ...form.getHeaders()
            }
        }, (res)=>{
            res.on('data', (chunk) => { rawData += chunk; });
        })
        form.pipe(req);
        req.on('response', function(res) {
            resolve({statusCode:res.statusCode })
        });
        
        req.on('error', (e) => {
            console.error(`Got error: ${e.message}`);
            reject(e.message)
        });
    })
}
module.exports = {get, post, imageUpload, pdfUpload}