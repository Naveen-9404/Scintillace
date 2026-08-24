import { Link } from "react-router-dom";

const certificates = [
  {
    id: 1,
    title: "Hackathon 2027",
    position: "Winner",
    date: "15 Aug 2027",
  },
  {
    id: 2,
    title: "Code Sprint",
    position: "Participant",
    date: "16 Aug 2027",
  },
  {
    id: 3,
    title: "Paper Presentation",
    position: "Runner Up",
    date: "18 Aug 2027",
  },
];

export default function Certificates() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold">
          My Certificates
        </h1>

        <p className="mt-2 text-zinc-400">
          View and download your event participation and achievement certificates.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="text-5xl">🏆</div>

              <h2 className="mt-4 text-2xl font-semibold">
                {certificate.title}
              </h2>

              <p className="mt-3 text-zinc-400">
                Position: {certificate.position}
              </p>

              <p className="text-zinc-400">
                Date: {certificate.date}
              </p>

              <button className="mt-6 w-full rounded-xl bg-violet-600 py-3 font-semibold hover:bg-violet-700">
                Download Certificate
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            to="/dashboard"
            className="rounded-xl border border-zinc-700 px-6 py-3 hover:border-violet-500"
          >
            Dashboard
          </Link>

          <Link
            to="/profile"
            className="rounded-xl border border-zinc-700 px-6 py-3 hover:border-violet-500"
          >
            Profile
          </Link>
        </div>
      </div>
    </div>
  );
}