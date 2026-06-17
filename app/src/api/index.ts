/**
 * API 模块统一导出
 * 用法：import { aiChat, searchTerms, getTerms } from '@/api';
 */

// 配置
export { API_BASE_URL, API_ENDPOINTS } from './config'

// 类型
export type * from './types'

// 客户端
export { apiClient, APIErrorException } from './client'

// 服务函数
export {
  aiChat,
  aiChatStream,
  getAIProviders,
  generateTermWithAI,
  getTerms,
  getTermById,
  searchTerms,
  getGraphNodes,
  getGraphLinks,
  getGraphData,
  getComparisons,
  getScenarios,
  createSubmission,
  submitFeedback,
  checkBackend,
} from './services'
