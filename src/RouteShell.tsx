import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App.tsx";

const AdminPage = lazy(() => import("./admin/AdminPage.tsx"));

function RouteShell() {
  return (
    <Routes>
      <Route path="/" element={<App />} />

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
