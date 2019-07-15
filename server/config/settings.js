module.exports = {
    aws:{
        accessKey: 'AKIAZ4EK3DJ4RFNNZEOA',
        secretKey: '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',
    },
    hash:{
        secretOrKey: 'ThIs!StH3s3crEtKey',
    },
    dbConfig:{
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_DATABASE || 'migaloo_prod',
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    },
    s3:{
        bucketName: 'migaloo-data'
    }
}