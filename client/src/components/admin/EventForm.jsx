import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Image,
  Loader2,
  Save,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  createEvent,
  updateEvent,
} from "../../api/admin.events.api";

const EVENT_CATEGORIES = [
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "LITERARY",
  "WORKSHOP",
  "SEMINAR",
  "GAMING",
  "OTHER",
];

const EVENT_TYPES = [
  "INDIVIDUAL",
  "TEAM",
];

const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

const CURRENCIES = [
  "INR",
  "USD",
  "EUR",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  festival: "",
  category: "TECHNICAL",
  type: "INDIVIDUAL",
  venue: "",

  startDateTime: "",
  endDateTime: "",
  registrationDeadline: "",

  maxParticipants: "",
  teamSize: "1",

  isPaid: false,
  registrationFee: "0",
  currency: "INR",
  prizePool: "",

  poster: "",
  banner: "",
  gallery: "",

  eligibility: "",
  highlights: "",
  requirements: "",
  rules: "",

  speakerName: "",
  speakerDesignation: "",
  speakerOrganization: "",
  speakerImage: "",

  coordinators: "",

  status: "DRAFT",
  registrationOpen: false,
};

function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000,
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return value || "";
}

function getInitialForm(event) {
  if (!event) {
    return EMPTY_FORM;
  }

  return {
    title:
      event.title || "",

    description:
      event.description || "",

    festival:
      event.festival?._id ||
      event.festival?.id ||
      event.festival ||
      "",

    category:
      event.category ||
      "TECHNICAL",

    type:
      event.type ||
      "INDIVIDUAL",

    venue:
      event.venue || "",

    startDateTime:
      toDateTimeLocal(
        event.startDateTime,
      ),

    endDateTime:
      toDateTimeLocal(
        event.endDateTime,
      ),

    registrationDeadline:
      toDateTimeLocal(
        event.registrationDeadline,
      ),

    maxParticipants:
      event.maxParticipants ??
      "",

    teamSize:
      event.teamSize ??
      (event.type === "TEAM"
        ? "2"
        : "1"),

    isPaid:
      Boolean(event.isPaid),

    registrationFee:
      event.registrationFee ??
      "0",

    currency:
      event.currency ||
      "INR",

    prizePool:
      event.prizePool ??
      "",

    poster:
      event.poster || "",

    banner:
      event.banner || "",

    gallery:
      normalizeList(
        event.gallery,
      ),

    eligibility:
      normalizeList(
        event.eligibility,
      ),

    highlights:
      normalizeList(
        event.highlights,
      ),

    requirements:
      normalizeList(
        event.requirements,
      ),

    rules:
      normalizeList(
        event.rules,
      ),

    speakerName:
      event.speaker?.name ||
      "",

    speakerDesignation:
      event.speaker?.designation ||
      "",

    speakerOrganization:
      event.speaker?.organization ||
      "",

    speakerImage:
      event.speaker?.image ||
      "",

    coordinators:
      normalizeList(
        event.coordinators,
      ),

    status:
      event.status ||
      "DRAFT",

    registrationOpen:
      Boolean(
        event.registrationOpen,
      ),
  };
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) =>
      item.trim(),
    )
    .filter(Boolean);
}

export default function EventForm({
  event = null,
  festivals = [],
  onSuccess,
  onClose,
}) {
  const isEditing =
    Boolean(event);

  const [
    form,
    setForm,
  ] = useState(
    () =>
      getInitialForm(event),
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const festivalOptions =
    useMemo(
      () =>
        Array.isArray(
          festivals,
        )
          ? festivals
          : [],
      [festivals],
    );

  const updateField = (
    field,
    value,
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  };

  const handleTypeChange = (
    value,
  ) => {
    setForm(
      (current) => ({
        ...current,
        type: value,
        teamSize:
          value === "TEAM"
            ? Math.max(
                Number(
                  current.teamSize,
                ) || 2,
                2,
              )
            : "1",
      }),
    );
  };

  const handlePaidChange = (
    value,
  ) => {
    setForm(
      (current) => ({
        ...current,
        isPaid: value,
        registrationFee:
          value
            ? current.registrationFee ===
                "0"
              ? ""
              : current.registrationFee
            : "0",
      }),
    );
  };

  const validateForm = () => {
    if (
      !form.title.trim()
    ) {
      return "Event title is required.";
    }

    if (
      form.title.trim().length <
      3
    ) {
      return "Event title must contain at least 3 characters.";
    }

    if (
      !form.description.trim()
    ) {
      return "Event description is required.";
    }

    if (
      !form.festival
    ) {
      return "Please select a festival.";
    }

    if (
      !form.category
    ) {
      return "Please select an event category.";
    }

    if (
      !form.type
    ) {
      return "Please select an event type.";
    }

    if (
      !form.venue.trim()
    ) {
      return "Event venue is required.";
    }

    if (
      !form.startDateTime
    ) {
      return "Start date and time are required.";
    }

    if (
      !form.endDateTime
    ) {
      return "End date and time are required.";
    }

    if (
      !form.registrationDeadline
    ) {
      return "Registration deadline is required.";
    }

    const start =
      new Date(
        form.startDateTime,
      );

    const end =
      new Date(
        form.endDateTime,
      );

    const deadline =
      new Date(
        form.registrationDeadline,
      );

    if (
      Number.isNaN(
        start.getTime(),
      ) ||
      Number.isNaN(
        end.getTime(),
      ) ||
      Number.isNaN(
        deadline.getTime(),
      )
    ) {
      return "Please provide valid event dates.";
    }

    if (end < start) {
      return "End date and time must be after the start date.";
    }

    if (deadline > start) {
      return "Registration deadline must be before the event starts.";
    }

    const maxParticipants =
      Number(
        form.maxParticipants,
      );

    if (
      !Number.isInteger(
        maxParticipants,
      ) ||
      maxParticipants < 1
    ) {
      return "Maximum participants must be at least 1.";
    }

    const teamSize =
      Number(
        form.teamSize,
      );

    if (
      form.type === "INDIVIDUAL" &&
      teamSize !== 1
    ) {
      return "Individual events must have a team size of 1.";
    }

    if (
      form.type === "TEAM"
    ) {
      if (
        !Number.isInteger(
          teamSize,
        ) ||
        teamSize < 2
      ) {
        return "Team events must have a minimum team size of 2.";
      }

      if (
        teamSize >
        maxParticipants
      ) {
        return "Team size cannot exceed maximum participants.";
      }
    }

    if (
      form.isPaid
    ) {
      const fee =
        Number(
          form.registrationFee,
        );

      if (
        !Number.isFinite(
          fee,
        ) ||
        fee <= 0
      ) {
        return "Registration fee must be greater than 0 for a paid event.";
      }
    }

    return "";
  };

  const buildPayload =
    () => {
      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim(),

        festival:
          form.festival,

        category:
          form.category,

        type:
          form.type,

        venue:
          form.venue.trim(),

        startDateTime:
          new Date(
            form.startDateTime,
          ).toISOString(),

        endDateTime:
          new Date(
            form.endDateTime,
          ).toISOString(),

        registrationDeadline:
          new Date(
            form.registrationDeadline,
          ).toISOString(),

        maxParticipants:
          Number(
            form.maxParticipants,
          ),

        teamSize:
          Number(
            form.teamSize,
          ),

        isPaid:
          Boolean(
            form.isPaid,
          ),

        registrationFee:
          form.isPaid
            ? Number(
                form.registrationFee,
              )
            : 0,

        currency:
          form.currency,

        prizePool:
          form.prizePool === ""
            ? 0
            : Number(
                form.prizePool,
              ),

        poster:
          form.poster.trim(),

        banner:
          form.banner.trim(),

        gallery:
          splitLines(
            form.gallery,
          ),

        eligibility:
          splitLines(
            form.eligibility,
          ),

        highlights:
          splitLines(
            form.highlights,
          ),

        requirements:
          splitLines(
            form.requirements,
          ),

        rules:
          splitLines(
            form.rules,
          ),

        coordinators:
          splitLines(
            form.coordinators,
          ),

        status:
          form.status,

        registrationOpen:
          Boolean(
            form.registrationOpen,
          ),
      };

      const hasSpeaker =
        form.speakerName.trim() ||
        form.speakerDesignation.trim() ||
        form.speakerOrganization.trim() ||
        form.speakerImage.trim();

      if (hasSpeaker) {
        payload.speaker = {
          name:
            form.speakerName.trim(),

          designation:
            form.speakerDesignation.trim(),

          organization:
            form.speakerOrganization.trim(),

          image:
            form.speakerImage.trim(),
        };
      }

      return payload;
    };

  const handleSubmit =
    async (submitEvent) => {
      submitEvent.preventDefault();

      setError("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError,
        );
        toast.error(
          validationError,
        );
        return;
      }

      try {
        setSubmitting(true);

        const payload =
          buildPayload();

        const savedEvent =
          isEditing
            ? await updateEvent(
                event._id ||
                  event.id,
                payload,
              )
            : await createEvent(
                payload,
              );

        toast.success(
          isEditing
            ? "Event updated successfully."
            : "Event created successfully.",
        );

        onSuccess?.(
          savedEvent,
        );
      } catch (err) {
        console.error(
          "Failed to save event:",
          err,
        );

        const message =
          err?.response?.data
            ?.message ||
          err?.response?.data
            ?.errors?.[0]
            ?.msg ||
          "Unable to save event.";

        setError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">

        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
              <CalendarDays
                size={21}
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                Administration
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                {isEditing
                  ? "Edit Event"
                  : "Create Event"}
              </h2>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-violet-500 hover:text-white disabled:opacity-40"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={
            handleSubmit
          }
          className="min-h-0 flex-1 overflow-y-auto"
        >

          <div className="space-y-8 p-6">

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Basic Information */}

            <FormSection
              title="Basic Information"
              description="Core information about the event."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Event Title"
                  required
                  className="md:col-span-2"
                >
                  <input
                    value={
                      form.title
                    }
                    onChange={(e) =>
                      updateField(
                        "title",
                        e.target.value,
                      )
                    }
                    placeholder="Enter event title"
                    className="input"
                  />
                </Field>

                <Field
                  label="Description"
                  required
                  className="md:col-span-2"
                >
                  <textarea
                    rows={4}
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateField(
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe the event..."
                    className="input resize-y"
                  />
                </Field>

                <Field
                  label="Festival"
                  required
                >
                  <select
                    value={
                      form.festival
                    }
                    onChange={(e) =>
                      updateField(
                        "festival",
                        e.target.value,
                      )
                    }
                    className="input"
                  >
                    <option value="">
                      Select Festival
                    </option>

                    {festivalOptions.map(
                      (
                        festival,
                      ) => {
                        const id =
                          festival?._id ||
                          festival?.id;

                        return (
                          <option
                            key={id}
                            value={id}
                          >
                            {festival?.title ||
                              festival?.name ||
                              "Untitled Festival"}
                          </option>
                        );
                      },
                    )}
                  </select>

                  {festivalOptions.length ===
                    0 && (
                    <p className="mt-2 text-xs text-amber-400">
                      No festivals available.
                      Create a festival before
                      creating an event.
                    </p>
                  )}
                </Field>

                <Field
                  label="Category"
                  required
                >
                  <select
                    value={
                      form.category
                    }
                    onChange={(e) =>
                      updateField(
                        "category",
                        e.target.value,
                      )
                    }
                    className="input"
                  >
                    {EVENT_CATEGORIES.map(
                      (
                        category,
                      ) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field
                  label="Event Type"
                  required
                >
                  <select
                    value={
                      form.type
                    }
                    onChange={(e) =>
                      handleTypeChange(
                        e.target.value,
                      )
                    }
                    className="input"
                  >
                    {EVENT_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field
                  label="Venue"
                  required
                >
                  <input
                    value={
                      form.venue
                    }
                    onChange={(e) =>
                      updateField(
                        "venue",
                        e.target.value,
                      )
                    }
                    placeholder="Event venue"
                    className="input"
                  />
                </Field>

              </div>

            </FormSection>

            {/* Schedule */}

            <FormSection
              title="Schedule"
              description="Set the event schedule and registration deadline."
            >

              <div className="grid gap-5 md:grid-cols-3">

                <Field
                  label="Start Date & Time"
                  required
                >
                  <input
                    type="datetime-local"
                    value={
                      form.startDateTime
                    }
                    onChange={(e) =>
                      updateField(
                        "startDateTime",
                        e.target.value,
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field
                  label="End Date & Time"
                  required
                >
                  <input
                    type="datetime-local"
                    value={
                      form.endDateTime
                    }
                    onChange={(e) =>
                      updateField(
                        "endDateTime",
                        e.target.value,
                      )
                    }
                    className="input"
                  />
                </Field>

                <Field
                  label="Registration Deadline"
                  required
                >
                  <input
                    type="datetime-local"
                    value={
                      form.registrationDeadline
                    }
                    onChange={(e) =>
                      updateField(
                        "registrationDeadline",
                        e.target.value,
                      )
                    }
                    className="input"
                  />
                </Field>

              </div>

            </FormSection>

            {/* Capacity */}

            <FormSection
              title="Capacity"
              description="Configure participant and team limits."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Maximum Participants"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    value={
                      form.maxParticipants
                    }
                    onChange={(e) =>
                      updateField(
                        "maxParticipants",
                        e.target.value,
                      )
                    }
                    placeholder="100"
                    className="input"
                  />
                </Field>

                <Field
                  label="Team Size"
                  required
                  hint={
                    form.type ===
                    "INDIVIDUAL"
                      ? "Individual events always use team size 1."
                      : "Minimum team size is 2."
                  }
                >
                  <input
                    type="number"
                    min={
                      form.type ===
                      "TEAM"
                        ? "2"
                        : "1"
                    }
                    value={
                      form.teamSize
                    }
                    disabled={
                      form.type ===
                      "INDIVIDUAL"
                    }
                    onChange={(e) =>
                      updateField(
                        "teamSize",
                        e.target.value,
                      )
                    }
                    className="input disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Field>

              </div>

            </FormSection>

            {/* Payment */}

            <FormSection
              title="Payment"
              description="Configure registration fees and prize information."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Registration Type"
                >
                  <div className="flex gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        handlePaidChange(
                          false,
                        )
                      }
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        !form.isPaid
                          ? "border-violet-500 bg-violet-500/10 text-violet-300"
                          : "border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Free
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePaidChange(
                          true,
                        )
                      }
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                        form.isPaid
                          ? "border-violet-500 bg-violet-500/10 text-violet-300"
                          : "border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Paid
                    </button>

                  </div>
                </Field>

                <Field
                  label="Registration Fee"
                  required={
                    form.isPaid
                  }
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.registrationFee
                    }
                    disabled={
                      !form.isPaid
                    }
                    onChange={(e) =>
                      updateField(
                        "registrationFee",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    className="input disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Field>

                <Field
                  label="Currency"
                >
                  <select
                    value={
                      form.currency
                    }
                    onChange={(e) =>
                      updateField(
                        "currency",
                        e.target.value,
                      )
                    }
                    disabled={
                      !form.isPaid
                    }
                    className="input disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {CURRENCIES.map(
                      (currency) => (
                        <option
                          key={currency}
                          value={currency}
                        >
                          {currency}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field
                  label="Prize Pool"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.prizePool
                    }
                    onChange={(e) =>
                      updateField(
                        "prizePool",
                        e.target.value,
                      )
                    }
                    placeholder="0"
                    className="input"
                  />
                </Field>

              </div>

            </FormSection>

            {/* Media */}

            <FormSection
              title="Media"
              description="Provide URLs for event artwork."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Poster URL"
                >
                  <div className="relative">
                    <Image
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      value={
                        form.poster
                      }
                      onChange={(e) =>
                        updateField(
                          "poster",
                          e.target.value,
                        )
                      }
                      placeholder="https://..."
                      className="input pl-11"
                    />
                  </div>
                </Field>

                <Field
                  label="Banner URL"
                >
                  <div className="relative">
                    <Image
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                    />

                    <input
                      value={
                        form.banner
                      }
                      onChange={(e) =>
                        updateField(
                          "banner",
                          e.target.value,
                        )
                      }
                      placeholder="https://..."
                      className="input pl-11"
                    />
                  </div>
                </Field>

                <Field
                  label="Gallery URLs"
                  hint="Enter one URL per line."
                  className="md:col-span-2"
                >
                  <textarea
                    rows={4}
                    value={
                      form.gallery
                    }
                    onChange={(e) =>
                      updateField(
                        "gallery",
                        e.target.value,
                      )
                    }
                    placeholder={"https://...\nhttps://..."}
                    className="input resize-y"
                  />
                </Field>

              </div>

            </FormSection>

            {/* Content */}

            <FormSection
              title="Event Content"
              description="Add information participants need before registering."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <ListField
                  label="Eligibility"
                  value={
                    form.eligibility
                  }
                  onChange={(value) =>
                    updateField(
                      "eligibility",
                      value,
                    )
                  }
                />

                <ListField
                  label="Highlights"
                  value={
                    form.highlights
                  }
                  onChange={(value) =>
                    updateField(
                      "highlights",
                      value,
                    )
                  }
                />

                <ListField
                  label="Requirements"
                  value={
                    form.requirements
                  }
                  onChange={(value) =>
                    updateField(
                      "requirements",
                      value,
                    )
                  }
                />

                <ListField
                  label="Rules"
                  value={
                    form.rules
                  }
                  onChange={(value) =>
                    updateField(
                      "rules",
                      value,
                    )
                  }
                />

              </div>

            </FormSection>

            {/* Speaker */}

            <FormSection
              title="Speaker"
              description="Optional speaker information, useful for workshops and seminars."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Name"
                >
                  <input
                    value={
                      form.speakerName
                    }
                    onChange={(e) =>
                      updateField(
                        "speakerName",
                        e.target.value,
                      )
                    }
                    placeholder="Speaker name"
                    className="input"
                  />
                </Field>

                <Field
                  label="Designation"
                >
                  <input
                    value={
                      form.speakerDesignation
                    }
                    onChange={(e) =>
                      updateField(
                        "speakerDesignation",
                        e.target.value,
                      )
                    }
                    placeholder="Professor / Engineer / etc."
                    className="input"
                  />
                </Field>

                <Field
                  label="Organization"
                >
                  <input
                    value={
                      form.speakerOrganization
                    }
                    onChange={(e) =>
                      updateField(
                        "speakerOrganization",
                        e.target.value,
                      )
                    }
                    placeholder="Organization"
                    className="input"
                  />
                </Field>

                <Field
                  label="Image URL"
                >
                  <input
                    value={
                      form.speakerImage
                    }
                    onChange={(e) =>
                      updateField(
                        "speakerImage",
                        e.target.value,
                      )
                    }
                    placeholder="https://..."
                    className="input"
                  />
                </Field>

              </div>

            </FormSection>

            {/* Coordinators */}

            <FormSection
              title="Coordinators"
              description="Add coordinator identifiers or values, one per line."
            >

              <textarea
                rows={4}
                value={
                  form.coordinators
                }
                onChange={(e) =>
                  updateField(
                    "coordinators",
                    e.target.value,
                  )
                }
                placeholder={"Coordinator 1\nCoordinator 2"}
                className="input resize-y"
              />

            </FormSection>

            {/* Publishing */}

            <FormSection
              title="Publishing"
              description="Control the event lifecycle and registration availability."
            >

              <div className="grid gap-5 md:grid-cols-2">

                <Field
                  label="Event Status"
                >
                  <select
                    value={
                      form.status
                    }
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value,
                      )
                    }
                    className="input"
                  >
                    {EVENT_STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field
                  label="Registration"
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "registrationOpen",
                        !form.registrationOpen,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
                      form.registrationOpen
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-300">
                      Registration Open
                    </span>

                    <span
                      className={`relative h-6 w-11 rounded-full transition ${
                        form.registrationOpen
                          ? "bg-emerald-500"
                          : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          form.registrationOpen
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </span>
                  </button>
                </Field>

              </div>

            </FormSection>

          </div>

          {/* Footer */}

          <div className="sticky bottom-0 flex shrink-0 items-center justify-end gap-3 border-t border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur-xl">

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                submitting
              }
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                festivalOptions.length ===
                  0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={18}
                />
              )}

              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Event"
                  : "Create Event"}
            </button>

          </div>

        </form>

      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(2,6,23,0.6);
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 150ms ease;
        }

        .input::placeholder {
          color: rgb(71,85,105);
        }

        .input:focus {
          border-color: rgb(139,92,246);
        }

        select.input option {
          background: rgb(15,23,42);
          color: white;
        }
      `}</style>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <section className="space-y-5">

      <div className="border-b border-white/5 pb-3">

        <h3 className="text-base font-bold text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {description}
          </p>
        )}

      </div>

      {children}

    </section>
  );
}

function Field({
  label,
  required = false,
  hint = "",
  className = "",
  children,
}) {
  return (
    <div
      className={
        className
      }
    >
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}

        {required && (
          <span className="ml-1 text-violet-400">
            *
          </span>
        )}
      </label>

      {children}

      {hint && (
        <p className="mt-2 text-xs text-slate-600">
          {hint}
        </p>
      )}
    </div>
  );
}

function ListField({
  label,
  value,
  onChange,
}) {
  return (
    <Field
      label={label}
      hint="Enter one item per line."
    >
      <textarea
        rows={4}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={`${label} 1\n${label} 2`}
        className="input resize-y"
      />
    </Field>
  );
}