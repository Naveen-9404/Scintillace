import {
  useEffect,
  useState,
} from "react";

import {
  Menu,
  Sparkles,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Container } from "../ui";
import MobileMenu from "./MobileMenu";

import useActiveSection from "../../hooks/useActiveSection";
import { useAuth } from "../../hooks/useAuth";

import ROLES from "../../constants/roles";

const navItems = [
  {
    name: "Home",
    id: "hero",
  },
  {
    name: "About",
    id: "about",
  },
  {
    name: "Events",
    id: "events",
  },
  {
    name: "Schedule",
    id: "timeline",
  },
  {
    name: "Gallery",
    id: "gallery",
  },
  {
    name: "FAQ",
    id: "faq",
  },
];

export default function Navbar() {
  const [
    isScrolled,
    setIsScrolled,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const activeSection =
    useActiveSection();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const isHomePage =
    location.pathname === "/";

  const isAccommodationPage =
    location.pathname ===
    "/accommodation";

  const isContactPage =
    location.pathname ===
    "/contact";

  const isAnnouncementsPage =
    location.pathname ===
    "/announcements";

  const isDashboardPage =
    location.pathname.startsWith(
      "/dashboard",
    );

  const isAdminPage =
    location.pathname.startsWith(
      "/admin",
    );

  const isAdmin =
    user?.role ===
      ROLES.SUPER_ADMIN ||
    user?.role ===
      ROLES.FACULTY;

  useEffect(() => {
    const handleScroll =
      () => {
        setIsScrolled(
          window.scrollY > 20,
        );
      };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /**
   * ==========================================================
   * Home Section Navigation
   * ==========================================================
   */

  const handleSectionNavigation =
    (
      event,
      id,
    ) => {
      event.preventDefault();

      if (isHomePage) {
        document
          .getElementById(id)
          ?.scrollIntoView({
            behavior:
              "smooth",
            block: "start",
          });

        return;
      }

      navigate(`/#${id}`);
    };

  /**
   * ==========================================================
   * Logout
   * ==========================================================
   */

  const handleLogout =
    async () => {
      try {
        await logout();
      } catch (error) {
        console.error(
          "Logout failed:",
          error,
        );
      } finally {
        setMobileOpen(false);
      }
    };

  return (
    <>
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-b border-white/10 bg-slate-950/80 shadow-2xl shadow-black/30 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <Container className="flex h-24 items-center justify-between">

          {/* =================================================
              LOGO
              ================================================= */}

          <Link
            to="/"
            className="group flex items-center gap-3 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/40 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-wide text-white">
                SCINTILLACE
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-400">
                Technology & Culture
              </p>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
              ================================================= */}

          <nav className="hidden items-center gap-8 md:flex">

            {navItems.map(
              (item) => (
                <a
                  key={item.id}
                  href={`/#${item.id}`}
                  onClick={(
                    event,
                  ) =>
                    handleSectionNavigation(
                      event,
                      item.id,
                    )
                  }
                  className={`group relative text-sm font-semibold transition-all duration-300 ${
                    isHomePage &&
                    activeSection ===
                      item.id
                      ? "text-cyan-400"
                      : "text-slate-300 hover:text-cyan-300"
                  }`}
                >
                  {item.name}

                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                      isHomePage &&
                      activeSection ===
                        item.id
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </a>
              ),
            )}

            {/* =================================================
                ANNOUNCEMENTS
                ================================================= */}

            <Link
              to="/announcements"
              className={`group relative text-sm font-semibold transition-all duration-300 ${
                isAnnouncementsPage
                  ? "text-cyan-400"
                  : "text-slate-300 hover:text-cyan-300"
              }`}
            >
              Announcements

              <span
                className={`absolute -bottom-2 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                  isAnnouncementsPage
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            {/* =================================================
                ACCOMMODATION
                ================================================= */}

            <Link
              to="/accommodation"
              className={`group relative text-sm font-semibold transition-all duration-300 ${
                isAccommodationPage
                  ? "text-cyan-400"
                  : "text-slate-300 hover:text-cyan-300"
              }`}
            >
              Accommodation

              <span
                className={`absolute -bottom-2 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                  isAccommodationPage
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

            {/* =================================================
                CONTACT
                ================================================= */}

            <Link
              to="/contact"
              className={`group relative text-sm font-semibold transition-all duration-300 ${
                isContactPage
                  ? "text-cyan-400"
                  : "text-slate-300 hover:text-cyan-300"
              }`}
            >
              Contact

              <span
                className={`absolute -bottom-2 left-0 h-[2px] bg-cyan-400 transition-all duration-300 ${
                  isContactPage
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </Link>

          </nav>

          {/* =================================================
              DESKTOP AUTH ACTIONS
              ================================================= */}

          <div className="hidden items-center gap-3 md:flex">

            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-700 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-300"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-cyan-400/60"
                >
                  Register Now
                  <span className="ml-1">
                    →
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isDashboardPage
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                      : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-300"
                  }`}
                >
                  Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isAdminPage
                        ? "border-purple-400 bg-purple-400/10 text-purple-300"
                        : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-purple-400 hover:bg-slate-800 hover:text-purple-300"
                    }`}
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-cyan-400/50"
                >
                  Logout
                </button>
              </>
            )}

          </div>

          {/* =================================================
              MOBILE MENU BUTTON
              ================================================= */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                true,
              )
            }
            aria-label="Open Menu"
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-700 bg-slate-900/40 text-white transition-all duration-300 hover:border-cyan-400 hover:text-cyan-400 md:hidden"
          >
            <Menu size={22} />
          </button>

        </Container>
      </header>

      {/* =====================================================
          MOBILE MENU
          ===================================================== */}

      <MobileMenu
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(
            false,
          )
        }
        items={[
          ...navItems,

          {
            name: "Announcements",
            id: "/announcements",
            type: "route",
          },

          {
            name: "Accommodation",
            id: "/accommodation",
            type: "route",
          },

          {
            name: "Contact",
            id: "/contact",
            type: "route",
          },

          ...(isAuthenticated
            ? [
                {
                  name: "Dashboard",
                  id: "/dashboard",
                  type: "route",
                },

                ...(isAdmin
                  ? [
                      {
                        name: "Admin Panel",
                        id: "/admin",
                        type: "route",
                      },
                    ]
                  : []),
              ]
            : []),
        ]}
        isAuthenticated={
          isAuthenticated
        }
        onLogout={
          handleLogout
        }
      />
    </>
  );
}