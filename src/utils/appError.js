class AppError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'success';
    this.isOperational = true;
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
