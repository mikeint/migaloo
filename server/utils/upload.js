const aws = require('aws-sdk')
const s3 = new aws.S3()
const logger = require('../utils/logging');
const settings = require('../config/settings');
const bucketName = settings.uploads.bucketName;
const supportedMimeTypes = settings.uploads.supportedMimeTypes;

const multer  = require('multer')
const multerS3  = require('multer-s3')
const useAWS = process.env.AWS ? true : false;
const db = require('../utils/db')
const postgresdb = db.postgresdb
const pgp = db.pgp

const uploadJwtParams = (req, res, next) => {
    req.params.jwtPayload = req.body.jwtPayload 
    next()
}
/**
 * Get ids from the database for the new file
 * path exmaple: 'resume/'
 */
const getFileId = (mimeType, transaction) => {
    return (transaction==null?postgresdb:transaction)
        .one('INSERT INTO file_upload (mime_type) \
        VALUES (${mimeType}) RETURNING file_id',
        {mimeType:mimeType})
}
/**
 * Genereate the middle ware to uplaod files to
 * path exmaple: 'resume/'
 */
const generateUploadMiddleware = (path) => {
    return (useAWS ? 
        multer({
            storage: multerS3({
                    s3: s3,
                    bucket: bucketName,
                metadata: function (req, file, callback) {
                    callback(null, {fieldName: file.fieldname});
                },
                key: function (req, file, callback) {
                    const ext = supportedMimeTypes[file.mimetype]
                    var sizeName = file.originalname.substring(0, file.originalname.indexOf("_"));
                    if(ext == null){
                        return callback(new Error("Unsupported file type"))
                    }
                    var promise
                    if(req.params.fileId == null)
                        promise = getFileId(file.mimetype)
                    else
                        promise = Promise.resolve({file_id:req.params.fileId})
                        
                    promise.then((ret) => {
                        const fileId = ret.file_id
                        var newName = `${fileId}.${ext}`
                        req.params.fileId = fileId
                        req.params.mimeType = file.mimetype
                        if(sizeName == "small" || sizeName == "medium"){
                            newName = sizeName+"_"+newName
                        }
                        if(req.params.fileNames){
                            req.params.fileNames.push(newName)
                        }else
                            req.params.fileNames = [newName]

                        callback(null,  path+newName)
                    })
                    .catch(err => {
                        callback(err)
                        logger.error('Upload Image', {tags:['image', 's3'], url:req.originalUrl, body:req.body, params:req.params, error:err});
                    });
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
                    const ext = supportedMimeTypes[file.mimetype]
                    if(ext == null){
                        return callback(new Error("Unsupported file type"))
                    }
                    var sizeName = file.originalname.substring(0, file.originalname.indexOf("_"));
                    var promise
                    if(req.params.fileId == null)
                        promise = getFileId(file.mimetype)
                    else
                        promise = Promise.resolve({file_id:req.params.fileId})

                    promise.then((ret) => {
                        const fileId = ret.file_id
                        var newName = `${fileId}.${ext}`
                        req.params.fileId = fileId
                        if(sizeName === "small" || sizeName === "medium"){
                            newName = sizeName+"_"+newName
                        }
                        if(req.params.fileNames){
                            req.params.fileNames.push(newName)
                        }else
                            req.params.fileNames = [newName]
                        callback(null, newName)
                    })
                    .catch(err => {
                        callback(err)
                        logger.error('Upload Image', {tags:['image', 's3'], url:req.originalUrl, body:req.body, params:req.params, error:err});
                    });
                }
            })
        })
    )
}
module.exports = {
    generateUploadMiddleware: generateUploadMiddleware,
    uploadJwtParams: uploadJwtParams,
    getFileId: getFileId
}