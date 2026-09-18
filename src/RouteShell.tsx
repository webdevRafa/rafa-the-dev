import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const AdminPage = lazy(() => import("./admin/AdminPage.tsx"));
const StudioExperience = lazy(() => import("./studio/StudioExperience.tsx"));

function StudioFallback() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#07090b",
        color: "#f3f0e8",
      }}
    >
      Loading studio…
    </div>
  );
}

function RouteShell() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<StudioFallback />}>
            <StudioExperience />
          </Suspense>
        }
      />

      <Route path="/studio" element={<Navigate to="/" replace />} />

      <Route
        path="/admin"
        element={
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: "100dvh",
                  display: "grid",
                  placeItems: "center",
                  background: "#050505",
                  color: "#ffffff",
                }}
              >
                Loading admin workspace...
              </div>
            }
          >
            <AdminPage />
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RouteShell;
