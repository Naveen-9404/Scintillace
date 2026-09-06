import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const COORDINATORS = [
  {
    name: "C. Charan Reddy",
    phone: "+91 89197 66749",
  },
  {
    name: "K. Vijaya Soujanya",
    phone: "+91 89783 69260",
  },
  {
    name: "G. Subramanyam",
    phone: "+91 63005 17202",
  },
  {
    name: "M. Yakshitha Reddy",
    phone: "+91 94924 65189",
  },
  {
    name: "S. Roshan Zameer",
    phone: "+91 95730 93493",
  }
];

const FACULTY_COORDINATOR = {
  name: "Prof. Shaik Taj Mahaboob",
  designation:
    "Professor, Dept. Of ECE & Faculty Advisor Of E-CHIP",
  department:
    "Dept. Of ECE, JNTUA College of Engineering Pulivendula (Autonomous)",
};

const COLLEGE_ADDRESS =
  "JNTUA College of Engineering Pulivendula (Autonomous), 516 390, Y.S.R. District, Andhra Pradesh";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/JNTUA+College+of+Engineering,+Pulivendula/@14.447279,78.2360077,17z/data=!4m6!3m5!1s0x3bb3eb8f7c5d4623:0xedbb309928332524!8m2!3d14.4472734!4d78.2360056!16s%2Fm%2F065_gv_?hl=en&entry=ttu&g_ep=EgoyMDI2MDgxNy4wIKXMDSoASAFQAw%3D%3D";

const INSTAGRAM_URL =
  "https://www.instagram.com/scintillace";

const FACEBOOK_URL =
  "https://www.facebook.com/share/195Grv4qed/";

export default function Contact() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.10),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-400">
            SCINTILLACE 2K26
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Get in Touch
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            Have questions about Scintillace 2K26?
            Get in touch with our organizing team for
            information and assistance.
          </p>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-12 lg:py-20">
        {/* ===================================================
            GENERAL CONTACT + VENUE
        ==================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Email */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
              <Mail size={24} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              General Enquiries
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Contact Scintillace
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              For general enquiries regarding
              Scintillace 2K26, contact us through
              our official email address.
            </p>

            <a
              href="mailto:scintillace2k26@gmail.com"
              className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500/50 hover:bg-violet-500/10"
            >
              <Mail
                size={17}
                className="text-violet-400"
              />

              scintillace2k26@gmail.com
            </a>
          </div>

          {/* Venue */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 md:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-400">
              <MapPin size={24} />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-400">
              Venue
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              JNTUA College of Engineering
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-400">
              (Autonomous), Pulivendula
            </p>

            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
              {COLLEGE_ADDRESS}
            </p>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-fuchsia-500/50 hover:text-white"
            >
              <MapPin size={17} />
              Open in Google Maps
            </a>
          </div>
        </div>

        {/* ===================================================
            FACULTY COORDINATOR
        ==================================================== */}

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Faculty Coordinator
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Faculty Coordination
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 md:p-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Phone size={22} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {FACULTY_COORDINATOR.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {FACULTY_COORDINATOR.designation}
                  <br />
                  {FACULTY_COORDINATOR.department}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            STUDENT COORDINATORS
        ==================================================== */}

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Student Coordinators
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
              Contact Our Coordinators
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reach out to our student coordinators
              for assistance regarding Scintillace 2K26.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COORDINATORS.map((coordinator) => (
              <div
                key={coordinator.phone}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Phone size={19} />
                </div>

                <h3 className="mt-5 font-semibold text-white">
                  {coordinator.name}
                </h3>

                <a
                  href={`tel:${coordinator.phone.replace(
                    /\s/g,
                    "",
                  )}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-400"
                >
                  <Phone size={15} />
                  {coordinator.phone}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            SOCIAL MEDIA
        ==================================================== */}

        <section className="mt-14">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 md:p-9">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                  Follow Scintillace
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Stay Connected
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Follow our official social media
                  profiles for announcements, updates,
                  and event information.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-white"
                >
                  <Instagram size={18} />
                  Instagram
                </a>

                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-white"
                >
                  <Facebook size={18} />
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            EVENT INFORMATION
        ==================================================== */}

        <section className="mt-8">
          <div className="rounded-3xl border border-violet-500/20 bg-violet-500/[0.05] p-7 text-center md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
              SCINTILLACE 2K26
            </p>

            <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
              September 29 &amp; 30, 2026
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              JNTUA College of Engineering Pulivendula (Autonomous)
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}