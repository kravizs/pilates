import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const logFile = process.env.LOG_FILE || 'logs/app.log';

// Ensure logs directory exists
const logDir = path.dirname(logFile);

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      
      if (stack) {
        log += `\nStack: ${stack}`;
      }
      
      if (Object.keys(meta).length > 0) {
        log += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
      }
      
      return log;
    })
  ),
  defaultMeta: { service: 'hi-studio-backend' },
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: logFile,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Write error logs to separate file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        let log = `${timestamp} ${level}: ${message}`;
        if (stack) {
          log += `\n${stack}`;
        }
        return log;
      })
    )
  }));
}

// Add test transport for testing
if (process.env.NODE_ENV === 'test') {
  logger.transports = [];
  logger.add(new winston.transports.Console({
    level: 'error',
    silent: true
  }));
}

export { logger };

// HTTP request logger function
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    const logData = {
      method,
      url,
      statusCode,
      responseTime: `${duration}ms`,
      ip,
      userAgent: req.get('User-Agent') || 'Unknown',
      userId: req.user?.id || 'anonymous'
    };
    
    if (statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};