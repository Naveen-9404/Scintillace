import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

/**
 * ============================================================
 * Event Categories
 * ============================================================
 *
 * Categories currently used by Scintillace 2K26.
 */

const CATEGORIES = [
  {
    value: "",
    label: "All Categories",
  },
  {
    value: "TECHNICAL",
    label: "Technical",
  },
  {
    value: "WORKSHOP",
    label: "Workshop",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

/**
 * ============================================================
 * Event Filters
 * ============================================================
 */

export default function EventFilters({
  filters = {},
  onChange,
}) {
  const [search, setSearch] =
    useState(filters.q || "");

  /**
   * ==========================================================
   * Synchronize Search
   * ==========================================================
   */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(filters.q || "");
  }, [filters.q]);

  /**
   * ==========================================================
   * Search
   * ==========================================================
   */

  const handleSearchChange = (
    event,
  ) => {
    const value =
      event.target.value;

    setSearch(value);

    onChange?.({
      q: value,
    });
  };

  /**
   * ==========================================================
   * Category
   * ==========================================================
   */

  const handleCategoryChange = (
    event,
  ) => {
    onChange?.({
      category:
        event.target.value,
    });
  };

  /**
   * ==========================================================
   * Clear
   * ==========================================================
   */

  const handleClear = () => {
    setSearch("");

    onChange?.({
      q: "",
      category: "",
    });
  };

  const hasFilters =
    Boolean(filters.q?.trim()) ||
    Boolean(filters.category);

  return (
    <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl backdrop-blur-xl md:p-6">
      {/* =====================================================
          Header
          ===================================================== */}

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <SlidersHorizontal
              size={19}
              className="text-violet-400"
            />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Find an Event
            </h2>

            <p className="text-sm text-zinc-500">
              Search or filter Scintillace
              events.
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-zinc-700
              px-3
              py-2
              text-sm
              font-medium
              text-zinc-300
              transition
              hover:border-violet-500
              hover:text-white
            "
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* =====================================================
          Controls
          ===================================================== */}

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        {/* Search */}

        <div className="relative">
          <Search
            size={19}
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search events..."
            aria-label="Search events"
            className="
              h-12
              w-full
              rounded-xl
              border
              border-zinc-700
              bg-zinc-950
              pl-11
              pr-4
              text-sm
              text-white
              outline-none
              placeholder:text-zinc-600
              transition
              focus:border-violet-500
              focus:ring-2
              focus:ring-violet-500/20
            "
          />
        </div>

        {/* Category */}

        <select
          value={filters.category || ""}
          onChange={handleCategoryChange}
          aria-label="Filter events by category"
          className="
            h-12
            w-full
            rounded-xl
            border
            border-zinc-700
            bg-zinc-950
            px-4
            text-sm
            text-white
            outline-none
            transition
            focus:border-violet-500
            focus:ring-2
            focus:ring-violet-500/20
          "
        >
          {CATEGORIES.map(
            (category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  );
}