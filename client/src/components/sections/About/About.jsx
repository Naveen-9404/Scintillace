import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Cpu,
  Music,
  Target,
  Eye,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

import AboutCard from "./AboutCard";

const cards = [
  {
    icon: Trophy,
    title: "Technical Events",
    description:
      "Explore technical events that encourage students to present their ideas, demonstrate their skills, and engage with engineering and technology.",
  },
  {
    icon: Cpu,
    title: "Hands-on Workshops",
    description:
      "Participate in engaging workshops designed to provide practical learning, new skills, and meaningful technical experience.",
  },
  {
    icon: Music,
    title: "Cultural Celebrations",
    description:
      "Experience music, dance, performances, Ethnic Day, and other cultural activities that bring creativity and celebration to the festival.",
  },
  {
    icon: Users,
    title: "Learning & Collaboration",
    description:
      "Connect with fellow students, coordinators, faculty members, and participants while learning, collaborating, and sharing ideas.",
  },
];

const departments = [
  {
    icon: Cpu,
    title: "Electronics & Communication Engineering",
    description:
      "The organizing department bringing together technology, innovation, technical activities, and student creativity.",
  },
  {
    icon: GraduationCap,
    title: "JNTUA College of Engineering Pulivendula (Autonomous)",
    description:
      "A platform that encourages students to learn, innovate, collaborate, and showcase their talents.",
  },
];

const objectives = [
  "Encourage students to showcase technical knowledge, creativity, and innovative ideas.",
  "Provide opportunities for practical learning through workshops and technical activities.",
  "Promote collaboration, communication, leadership, and teamwork among students.",
  "Create an environment where technology and cultural expression come together.",
];

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-slate-950 py-28 text-white"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/5 blur-[160px]" />

        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/5 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">

        {/* =====================================================
            Section Heading
            ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
          }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            About Scintillace
          </span>

          <h2 className="mt-8 text-4xl font-black leading-tight md:text-5xl">
            Empowering Innovation Through

            <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              Technology & Culture
            </span>
          </h2>

          {/* Organizer */}

          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
              Organized by
            </p>

            <p className="mt-2 text-lg font-semibold text-white md:text-xl">
              Department of Electronics & Communication Engineering
            </p>

            <p className="mt-1 text-slate-400">
              JNTUA College of Engineering Pulivendula (Autonomous)
            </p>
          </div>

          {/* Description */}

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-400">
            <span className="font-semibold text-cyan-300">
              Scintillace
            </span>{" "}
            is a three-day technology and cultural festival organized by the
            Department of Electronics & Communication Engineering at JNTUA
            College of Engineering, Pulivendula. The festival brings together
            learning, technical activities, creativity, cultural celebrations,
            and opportunities for students to showcase their skills and ideas.
          </p>
        </motion.div>

        {/* =====================================================
            Festival Highlights
            ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mt-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              What Scintillace Offers
            </span>

            <h3 className="mt-4 text-3xl font-black md:text-4xl">
              Learn. Create. Collaborate.
            </h3>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <AboutCard
                key={card.title}
                {...card}
              />
            ))}
          </div>
        </motion.div>

        {/* =====================================================
            Departments
            ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mt-28"
        >
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Departments
            </span>

            <h3 className="mt-4 text-3xl font-black md:text-4xl">
              Driven by Academic Excellence
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-slate-400">
              Scintillace is organized with the support of the academic
              community to provide students with opportunities to learn,
              innovate, and showcase their abilities.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {departments.map((department) => {
              const Icon = department.icon;

              return (
                <motion.div
                  key={department.title}
                  whileHover={{
                    y: -6,
                  }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(34,211,238,.12)]"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <Icon
                        size={27}
                        className="text-cyan-400"
                      />
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-white">
                        {department.title}
                      </h4>

                      <p className="mt-3 leading-7 text-slate-400">
                        {department.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =====================================================
            Vision & Objectives
            ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mt-28"
        >
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Vision & Objectives
            </span>

            <h3 className="mt-4 text-3xl font-black md:text-4xl">
              Building Skills Beyond the Classroom
            </h3>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">

            {/* Vision */}

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
                <Eye
                  size={28}
                  className="text-cyan-400"
                />
              </div>

              <h4 className="mt-6 text-2xl font-bold">
                Our Vision
              </h4>

              <p className="mt-4 leading-8 text-slate-400">
                To create an engaging platform where students can explore
                technology, express creativity, develop practical skills,
                collaborate with others, and gain experiences that prepare
                them for future academic and professional opportunities.
              </p>
            </div>

            {/* Objectives */}

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10">
                <Target
                  size={28}
                  className="text-violet-400"
                />
              </div>

              <h4 className="mt-6 text-2xl font-bold">
                Our Objectives
              </h4>

              <div className="mt-5 space-y-4">
                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />

                    <p className="leading-7 text-slate-400">
                      {objective}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* =====================================================
            Closing Highlight
            ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mt-20 rounded-3xl border border-cyan-400/10 bg-gradient-to-r from-cyan-400/5 via-white/5 to-violet-400/5 p-8 text-center backdrop-blur-xl"
        >
          <Lightbulb
            size={30}
            className="mx-auto text-cyan-400"
          />

          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Scintillace brings together technology, creativity, learning,
            collaboration, and culture to create an experience where every
            participant has an opportunity to discover, contribute, and grow.
          </p>
        </motion.div>

      </div>
    </section>
  );
}