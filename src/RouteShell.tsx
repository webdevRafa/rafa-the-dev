import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import App from './App.tsx'
import ScrollToRouteTarget from './ScrollToRouteTarget.tsx'
import SiteHeader from './SiteHeader.tsx'
import CartDrawer from './CartDrawer.tsx'
import { LuxuryStoreProvider } from './LuxuryStoreContext.tsx'
import './LuxuryStore.css'

const AdminPage = lazy(() => import('./admin/AdminPage.tsx'))
const ForestExperience = lazy(() => import('./forest/ForestExperience.tsx'))

function RouteShell() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')
  const isImmersiveRoute = pathname.startsWith('/3d-experience')

  return (
    <LuxuryStoreProvider>
      <ScrollToRouteTarget />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!isAdminRoute && !isImmersiveRoute && <SiteHeader />}
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/3d-experience"
          element={(
            <Suspense fallback={<div style={{ minHeight: '100dvh', background: '#02040b' }} />}>
              <ForestExperience />
            </Suspense>
          )}
        />
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
      {!isAdminRoute && !isImmersiveRoute && <CartDrawer />}
    </LuxuryStoreProvider>
  )
}

export default RouteShell
