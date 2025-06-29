const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

// Define colors for development (only used in dev mode)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Development format: colored and human-readable
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Production format: structured JSON for log aggregation
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // Include stack traces
  winston.format.json(),
);

// Test format: minimal output
const testFormat = winston.format.combine(
  winston.format.printf(
    (info) => `${info.level}: ${info.message}`,
  ),
);

// Create transports based on environment
const createTransports = () => {
  const transports = [];

  if (isTest) {
    // Minimal logging for tests
    transports.push(
      new winston.transports.Console({
        level: 'error', // Only show errors in tests
        format: testFormat,
        silent: process.env.TEST_SILENT === 'true', // Can be silenced completely
      })
    );
  } else if (isDevelopment) {
    // Development: colored console output
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: developmentFormat,
      })
    );
  } else {
    // Production: structured JSON to stdout/stderr for container/systemd logging
    transports.push(
      new winston.transports.Console({
        level: 'info',
        format: productionFormat,
        handleExceptions: true,
        handleRejections: true,
      })
    );
  }

  return transports;
};

// Create the logger
const Logger = winston.createLogger({
  level: isDevelopment ? 'debug' : isTest ? 'error' : 'info',
  levels,
  transports: createTransports(),
  exitOnError: false, // Don't exit on handled exceptions
});

// Handle uncaught exceptions and rejections in production
if (isProduction) {
  Logger.exceptions.handle(
    new winston.transports.Console({
      format: productionFormat,
    })
  );
  
  Logger.rejections.handle(
    new winston.transports.Console({
      format: productionFormat,
    })
  );
}

module.exports = Logger; 