import { Outlet } from "react-router-dom";

import { Footer, Navbar } from "../components/layout";
import ScrollProgress from "../components/common/ScrollProgress";
import BackToTop from "../components/common/BackToTop";
import MouseGlow from "../components/common/MouseGlow";

export function PublicLayout() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Mouse Glow Background */}
      <MouseGlow />

      {/* Scroll Progress */}
      <ScrollProgress />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Back To Top */}
      <BackToTop />
    </div>
  );
}