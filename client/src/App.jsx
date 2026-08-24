import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "./routes";

import ScrollToTop from "./components/common/ScrollToTop";
import BackToTop from "./components/common/BackToTop";

import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Automatically reset scroll position on navigation */}
        <ScrollToTop />

        {/* Application Routes */}
        <AppRoutes />

        {/* Floating back-to-top button */}
        <BackToTop />
      </BrowserRouter>
    </AuthProvider>
  );
}