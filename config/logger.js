const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const path = require("node:path");

const logfileError = path.resolve(__dirname, "..", "log", "error.log");
const logfileCombined = path.resolve(__dirname, "..", "log", "combined.log");


const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(label({ label: "rights" }), timestamp(), myFormat),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.File({ filename: `${logfileError}`, level: "error" }),
    new transports.File({ filename: logfileCombined }),
  ],
  exitOnError: false,
});

module.exports = logger;
