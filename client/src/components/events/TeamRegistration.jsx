import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Copy,
  LogIn,
  Plus,
  Users,
} from "lucide-react";

import {
  useCreateTeam,
  useJoinTeam,
  useMyTeams,
} from "../../hooks/useTeams";

/**
 * ============================================================
 * Team Registration
 * ============================================================
 *
 * Handles:
 *
 * 1. Creating a team
 * 2. Joining an existing team
 * 3. Selecting an existing team
 *
 * The selected team ID is returned to the parent through
 * onTeamSelected().
 */

export default function TeamRegistration({
  event,
  selectedTeamId,
  onTeamSelected,
}) {
  const [mode, setMode] =
    useState("SELECT");

  const [teamName, setTeamName] =
    useState("");

  const [inviteCode, setInviteCode] =
    useState("");

  const [createdTeam, setCreatedTeam] =
    useState(null);

  const [localError, setLocalError] =
    useState("");

  const {
    data: teams = [],
    isLoading: teamsLoading,
  } = useMyTeams();

  const createTeamMutation =
    useCreateTeam();

  const joinTeamMutation =
    useJoinTeam();

  /**
   * ==========================================================
   * Teams belonging to this event
   * ==========================================================
   */

  const eventTeams = useMemo(
    () => {
      return teams.filter(
        (team) => {
          const teamEvent =
            team.event?._id ||
            team.event;

          return (
            String(teamEvent) ===
            String(event?._id)
          );
        },
      );
    },
    [teams, event?._id],
  );

  /**
   * ==========================================================
   * Select Existing Team
   * ==========================================================
   */

  const handleSelectTeam = (
    team,
  ) => {
    setLocalError("");

    onTeamSelected?.(
      team?._id || null,
    );
  };

  /**
   * ==========================================================
   * Create Team
   * ==========================================================
   */

  const handleCreateTeam =
    async (submitEvent) => {
      submitEvent.preventDefault();

      setLocalError("");

      const trimmedName =
        teamName.trim();

      if (
        trimmedName.length < 3
      ) {
        setLocalError(
          "Team name must contain at least 3 characters.",
        );

        return;
      }

      try {
        const team =
          await createTeamMutation.mutateAsync(
            {
              eventId:
                event?._id,

              teamName:
                trimmedName,
            },
          );

        setCreatedTeam(team);

        onTeamSelected?.(
          team?._id,
        );

        setTeamName("");
      } catch (error) {
        setLocalError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to create the team.",
        );
      }
    };

  /**
   * ==========================================================
   * Join Team
   * ==========================================================
   */

  const handleJoinTeam =
    async (submitEvent) => {
      submitEvent.preventDefault();

      setLocalError("");

      const normalizedCode =
        inviteCode
          .trim()
          .toUpperCase();

      if (
        normalizedCode.length !==
        8
      ) {
        setLocalError(
          "Invite code must contain exactly 8 characters.",
        );

        return;
      }

      try {
        const team =
          await joinTeamMutation.mutateAsync(
            normalizedCode,
          );

        const teamEvent =
          team?.event?._id ||
          team?.event;

        if (
          String(teamEvent) !==
          String(event?._id)
        ) {
          setLocalError(
            "This team belongs to a different event.",
          );

          return;
        }

        onTeamSelected?.(
          team?._id,
        );

        setInviteCode("");
      } catch (error) {
        setLocalError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to join the team.",
        );
      }
    };

  /**
   * ==========================================================
   * Created Team
   * ==========================================================
   */

  if (createdTeam) {
    const memberCount =
      createdTeam.members
        ?.length || 1;

    const maxMembers =
      createdTeam.maxMembers ||
      event?.teamSize ||
      0;

    const code =
      createdTeam.inviteCode ||
      "";

    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 shrink-0 text-emerald-400"
            size={22}
          />

          <div className="min-w-0">
            <h3 className="font-semibold text-white">
              Team created successfully
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Share the invite code with
              your teammates.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Team Name
          </p>

          <p className="mt-1 font-semibold text-white">
            {createdTeam.teamName}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Invite Code
              </p>

              <p className="mt-1 font-mono text-xl font-bold tracking-[0.2em] text-violet-400">
                {code}
              </p>
            </div>

            {code && (
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    code,
                  )
                }
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition hover:border-violet-500 hover:text-white"
                title="Copy invite code"
              >
                <Copy size={17} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
          <Users size={16} />

          <span>
            {memberCount} /{" "}
            {maxMembers} members
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-sm text-violet-200">
          Your team is selected for
          registration.
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * Render
   * ==========================================================
   */

  return (
    <div className="space-y-4">
      {/* Existing teams */}

      {teamsLoading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
          Loading your teams...
        </div>
      ) : (
        eventTeams.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Users
                size={20}
                className="text-violet-400"
              />

              <div>
                <h3 className="font-semibold text-white">
                  Your teams
                </h3>

                <p className="text-sm text-zinc-500">
                  Select a team for this
                  event.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {eventTeams.map(
                (team) => {
                  const isSelected =
                    String(
                      selectedTeamId,
                    ) ===
                    String(
                      team._id,
                    );

                  return (
                    <button
                      key={team._id}
                      type="button"
                      onClick={() =>
                        handleSelectTeam(
                          team,
                        )
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        p-4
                        text-left
                        transition
                        ${
                          isSelected
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">
                            {team.teamName}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {team.members
                              ?.length ||
                              0}{" "}
                            /{" "}
                            {team.maxMembers}{" "}
                            members
                          </p>
                        </div>

                        {isSelected && (
                          <CheckCircle2
                            size={20}
                            className="text-violet-400"
                          />
                        )}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )
      )}

      {/* Mode selector */}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setMode("CREATE");
            setLocalError("");
          }}
          className={`
            rounded-xl
            border
            p-4
            text-left
            transition
            ${
              mode === "CREATE"
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <Plus
              size={19}
              className="text-violet-400"
            />

            <div>
              <p className="font-semibold text-white">
                Create a Team
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Start a new team
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("JOIN");
            setLocalError("");
          }}
          className={`
            rounded-xl
            border
            p-4
            text-left
            transition
            ${
              mode === "JOIN"
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <LogIn
              size={19}
              className="text-violet-400"
            />

            <div>
              <p className="font-semibold text-white">
                Join a Team
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Use an invite code
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Create */}

      {mode === "CREATE" && (
        <form
          onSubmit={
            handleCreateTeam
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <label className="block text-sm font-medium text-zinc-300">
            Team Name
          </label>

          <input
            value={teamName}
            onChange={(event) =>
              setTeamName(
                event.target.value,
              )
            }
            maxLength={50}
            placeholder="Enter your team name"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Team size:{" "}
            {event?.teamSize || "—"}{" "}
            members
          </p>

          <button
            type="submit"
            disabled={
              createTeamMutation.isPending
            }
            className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createTeamMutation.isPending
              ? "Creating Team..."
              : "Create Team"}
          </button>
        </form>
      )}

      {/* Join */}

      {mode === "JOIN" && (
        <form
          onSubmit={
            handleJoinTeam
          }
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <label className="block text-sm font-medium text-zinc-300">
            Invite Code
          </label>

          <input
            value={inviteCode}
            onChange={(event) =>
              setInviteCode(
                event.target.value
                  .toUpperCase()
                  .replace(
                    /[^A-Z0-9]/g,
                    "",
                  )
                  .slice(0, 8),
              )
            }
            maxLength={8}
            placeholder="XXXXXXXX"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 font-mono tracking-[0.2em] text-white uppercase outline-none placeholder:text-zinc-600 focus:border-violet-500"
          />

          <p className="mt-2 text-xs text-zinc-500">
            Enter the 8-character invite
            code provided by your team
            leader.
          </p>

          <button
            type="submit"
            disabled={
              joinTeamMutation.isPending
            }
            className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joinTeamMutation.isPending
              ? "Joining Team..."
              : "Join Team"}
          </button>
        </form>
      )}

      {/* Error */}

      {localError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
          {localError}
        </div>
      )}
    </div>
  );
}