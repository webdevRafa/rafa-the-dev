import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import FreeWebsitePage from './FreeWebsitePage.tsx'
import ScrollToRouteTarget from './ScrollToRouteTarget.tsx'
import SiteHeader from './SiteHeader.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToRouteTarget />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/free-website" element={<FreeWebsitePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
