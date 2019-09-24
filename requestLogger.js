let uuid = require('uuid');
let logger = require('./logger').logger;
module.exports = class requestLogger {
    constructor(req) {
        req.logger = this;
        let headers = req.headers;
        let correlationID = headers.correlationid;

        if(correlationID != undefined)
        {
            this.correlationID = correlationID;
        }
        else
        {
            this.correlationID = uuid.v4();
        }
        
        let bodyStr = '';
        if(req.body)
        {
            var bodySanitized = sanitize(req.body);
            bodyStr = JSON.stringify(bodySanitized);     
        }

        var message = `${this.correlationID} Request recieved for path:${req.originalUrl} httpMethod:'${req.method}' body: ${bodyStr} header: ${JSON.stringify(req.headers)} sourceIp: '${req.connection.remoteAddress}'`;
        logger.debug(message);
    }

    error(err = "") {
        var message = this.formatMessage(err);
        logger.error(message);
    }

    warn(msg = "") {
        var message = this.formatMessage(msg);
        logger.warn(message);
    }

    debug(msg = "") {
        var message = this.formatMessage(msg);
        logger.debug(message);
    }

    info(msg = "") {
        var message = this.formatMessage(msg);
        logger.info(message);
    }

    verbose(msg = "") {
        var message = this.formatMessage(msg);
        logger.trace(message);
    }

    formatMessage(msg)
    {
        var messageSanitized = sanitize(msg);
        var messageStr = JSON.stringify(messageSanitized);     
        var message = `${this.correlationID} ${messageStr}`;
        return message;
    }

    getCorrelationId() {
       return this.correlationID;
    }

    // This middleware is used as the first filter in the request pipeline 
    // and is used to setup the request logging mechanism
    static onRequestRecieved(req, res, next) {
        new requestLogger(req);
        next();
    }

    static onInternalRequestRecieved(req, res, next) {
        let requestLoggerObj = new requestLogger(req);
        requestLoggerObj.debug("Internal request received");
        next();
    }
}

function sanitize(msg)
{
    if(msg instanceof Object)
    {
        if (msg.password)
        {
            // we need to make sure not to overwrite the original messsage so we clone it
            var cloned = JSON.parse(JSON.stringify(msg));
            cloned.password = '*****';
            return cloned;
        }
    }

    return msg;
}  
