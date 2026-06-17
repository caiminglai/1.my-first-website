import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@chinese-fonts/lxgwwenkai/dist/LXGWWenKai-Regular/result.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/twym">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
