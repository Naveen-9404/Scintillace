import { motion } from "framer-motion";
import {
  BedDouble,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

/**
 * ============================================================
 * Accommodation Hostel Types
 * ============================================================
 *
 * Participants select only their preferred hostel.
 *
 * Actual room/bed allotment is handled offline by the
 * Scintillace accommodation team.
 */

const hostels = [
  {
    id: "BOYS",

    title: "Boys Hostel",

    description:
      "Accommodation facility for male participants during Scintillace 2K26.",

    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80",

    features: [
      "Secure hostel accommodation",
      "24×7 security",
      "Basic hostel facilities",
      "Power backup",
    ],
  },

  {
    id: "GIRLS",

    title: "Girls Hostel",

    description:
      "Accommodation facility for female participants during Scintillace 2K26.",

    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",

    features: [
      "Secure hostel accommodation",
      "24×7 security",
      "Basic hostel facilities",
      "Power backup",
    ],
  },
];

/**
 * ============================================================
 * Hostel Selection Cards
 * ============================================================
 */

const RoomTypeCards = ({
  selectedRoom,
  onSelect,
}) => {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* ====================================================
            Section Heading
            ==================================================== */}

        <div className="mb-16 text-center">

          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Hostel Preference
          </span>

          <h2 className="mt-3 text-4xl font-bold text-gray-900">
            Choose Your Hostel
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Select your preferred hostel while registering
            for accommodation at Scintillace 2K26.
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
            Room and bed allotment will be handled separately
            by the Scintillace accommodation team.
          </p>

        </div>

        {/* ====================================================
            Hostel Cards
            ==================================================== */}

        <div className="grid gap-10 md:grid-cols-2">

          {hostels.map((hostel) => {
            const selected =
              selectedRoom === hostel.id;

            return (
              <motion.div
                key={hostel.id}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.3,
                }}
                className={`
                  overflow-hidden
                  rounded-3xl
                  bg-white
                  shadow-lg
                  transition-all
                  duration-300
                  ${
                    selected
                      ? "ring-4 ring-blue-500"
                      : "hover:shadow-2xl"
                  }
                `}
              >

                {/* ==================================================
                    Image
                    ================================================== */}

                <div className="relative">

                  <img
                    src={hostel.image}
                    alt={hostel.title}
                    className="h-64 w-full object-cover"
                  />

                  {selected && (
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-white shadow-lg">
                      <CheckCircle2
                        size={18}
                      />

                      <span className="font-semibold">
                        Selected
                      </span>
                    </div>
                  )}

                </div>

                {/* ==================================================
                    Content
                    ================================================== */}

                <div className="p-8">

                  <div className="flex items-center justify-between gap-4">

                    <h3 className="text-2xl font-bold text-gray-900">
                      {hostel.title}
                    </h3>

                    <BedDouble
                      className="flex-shrink-0 text-blue-600"
                      size={30}
                    />

                  </div>

                  <p className="mt-3 leading-7 text-gray-500">
                    {hostel.description}
                  </p>

                  {/* =================================================
                      Features
                      ================================================= */}

                  <div className="mt-8 space-y-4">

                    {hostel.features.map(
                      (feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3"
                        >

                          <ShieldCheck
                            className="flex-shrink-0 text-green-600"
                            size={18}
                          />

                          <span className="text-gray-700">
                            {feature}
                          </span>

                        </div>
                      ),
                    )}

                  </div>

                  {/* =================================================
                      Selection Button
                      ================================================= */}

                  <div className="mt-10">

                    <button
                      type="button"
                      onClick={() =>
                        onSelect(hostel.id)
                      }
                      className={`
                        w-full
                        rounded-xl
                        py-4
                        font-semibold
                        transition
                        ${
                          selected
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }
                      `}
                    >
                      {selected
                        ? "Hostel Selected"
                        : "Select Hostel"}
                    </button>

                  </div>

                </div>

              </motion.div>
            );
          })}

        </div>

        {/* ====================================================
            Pricing Information
            ==================================================== */}

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">

          <p className="text-lg font-bold text-gray-900">
            Accommodation: ₹100 per day
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            The total accommodation amount is calculated
            according to the number of accommodation days.
          </p>

        </div>

      </div>
    </section>
  );
};

export default RoomTypeCards;