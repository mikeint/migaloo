const aws = require('aws-sdk')
const s3 = new aws.S3()

const multer  = require('multer')
const multerS3  = require('multer-s3')
const bucketName = require('../config/settings').s3.bucketName;
const MIME_TYPE_MAP = {
    'application/x-pdf':'pdf',
    'application/pdf':'pdf',
    'application/msword':'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template':'docx',
    'image/jpeg':'jpg',
    'image/png':'png',
}
const useAWS = process.env.AWS ? true : false;
/**
 * Genereate the middle ware to uplaod files to
 * path exmaple: 'resume/'
 */
var generateUploadMiddleware = (path) => {
    return (useAWS ? 
        multer({
            storage: multerS3({
                    s3: s3,
                    bucket: bucketName,
                metadata: function (req, file, cb) {
                    cb(null, {fieldName: file.fieldname});
                },
                key: function (req, file, cb) {
                    const ext = MIME_TYPE_MAP[file.mimetype]
                    var sizeName = file.originalname.substring(0, file.originalname.indexOf("_"));
                    var newName = `${req.params.fileName}.${ext}`
                    req.params.finalFileName = `${req.params.fileName}.${ext}`
                    if(sizeName == "small" || sizeName == "medium"){
                        newName = sizeName+"_"+newName
                    }
                    if(req.params.fileNames){
                        req.params.fileNames.push(newName)
                    }else
                        req.params.fileNames = [newName]
                    cb(null,  path+newName)
                }
            })
        })
        :
        multer({
            storage: multer.diskStorage({
                destination: (req, file, callback) => {
                    callback(null, 'public/'+path)
                },
                filename: (req, file, callback) => {
                    const ext = MIME_TYPE_MAP[file.mimetype]
                    var sizeName = file.originalname.substring(0, file.originalname.indexOf("_"));
                    req.params.finalFileName = `${req.params.fileName}.${ext}`
                    var newName = `${req.params.fileName}.${ext}`
                    if(sizeName === "small" || sizeName === "medium"){
                        newName = sizeName+"_"+newName
                    }
                    if(req.params.fileNames){
                        req.params.fileNames.push(newName)
                    }else
                        req.params.fileNames = [newName]
                    callback(null, newName)
                }
            })
        })
    )
}
module.exports = {
    generateUploadMiddleware: generateUploadMiddleware
}