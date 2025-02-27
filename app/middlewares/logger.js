const pino = require('pino');

const logger = pino({
  level: 'info', // Mức độ log: 'fatal', 'error', 'warn', 'info', 'debug', 'trace'
  transport: {
    target: 'pino-pretty', // Hiển thị log đẹp trên console
    options: {
      colorize: true,       // Hiển thị màu sắc
      translateTime: true,  // Thêm timestamp dễ đọc
    },
  },
});

module.exports = logger;
