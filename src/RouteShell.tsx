import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import App from './App.tsx'
import FreeWebsitePage from './FreeWebsitePage.tsx'
import ScrollToRouteTarget from './ScrollToRouteTarget.tsx'
import SiteHeader from './SiteHeader.tsx'

const AdminPage = lazy(() => import('./admin/AdminPage.tsx'))

function RouteShell() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <>
      <ScrollToRouteTarget />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!isAdminRoute && <SiteHeader />}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/free-website" element={<FreeWebsitePage />} />
        <Route
          path="/admin"
          element={(
            <Suspense fallback={<div className="admin-route-loading">Loading admin workspace...</div>}>
              <AdminPage />
            </Suspense>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default RouteShell
