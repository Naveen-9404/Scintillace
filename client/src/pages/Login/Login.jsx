import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import ROLES from "../../constants/roles";

export default function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    login,
    loading: authLoading,
  } = useAuth();

  const [
    form,
    setForm,
  ] = useState({
    email: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /**
   * ============================================================
   * Input Change
   * ============================================================
   */

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );

    setError("");
  };

  /**
   * ============================================================
   * Destination
   * ============================================================
   *
   * Role-based destination:
   *
   * SUPER_ADMIN → /admin
   * FACULTY     → /admin
   * STUDENT     → /dashboard
   * VOLUNTEER   → /dashboard
   *
   * If an authenticated user was originally trying to access
   * another protected route, that route is preserved unless
   * the user is an administrative role.
   * ============================================================
   */

  const getDestination = (
    authenticatedUser,
  ) => {
    const role =
      authenticatedUser?.role;

    if (
      role ===
        ROLES.SUPER_ADMIN ||
      role ===
        ROLES.FACULTY
    ) {
      return "/admin";
    }

    return (
      location.state?.from
        ?.pathname ||
      "/"
    );
  };

  /**
   * ============================================================
   * Login
   * ============================================================
   */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        !form.email.trim() ||
        !form.password
      ) {
        const message =
          "Email and password are required.";

        setError(message);

        toast.error(message);

        return;
      }

      try {
        setSubmitting(true);

        const authenticatedUser =
          await login({
            email:
              form.email
                .trim()
                .toLowerCase(),

            password:
              form.password,
          });

        toast.success(
          "Login successful.",
        );

        navigate(
          getDestination(
            authenticatedUser,
          ),
          {
            replace: true,
          },
        );
      } catch (loginError) {
        console.error(
          "Login error:",
          loginError,
        );

        const message =
          loginError
            ?.response
            ?.data
            ?.message ||
          "Unable to login. Please check your credentials.";

        setError(message);

        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    };

  /**
   * ============================================================
   * Authentication Loading
   * ============================================================
   */

  if (authLoading) {
    return null;
  }

  /**
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 pt-36 pb-12 md:pt-40 text-white">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute left-[-10%] top-[10%] h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-violet-500/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(
                to right,
                rgba(255,255,255,.1) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(255,255,255,.1) 1px,
                transparent 1px
              )
            `,
            backgroundSize:
              "60px 60px",
          }}
        />

      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl">

        {/* Back */}

        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={17} />
          Back to Scintillace
        </Link>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-2xl">

          {/* Header */}

          <div className="border-b border-white/10 px-6 py-8 text-center sm:px-10">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 shadow-lg shadow-cyan-500/30">
              <Sparkles
                size={27}
                className="text-white"
              />
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight">
              Welcome Back
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Sign in to manage your
              Scintillace registrations,
              tickets, certificates and
              festival activities.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-6 py-8 sm:px-10"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    toast(
                      "Password recovery will be connected in the password-recovery module.",
                    )
                  }
                  className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) =>
                        !value,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-300"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={
                submitting
              }
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>



        </div>

        {/* Footer */}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">

          <ShieldCheck size={14} />

          <span>
            Secure access to your
            Scintillace account
          </span>

        </div>

      </div>

    </main>
  );
}