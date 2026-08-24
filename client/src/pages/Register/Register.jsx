import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const navigate =
    useNavigate();

  const {
    register,
    loading: authLoading,
  } = useAuth();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    formData,
    setFormData,
  ] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeId: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  /**
   * ============================================================
   * Handle Input Changes
   * ============================================================
   */

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      }),
    );

    setError("");
  };

  /**
   * ============================================================
   * Common Field Validation
   * ============================================================
   */

  const validateCommonFields =
    () => {
      if (
        !formData.fullName.trim()
      ) {
        return "Full name is required.";
      }

      if (
        !formData.email.trim()
      ) {
        return "Email address is required.";
      }

      if (
        !formData.phone.trim()
      ) {
        return "Phone number is required.";
      }

      if (
        !formData.collegeId.trim()
      ) {
        return "College ID is required.";
      }

      if (!formData.terms) {
        return "Please accept the terms and conditions.";
      }

      return null;
    };

  /**
   * ============================================================
   * Password Validation
   * ============================================================
   */

  const validatePassword =
    () => {
      if (
        formData.password.length <
        8
      ) {
        return "Password must contain at least 8 characters.";
      }

      if (
        !/[a-z]/.test(
          formData.password,
        ) ||
        !/[A-Z]/.test(
          formData.password,
        ) ||
        !/\d/.test(
          formData.password,
        ) ||
        !/[^A-Za-z\d]/.test(
          formData.password,
        )
      ) {
        return "Password must contain uppercase, lowercase, number and special character.";
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        return "Passwords do not match.";
      }

      return null;
    };

  /**
   * ============================================================
   * Registration
   * ============================================================
   */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const commonError =
        validateCommonFields();

      if (commonError) {
        setError(
          commonError,
        );

        return;
      }

      const passwordError =
        validatePassword();

      if (passwordError) {
        setError(
          passwordError,
        );

        return;
      }

      try {
        setSubmitting(true);

        await register({
          fullName:
            formData.fullName.trim(),

          email:
            formData.email
              .trim()
              .toLowerCase(),

          phone:
            formData.phone.trim(),

          collegeId:
            formData.collegeId.trim(),

          password:
            formData.password,
        });

        toast.success(
          "Account created successfully.",
        );

        navigate(
          "/dashboard",
          {
            replace: true,
          },
        );
      } catch (registrationError) {
        console.error(
          "Registration error:",
          registrationError,
        );

        const message =
          registrationError
            ?.response
            ?.data
            ?.message ||
          "Unable to create your account.";

        setError(message);

        toast.error(
          message,
        );
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
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-white">

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

      <div className="relative z-10 mx-auto w-full max-w-2xl">

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

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Create Your Account
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Join Scintillace and
              register for exciting
              technical, learning,
              and cultural
              experiences.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-6 py-8 sm:px-10"
          >

            {/* Full Name */}

            <div>

              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={
                    formData.fullName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>

            </div>

            {/* Email + Phone */}

            <div className="grid gap-6 sm:grid-cols-2">

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
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />

                </div>

              </div>

              {/* Phone */}

              <div>

                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Phone Number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter phone number"
                    required
                    autoComplete="tel"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />

                </div>

              </div>

            </div>

            {/* College */}

            <div>

              <label
                htmlFor="collegeId"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                College ID
              </label>

              <div className="relative">

                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="collegeId"
                  name="collegeId"
                  type="text"
                  value={
                    formData.collegeId
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter your college ID"
                  required
                  autoComplete="organization"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>

              <p className="mt-2 text-xs text-slate-600">
                Use the college identifier
                provided by your institution.
              </p>

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

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
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
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

              <p className="mt-2 text-xs text-slate-600">
                At least 8 characters with
                uppercase, lowercase, number
                and special character.
              </p>

            </div>

            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    formData.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) =>
                        !value,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-300"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Terms */}

            <label className="flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                name="terms"
                checked={
                  formData.terms
                }
                onChange={
                  handleChange
                }
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400"
              />

              <span className="text-sm leading-6 text-slate-400">
                I agree to the{" "}
                <button
                  type="button"
                  className="font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Terms & Conditions
                </button>{" "}
                and event participation
                policies.
              </span>

            </label>

            {/* Submit */}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* Login */}

          <div className="border-t border-white/10 px-6 py-6 text-center sm:px-10">

            <p className="text-sm text-slate-500">
              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Login
              </Link>
            </p>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">

          <CheckCircle2 size={14} />

          <span>
            Your information is used only
            for festival participation and
            registration.
          </span>

        </div>

      </div>

    </main>
  );
}