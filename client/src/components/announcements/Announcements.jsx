import {
  useState,
} from "react";

import AnnouncementList from "../../components/announcements/AnnouncementList";

import useAnnouncements from "../../hooks/useAnnouncements";

export default function Announcements() {
  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const {
    announcements,
    pagination,
    loading,
    error,
  } = useAnnouncements({
    page,
    limit: 10,
    search,
  });

  const handleSearch =
    (event) => {
      event.preventDefault();

      setPage(1);
      setSearch(
        searchInput.trim(),
      );
    };

  const handleClear =
    () => {
      setSearchInput("");
      setSearch("");
      setPage(1);
    };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">

      <div className="mx-auto max-w-7xl">

        <div className="text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Stay Updated
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            Announcements
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Stay informed about important updates,
            registration deadlines, events and
            announcements.
          </p>

        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >

          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value,
              )
            }
            placeholder="Search announcements..."
            className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
          />

          <button
            type="submit"
            disabled={
              searchInput.trim()
                .length === 1
            }
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-zinc-500"
            >
              Clear
            </button>
          )}

        </form>

        <div className="mt-10">
          <AnnouncementList
            announcements={
              announcements
            }
            loading={loading}
            error={error}
          />
        </div>

        {pagination?.totalPages >
          1 && (
          <div className="mt-10 flex items-center justify-center gap-4">

            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="rounded-xl border border-zinc-800 px-5 py-2.5 text-sm font-semibold transition hover:border-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-zinc-500">
              Page {pagination.page}{" "}
              of{" "}
              {
                pagination.totalPages
              }
            </span>

            <button
              type="button"
              disabled={
                page >=
                  pagination.totalPages ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
              className="rounded-xl border border-zinc-800 px-5 py-2.5 text-sm font-semibold transition hover:border-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>
        )}

      </div>

    </main>
  );
}