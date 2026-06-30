/**
 * API 客户端 - 统一的发送请求工具
 * 所有API调用都走这里，自动处理：超时、重试、错误、JSON解析
 */

import { API_BASE_URL, REQUEST_TIMEOUT, RETRY_CONFIG } from './config'
import type { APIResponse } from './types'

class APIErrorException extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'APIError'
  }
}

/**
 * 发送HTTP请求
 * @param method HTTP方法
 * @param path API路径（不含BASE_URL）
 * @param body 请求体（可选）
 * @param timeout 超时时间（毫秒）
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  timeout = REQUEST_TIMEOUT,
): Promise<T> {
  // 构建 URL，支持空的 BASE_URL（使用相对路径）
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path

  let lastError: Error | null = null

  // 自动重试
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    const controller = new AbortController()
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // HTTP错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIErrorException(
          errorData.message || `HTTP ${response.status}`,
          errorData.code || `HTTP_${response.status}`,
          response.status,
        )
      }

      // 204 No Content
      if (response.status === 204) {
        return undefined as T
      }

      const result: APIResponse<T> = await response.json()

      if (!result.success) {
        throw new APIErrorException(
          result.error?.message || '请求失败',
          result.error?.code || 'UNKNOWN',
          response.status,
        )
      }

      return result.data as T
    } catch (error) {
      lastError = error as Error

      // 被取消（可能是超时或外部取消）
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (timedOut) {
          throw new APIErrorException('请求超时', 'TIMEOUT', 408)
        }
        // 外部取消（非超时），不重试
        throw new APIErrorException('请求已取消', 'CANCELLED', 499)
      }

      // 不是网络错误，不重试
      if (!(error instanceof TypeError)) {
        throw error
      }

      // 最后一次尝试，直接抛错
      if (attempt === RETRY_CONFIG.maxRetries) {
        break
      }

      // 等待后重试
      await new Promise((r) => setTimeout(r, RETRY_CONFIG.retryDelay * (attempt + 1)))
    }
  }

  throw lastError || new APIErrorException('网络错误', 'NETWORK_ERROR', 0)
}

// 导出请求方法
export const apiClient = {
  get: <T>(path: string, timeout?: number) => request<T>('GET', path, undefined, timeout),
  post: <T>(path: string, body?: unknown, timeout?: number) =>
    request<T>('POST', path, body, timeout),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
}

export { APIErrorException }
