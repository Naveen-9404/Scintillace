import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  Instagram,
  Linkedin,
  Github,
  ArrowRight,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Container } from "../common";
import naveenProfile from "../../assets/naveen-profile.jpg";

const quickLinks = [
  {
    label: "Home",
    href: "/#hero",
    type: "section",
  },
  {
    label: "About",
    href: "/#about",
    type: "section",
  },
  {
    label: "Events",
    href: "/#events",
    type: "section",
  },
  {
    label: "Schedule",
    href: "/#timeline",
    type: "section",
  },
  {
    label: "Gallery",
    href: "/#gallery",
    type: "section",
  },
  {
    label: "FAQ",
    href: "/#faq",
    type: "section",
  },
  {
    label: "Contact",
    href: "/contact",
    type: "route",
  },
];

const eventLinks = [
  {
    label: "Presentations",
    href: "/events/presentations",
  },
  {
    label: "Hardware Expo",
    href: "/events/hardware-expo",
  },
  {
    label: "Workshops",
    href: "/events/workshop",
  },
];

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "#",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "#",
  },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSectionClick = (
    event,
    href,
  ) => {
    if (!href.includes("#")) {
      return;
    }

    event.preventDefault();

    const hash =
      href.split("#")[1];

    if (location.pathname === "/") {
      document
        .getElementById(hash)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      return;
    }

    navigate(href);
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950">

      {/* =====================================================
          BACKGROUND GLOW
          ===================================================== */}

      <div className="absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[150px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -40, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[150px]"
        />

      </div>

      <Container>

        {/* =================================================
            MAIN FOOTER
            ================================================= */}

        <div className="grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-4">

          {/* =================================================
              BRAND
              ================================================= */}

          <div>

            <Link
              to="/"
              className="inline-block"
            >
              <h2 className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-3xl font-black text-transparent">
                SCINTILLACE
              </h2>
            </Link>

            <p className="mt-5 leading-7 text-slate-400">
              A technology and cultural festival bringing
              together innovation, learning, creativity,
              collaboration, and student talent.
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              JNTUA College of Engineering,
              Pulivendula
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Technology â€¢ Innovation â€¢ Culture
            </div>

          </div>

          {/* =================================================
              QUICK LINKS
              ================================================= */}

          <div>

            <h3 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <ul className="space-y-3">

              {quickLinks.map((link) => (
                <li key={link.label}>

                  {link.type === "route" ? (
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-cyan-300"
                    >
                      {link.label}

                      <ArrowRight
                        size={14}
                        className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(event) =>
                        handleSectionClick(
                          event,
                          link.href,
                        )
                      }
                      className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-cyan-300"
                    >
                      {link.label}

                      <ArrowRight
                        size={14}
                        className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </a>
                  )}

                </li>
              ))}

            </ul>

          </div>

          {/* =================================================
              PRIMARY EVENTS
              ================================================= */}

          <div>

            <h3 className="mb-5 text-lg font-semibold text-white">
              Events
            </h3>

            <ul className="space-y-3">

              {eventLinks.map((event) => (
                <li key={event.label}>

                  <Link
                    to={event.href}
                    className="group inline-flex items-center gap-2 text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-cyan-300"
                  >
                    {event.label}

                    <ArrowRight
                      size={14}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </Link>

                </li>
              ))}

            </ul>

            <Link
              to="/events"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Explore All Events

              <ArrowRight size={16} />
            </Link>

          </div>

          {/* =================================================
              CONTACT
              ================================================= */}

          <div>

            <h3 className="mb-5 text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="space-y-5">

              <div className="flex items-start gap-3">

                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-cyan-400"
                />

                <span className="text-sm leading-6 text-slate-400">
                  JNTUA College of Engineering,
                  Pulivendula
                </span>

              </div>

              <div className="flex items-start gap-3">

                <Mail
                  size={18}
                  className="mt-1 shrink-0 text-cyan-400"
                />

                <span className="text-sm text-slate-400">
                  scintillace@jntua.ac.in
                </span>

              </div>

              <div className="flex items-start gap-3">

                <Phone
                  size={18}
                  className="mt-1 shrink-0 text-cyan-400"
                />

                <span className="text-sm text-slate-400">
                  +91 63005 17202
                </span>

              </div>

            </div>

            {/* Social Links */}

            <div className="mt-8">

              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Follow Scintillace
              </p>

              <div className="flex gap-3">

                {socialLinks.map(
                  ({
                    icon: Icon,
                    label,
                    href,
                  }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                    >
                      <Icon size={18} />
                    </a>
                  ),
                )}

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            BOTTOM BAR
            ================================================= */}

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 py-8 md:flex-row">

          <div className="text-center md:text-left">

            <p className="text-sm text-slate-500">
              Â© 2026 Scintillace. All Rights Reserved.
            </p>

            <p className="mt-1 text-xs text-slate-600">
              JNTUA College of Engineering, Pulivendula
            </p>

          </div>

          {/* =================================================
              DEVELOPER CREDIT
              ================================================= */}

          <div className="flex items-center justify-center gap-4">

  <span className="text-base text-slate-400">
    Designed &amp; Developed by
  </span>

  <span className="text-xl font-bold text-cyan-400">
    Naveen Derangula
  </span>

  <span className="text-slate-600">
    |
  </span>

  <span className="text-base font-medium text-slate-400">
    23191A0435
  </span>

  <img
    src={naveenProfile}
    alt="Naveen Derangula"
    title="Naveen Derangula"
    className="h-14 w-14 rounded-full border-2 border-cyan-400/60 object-cover object-top shadow-[0_0_18px_rgba(34,211,238,0.2)] transition-all duration-300 hover:scale-110 hover:border-cyan-400"
  />

</div>

          {/* =================================================
              BACK TO TOP
              ================================================= */}

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="rounded-full border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-300 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-400/20 hover:shadow-[0_0_25px_rgba(34,211,238,.2)]"
          >
            <ChevronUp size={20} />
          </button>

        </div>

      </Container>

    </footer>
  );
}
