import { CalendarDays, Moon } from "lucide-react";

const DateSelection = ({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
}) => {

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const calculateNights = () => {

    if (!checkIn || !checkOut)
      return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diff =
      Math.ceil(
        (end - start) /
        (1000 * 60 * 60 * 24)
      );

    return diff > 0
      ? diff
      : 0;
  };

  const nights =
    calculateNights();

  return (

    <div className="space-y-8">

      <div>

        <h3 className="text-2xl font-bold text-gray-900">

          Stay Duration

        </h3>

        <p className="mt-2 text-gray-500">

          Select your hostel check-in and check-out dates.

        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <div>

          <label className="mb-2 block font-medium">

            Check-In

          </label>

          <div className="relative">

            <CalendarDays
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) =>
                setCheckIn(e.target.value)
              }
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                py-4
                pl-12
                pr-5
                outline-none
                transition
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-200
              "
            />

          </div>

        </div>

        <div>

          <label className="mb-2 block font-medium">

            Check-Out

          </label>

          <div className="relative">

            <CalendarDays
              size={20}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="date"
              value={checkOut}
              min={
                checkIn || today
              }
              onChange={(e) =>
                setCheckOut(e.target.value)
              }
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                py-4
                pl-12
                pr-5
                outline-none
                transition
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-200
              "
            />

          </div>

        </div>

      </div>

      <div className="rounded-2xl bg-blue-50 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-blue-600 p-3 text-white">

            <Moon size={24} />

          </div>

          <div>

            <h4 className="font-semibold text-gray-900">

              Duration

            </h4>

            <p className="text-gray-600">

              {nights}
              {" "}
              {nights === 1
                ? "Night"
                : "Nights"}

            </p>

          </div>

        </div>

      </div>

    </div>

  );

};

export default DateSelection;