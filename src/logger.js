import winston from 'winston'
import dotenv from 'dotenv'
dotenv.config()

const myCustomLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'orange',
        warning: 'yellow',
        info: 'blue',
        http: 'green',
        debug: 'white'
    }
}

winston.addColors(myCustomLevels.colors)

const createLogger = env => {
    switch(env){
        case "PROD":
            return winston.createLogger({
                levels: myCustomLevels.levels,
                level: 'info',
                transports: [
                    new winston.transports.File({
                        filename: './src/errors.log',
                        format: winston.format.simple()
                    })
                ]
            })            
        case "DEV":
            return winston.createLogger({
                levels: myCustomLevels.levels,
                level: 'debug',
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                          )
                    })
                ]
            })            
        default:
            return winston.createLogger({
                levels: myCustomLevels.levels,
                level: 'debug',
                transports: [
                    new winston.transports.Console({
                        format: winston.format.simple()                        
                    })
                ]
            })
    }

}

const logger = createLogger(process.env.ENVIRONMENT)

export default logger