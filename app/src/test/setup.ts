import '@testing-library/jest-dom'

// jsdom 不提供 IntersectionObserver，Framer Motion 需要它
class IntersectionObserverMock {
  observe = () => null
  unobserve = () => null
  disconnect = () => null
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})
