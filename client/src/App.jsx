import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "./routes";

import ScrollToTop from "./components/common/ScrollToTop";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Automatically reset scroll position on navigation */}
        <ScrollToTop />

        {/* Application Routes */}
        <AppRoutes />

      </BrowserRouter>
    </AuthProvider>
  );
}