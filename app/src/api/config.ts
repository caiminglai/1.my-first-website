/**
 * API 配置文件
 * 后端部署后，把 BASE_URL 改成你的真实后端地址
 * 开发环境用相对路径，通过代理转发
 * 生产环境自动检测 /twym/ 前缀（与云服务器部署路径一致）
 */

// 动态计算基础路径：检测当前URL是否在 /twym/ 子路径下
function _detectBasePath(): string {
  if (typeof window === 'undefined') return ''
  const pathname = window.location.pathname
  if (pathname.startsWith('/twym/') || pathname === '/twym') {
    return '/twym'
  }
  if (pathname.split('/').includes('twym')) {
    return '/twym'
  }
  return ''
}

// 开发环境：使用 .env 中的 VITE_API_BASE_URL
// 生产环境：自动检测部署路径前缀
const envBase = typeof import.meta !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
  : undefined

export const API_BASE_URL = envBase || _detectBasePath()

// API 端点定义
export const API_ENDPOINTS = {
  aiChat: '/api/v1/ai/chat',
  aiStream: '/api/v1/ai/stream',
  aiProviders: '/api/v1/ai/providers',
  aiGenerateTerm: '/api/v1/ai/generate-term',
  aiGenerateComparison: '/api/v1/ai/generate-comparison',
  terms: '/api/v1/terms',
  termById: (id: string) => `/api/v1/terms/${id}`,
  searchTerms: '/api/v1/terms/search',
  randomTerm: '/api/v1/terms/random',
  disciplines: '/api/v1/terms/disciplines',
  graphNodes: '/api/v1/graph/nodes',
  graphLinks: '/api/v1/graph/links',
  comparisons: '/api/v1/comparisons',
  comparisonById: (id: string) => `/api/v1/comparisons/${id}`,
  scenarios: '/api/v1/scenarios',
  submissions: '/api/v1/submissions',
  submissionsAdmin: '/api/v1/submissions/admin',
  approveSubmission: (id: number) => `/api/v1/submissions/admin/${id}/approve`,
  rejectSubmission: (id: number) => `/api/v1/submissions/admin/${id}/reject`,
  feedback: '/api/v1/stats/feedback',
  health: '/api/v1/stats/health',
  jobs: '/api/v1/jobs',
  jobById: (id: number) => `/api/v1/jobs/${id}`,
  jobCategories: '/api/v1/jobs/categories',
} as const

// 超时配置
export const REQUEST_TIMEOUT = 30000
export const STREAM_TIMEOUT = 120000

// 重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
}
