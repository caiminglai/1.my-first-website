/**
 * 参数校验工具
 * 统一处理输入验证，确保数据类型安全
 */

/**
 * 解析并验证分页参数
 * @param {any} page 页码
 * @param {any} pageSize 每页数量
 * @returns {{page: number, pageSize: number}}
 */
function parsePagination(page, pageSize) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
  return { page: parsedPage, pageSize: parsedSize };
}

/**
 * 验证字符串参数
 * @param {any} value 值
 * @param {string} name 参数名
 * @param {object} options 选项
 * @returns {string}
 */
function validateString(value, name, options = {}) {
  const { required = false, maxLength = 1000, minLength = 0 } = options;
  
  if (value === undefined || value === null) {
    if (required) {
      throw new Error(`MISSING_PARAM:${name}`);
    }
    return "";
  }
  
  const str = String(value);
  
  if (str.length < minLength) {
    throw new Error(`INVALID_PARAM:${name} (最小${minLength}字符)`);
  }
  
  if (str.length > maxLength) {
    throw new Error(`INVALID_PARAM:${name} (最大${maxLength}字符)`);
  }
  
  return str;
}

/**
 * 验证ID参数
 * @param {any} id ID值
 * @param {string} name 参数名
 * @returns {number}
 */
function validateId(id, name = "id") {
  if (id === undefined || id === null) {
    throw new Error(`MISSING_PARAM:${name}`);
  }
  
  const parsed = parseInt(id, 10);
  
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`INVALID_PARAM:${name} (必须是正整数)`);
  }
  
  return parsed;
}

/**
 * 验证词条ID参数（字符串格式，如 m001, bio001, c001）
 * @param {any} id ID值
 * @param {string} name 参数名
 * @returns {string}
 */
function validateTermId(id, name = "id") {
  if (id === undefined || id === null) {
    throw new Error(`MISSING_PARAM:${name}`);
  }
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error(`INVALID_PARAM:${name} (必须是有效的词条ID)`);
  }
  return id.trim();
}

/**
 * 验证数组参数
 * @param {any} arr 数组
 * @param {string} name 参数名
 * @param {object} options 选项
 * @returns {array}
 */
function validateArray(arr, name, options = {}) {
  const { required = false, itemType = "any" } = options;
  
  if (arr === undefined || arr === null) {
    if (required) {
      throw new Error(`MISSING_PARAM:${name}`);
    }
    return [];
  }
  
  if (!Array.isArray(arr)) {
    throw new Error(`INVALID_PARAM:${name} (必须是数组)`);
  }
  
  return arr;
}

/**
 * 验证枚举值
 * @param {any} value 值
 * @param {string} name 参数名
 * @param {array} allowed 允许的值
 * @returns {any}
 */
function validateEnum(value, name, allowed) {
  if (value === undefined || value === null) {
    return allowed[0]; // 返回默认值
  }
  
  if (!allowed.includes(value)) {
    throw new Error(`INVALID_PARAM:${name} (必须是: ${allowed.join("|")})`);
  }
  
  return value;
}

/**
 * 验证JSON对象
 * @param {any} obj 对象
 * @param {string} name 参数名
 * @param {object} schema schema定义
 * @returns {object}
 */
function validateObject(obj, name, schema) {
  if (obj === undefined || obj === null) {
    throw new Error(`MISSING_PARAM:${name}`);
  }
  
  if (typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error(`INVALID_PARAM:${name} (必须是对象)`);
  }
  
  const result = {};
  const errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];
    
    try {
      switch (rules.type) {
        case "string":
          result[key] = validateString(value, `${name}.${key}`, rules);
          break;
        case "number":
          if (value !== undefined && value !== null) {
            const num = parseFloat(value);
            if (isNaN(num)) throw new Error("must be number");
            result[key] = num;
          }
          break;
        case "boolean":
          result[key] = Boolean(value);
          break;
        case "array":
          result[key] = validateArray(value, `${name}.${key}`, rules);
          break;
        case "enum":
          result[key] = validateEnum(value, `${name}.${key}`, rules.values);
          break;
        default:
          result[key] = value;
      }
    } catch (err) {
      errors.push(err.message);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`VALIDATION_ERROR:${errors.join("; ")}`);
  }
  
  return result;
}

module.exports = {
  parsePagination,
  validateString,
  validateId,
  validateTermId,
  validateArray,
  validateEnum,
  validateObject,
};
