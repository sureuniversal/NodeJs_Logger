let tracer= null;
class logger {
    constructor(logLevel, stackIndex)
    {
        let formatString;
        switch (process.env.RUN_ENV) {
            case "dev": 
            case "staging":
                formatString = "{{timestamp}} [-1] [{{title}}] {{path}}:{{line}} ({{method}}) {{message}}";
                break;
            default:
                formatString = "{{timestamp}} [-1] [{{title}}] {{file}}:{{line}} ({{method}}) {{message}}";
                break;
        }

        tracer = require('tracer').console({
            preprocess :  function(data){ data.title = data.title.toUpperCase(); },
            format : formatString,       
            level: logLevel,
            stackIndex: stackIndex,
            dateformat : "yyyy-mm-dd'T'HH:MM:ss,l"
        });
    }

    static error(err = '')
    {      
       tracer.error(err);      
    }

    static warn(msg)
    {
        tracer.warn(msg);
    }

    static debug(msg)
    {
        tracer.debug(msg);
    }

    static info(msg)
    {
        tracer.info(msg);
    }

    static verbose(msg)
    {
        tracer.trace(msg);
    }
}

var logLevel = process.env.LOG_LEVEL || 'debug';

// Always need the stackIndex to be 2 so the log shown 
// will be from the line that initiated the log not the helper classes
new logger(logLevel, 2);
module.exports = { logger }