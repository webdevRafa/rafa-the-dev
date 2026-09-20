import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";

const AdminPage = lazy(() => import("./admin/AdminPage.tsx"));

function RouteShell() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

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
