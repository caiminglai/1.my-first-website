/**
 * 统一 API 响应格式
 * 确保所有接口返回格式一致
 */

/**
 * 成功响应
 * @param {Response} res Express Response 对象
 * @param {any} data 响应数据
 * @param {number} status HTTP 状态码，默认 200
 */
function success(res, data, status = 200) {
  res.status(status).json({
    success: true,
    data,
  });
}

/**
 * 错误响应
 * @param {Response} res Express Response 对象
 * @param {string} code 错误码
 * @param {string} message 错误消息
 * @param {number} status HTTP 状态码
 */
function error(res, code, message, status = 400) {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

/**
 * 分页响应
 * @param {Response} res Express Response 对象
 * @param {Array} items 数据项数组
 * @param {number} total 总数
 * @param {number} page 当前页
 * @param {number} pageSize 每页数量
 */
function paginated(res, items, total, page, pageSize) {
  res.json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}

/**
 * 转换服务层错误为 HTTP 响应
 * @param {Response} res Express Response 对象
 * @param {Error} err 错误对象
 */
function handleServiceError(res, err) {
  const message = err.message || "Unknown error";
  
  // 错误码映射
  const errorMap = {
    MISSING_FIELDS: { code: "MISSING_FIELDS", status: 400 },
    MISSING_PARAM: { code: "MISSING_PARAM", status: 400 },
    INVALID_PARAM: { code: "INVALID_PARAM", status: 400 },
    INVALID_DATA: { code: "INVALID_DATA", status: 400 },
    NOT_FOUND: { code: "NOT_FOUND", status: 404 },
    UNAUTHORIZED: { code: "UNAUTHORIZED", status: 401 },
    FORBIDDEN: { code: "FORBIDDEN", status: 403 },
    RATE_LIMITED: { code: "RATE_LIMITED", status: 429 },
    INTERNAL_ERROR: { code: "INTERNAL_ERROR", status: 500 },
  };
  
  // 解析错误码
  let code = "BAD_REQUEST";
  let status = 400;
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      code = value.code;
      status = value.status;
      break;
    }
  }
  
  console.error(`[API Error] ${code}: ${message}`);
  
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = {
  success,
  error,
  paginated,
  handleServiceError,
};
