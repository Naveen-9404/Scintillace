import {
  Routes,
  Route,
} from "react-router-dom";

import {
  PublicLayout,
} from "../layouts/PublicLayout";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";

import Accommodation from "../pages/Accommodation/Accommodation";

import Events from "../pages/Events";
import EventDetails from "../pages/EventDetails";
import EventRegistration from "../pages/EventRegistration/EventRegistration";

import Presentations from "../pages/Presentations/Presentations";
import PresentationDetails from "../pages/PresentationDetails/PresentationDetails";

import HardwareExpo from "../pages/HardwareExpo/HardwareExpo";
import Workshop from "../pages/Workshop/Workshop";

import Announcements from "../pages/Announcements";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Certificates from "../pages/Certificates";
import MyTickets from "../pages/Tickets/MyTickets";

import TicketScanner from "../pages/TicketScanner/TicketScanner";

/**
 * ============================================================
 * Admin
 * ============================================================
 */

import Admin from "../pages/admin";

/**
 * ============================================================
 * Route Guards
 * ============================================================
 */

import {
  ProtectedRoute,
} from "./ProtectedRoute";

import RoleProtectedRoute from "./RoleProtectedRoute";

import PublicRoute from "./PublicRoute";

/**
 * ============================================================
 * Roles
 * ============================================================
 */

import ROLES from "../constants/roles";

/**
 * ============================================================
 * Not Found
 * ============================================================
 */

import NotFound from "../pages/NotFound";

/**
 * ============================================================
 * Application Routes
 * ============================================================
 */

export function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}

      <Route
        element={
          <PublicLayout />
        }
      >

        {/* ===================================================
            Home
            =================================================== */}

        <Route
          path="/"
          element={
            <Home />
          }
        />

        {/* ===================================================
            About
            =================================================== */}

        <Route
          path="/about"
          element={
            <About />
          }
        />

        {/* ===================================================
            Contact
            =================================================== */}

        <Route
          path="/contact"
          element={
            <Contact />
          }
        />

        {/* ===================================================
            Accommodation
            =================================================== */}

        <Route
          path="/accommodation"
          element={
            <Accommodation />
          }
        />

        {/* ===================================================
            Announcements
            =================================================== */}

        <Route
          path="/announcements"
          element={
            <Announcements />
          }
        />

        {/* ===================================================
            Events
            =================================================== */}

        <Route
          path="/events"
          element={
            <Events />
          }
        />

        {/* ===================================================
            Presentations
            =================================================== */}

        <Route
          path="/events/presentations"
          element={
            <Presentations />
          }
        />

        <Route
          path="/events/presentations/:presentationId"
          element={
            <PresentationDetails />
          }
        />

        {/* ===================================================
            Hardware Expo
            =================================================== */}

        <Route
          path="/events/hardware-expo"
          element={
            <HardwareExpo />
          }
        />

        {/* ===================================================
            Workshops
            =================================================== */}

        <Route
          path="/events/workshop"
          element={
            <Workshop />
          }
        />

        {/* ===================================================
            Dynamic Event Details
            =================================================== */}

        <Route
          path="/events/:id"
          element={
            <EventDetails />
          }
        />

        {/* ===================================================
            Authentication
            =================================================== */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

      </Route>

      {/* =====================================================
          PROTECTED USER ROUTES
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        {/* ===================================================
            Event Registration
            =================================================== */}

        <Route
          path="/events/:eventId/register"
          element={
            <EventRegistration />
          }
        />

        {/* ===================================================
            Dashboard
            =================================================== */}

        <Route
          path="/dashboard/*"
          element={
            <Dashboard />
          }
        />

        {/* ===================================================
            Profile
            =================================================== */}

        <Route
          path="/profile"
          element={
            <Profile />
          }
        />

        {/* ===================================================
            My Tickets
            =================================================== */}

        <Route
          path="/tickets"
          element={
            <MyTickets />
          }
        />

        {/* ===================================================
            Certificates
            =================================================== */}

        <Route
          path="/certificates"
          element={
            <Certificates />
          }
        />

      </Route>

      {/* =====================================================
          ADMIN ROUTES
          =====================================================

          Accessible only by:

          SUPER_ADMIN
          FACULTY

          Volunteers and students cannot access
          the administration panel.
          ===================================================== */}

      <Route
        element={
          <RoleProtectedRoute
            roles={[
              ROLES.SUPER_ADMIN,
              ROLES.FACULTY,
            ]}
          />
        }
      >

        <Route
          path="/admin"
          element={
            <Admin />
          }
        />

      </Route>

      {/* =====================================================
          TICKET SCANNER ROUTES
          =====================================================

          Accessible by:

          SUPER_ADMIN
          FACULTY
          VOLUNTEER

          The scanner is intentionally separate from
          the administration panel so volunteers can
          perform event check-ins without receiving
          administrative access.
          ===================================================== */}

      <Route
        element={
          <RoleProtectedRoute
            roles={[
              ROLES.SUPER_ADMIN,
              ROLES.FACULTY,
              ROLES.VOLUNTEER,
            ]}
          />
        }
      >

        <Route
          path="/ticket-scanner"
          element={
            <TicketScanner />
          }
        />

      </Route>

      {/* =====================================================
          404
          ===================================================== */}

      <Route
        path="*"
        element={
          <NotFound />
        }
      />

    </Routes>
  );
}

export default AppRoutes;