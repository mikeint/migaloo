var { createLogger, format, transports } = require('winston'),
    WinstonCloudWatch = require('winston-cloudwatch');
const NODE_ENV = process.env.NODE_ENV || 'dev';

const logger = new createLogger({
    transports: [ ],
    exitOnError: false,
});

if (NODE_ENV == 'producation') {
    const os = require("os");
    const hostname = os.hostname();
    const config = {
        logGroupName: 'NodeAppProd',
        logStreamName: hostname,
        createLogGroup: false,
        createLogStream: true,
        formatLog: function (item) {
            return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
        }
    }
    // Create transport layer to cloud watch
    logger.add(new WinstonCloudWatch(config));
}else if (NODE_ENV == 'test') {
    const os = require("os");
    const hostname = os.hostname();
    const config = {
        logGroupName: 'NodeAppTest',
        logStreamName: hostname,
        createLogGroup: false,
        createLogStream: true,
        formatLog: function (item) {
            return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
        }
    }
    // Create transport layer to cloud watch
    logger.add(new WinstonCloudWatch(config));
}else{
    // Create transport layer to console
    logger.add(new (transports.Console)({
        timestamp: true,
        colorize: true,
        format: format.combine(
            format.colorize(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss' // Optional for choosing your own timestamp format.
            }),
            format.align(),
            format.printf((info) => {
                const {
                    timestamp, level, message, ...args
                } = info;
        
                const ts = timestamp.slice(0, 19).replace('T', ' ');
                return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
            })
        )
    }));
    
}
logger.level = process.env.LOG_LEVEL || "silly";


module.exports = logger;
