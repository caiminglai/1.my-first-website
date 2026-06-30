/**
 * 应用级错误类，带 code 和 HTTP status。
 * 路由层可通过 error.code 判断业务错误，无需字符串匹配 message。
 */
class AppError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

module.exports = { AppError };
