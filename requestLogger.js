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
            bodyStr = sanitize(req.body);
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
        var message = `${this.correlationID} ${messageSanitized}`;
        return message;
    }

    getCorrelationId() {
       return this.correlationID;
    }

    // This middleware is used as the first filter in the request pipeline 
    // and is used to setup the request logging mechanism
    static onRequestRecieved(req, res, next) {
        let obj = new requestLogger(req);
        const defaultWrite = res.write;
        const defaultEnd = res.end;
        const chunks = [];
      
        res.write = (...restArgs) => {
          chunks.push(new Buffer(restArgs[0]));
          defaultWrite.apply(res, restArgs);
        };
      
        res.end = (...restArgs) => {
          if (restArgs[0]) {
            chunks.push(new Buffer(restArgs[0]));
          }

          const body = Buffer.concat(chunks).toString('utf8');
          requestLogger.onResponseSent(obj, body);
          defaultEnd.apply(res, restArgs);
        };
      
        next();
    }

    static onResponseSent(obj, body) {
        obj.debug(`Response body: ${body}`);
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
        let stringified = JSON.stringify(msg);
        if (msg.password)
        {
            // we need to make sure not to overwrite the original messsage so we clone it
            let cloned = JSON.parse(stringified);
            cloned.password = '*****';
            stringified = JSON.stringify(cloned);            
        }
        return stringified;
    }
    return msg;
}  
