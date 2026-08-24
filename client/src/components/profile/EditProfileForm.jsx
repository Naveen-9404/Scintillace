import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Save,
  UserRound,
  Phone,
  GraduationCap,
  Image,
} from "lucide-react";

import toast from "react-hot-toast";

import { updateProfile } from "../../api/users";

const createFormData = (user) => ({
  fullName: user?.fullName || "",
  phone: user?.phone || "",
  collegeId: user?.collegeId || "",
  avatarUrl: user?.avatarUrl || "",
});

export default function EditProfileForm({
  user,
  onClose,
  onUpdated,
}) {
  const [formData, setFormData] =
    useState(() =>
      createFormData(user),
    );

  const [saving, setSaving] =
    useState(false);

  /*
   * The form is initialized from the
   * current user.
   *
   * Defer synchronization when the
   * supplied user changes so that the
   * effect does not synchronously
   * trigger a state update.
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormData(
        createFormData(user),
      );
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [user]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const fullName =
      formData.fullName.trim();

    const phone =
      formData.phone.trim();

    const collegeId =
      formData.collegeId.trim();

    const avatarUrl =
      formData.avatarUrl.trim();

    if (fullName.length < 2) {
      toast.error(
        "Full name must contain at least 2 characters.",
      );

      return false;
    }

    if (fullName.length > 100) {
      toast.error(
        "Full name cannot exceed 100 characters.",
      );

      return false;
    }

    if (
      !/^\+?[0-9\s()-]{7,15}$/.test(
        phone,
      )
    ) {
      toast.error(
        "Please enter a valid phone number.",
      );

      return false;
    }

    if (
      collegeId.length < 2 ||
      collegeId.length > 50
    ) {
      toast.error(
        "College ID must be between 2 and 50 characters.",
      );

      return false;
    }

    if (
      !/^[A-Za-z0-9_-]+$/.test(
        collegeId,
      )
    ) {
      toast.error(
        "College ID contains invalid characters.",
      );

      return false;
    }

    if (
      avatarUrl &&
      !/^https?:\/\/.+/i.test(
        avatarUrl,
      )
    ) {
      toast.error(
        "Avatar URL must be a valid HTTP or HTTPS URL.",
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const updatedUser =
        await updateProfile({
          fullName:
            formData.fullName.trim(),

          phone:
            formData.phone.trim(),

          collegeId:
            formData.collegeId.trim(),

          avatarUrl:
            formData.avatarUrl.trim(),
        });

      toast.success(
        "Profile updated successfully.",
      );

      if (onUpdated) {
        await onUpdated(updatedUser);
      }
    } catch (error) {
      console.error(
        "Profile update error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card/80 p-7 shadow-card backdrop-blur-xl">

      {/* Header */}

      <div className="flex items-start justify-between gap-5">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Account Settings
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Edit Profile
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Update the information associated
            with your Scintillace participant
            profile.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close edit profile"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-background/50
            text-muted-foreground
            transition
            hover:border-primary/30
            hover:text-foreground
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={19} />
        </button>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >

        <FormField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          icon={UserRound}
          placeholder="Enter your full name"
          disabled={saving}
          required
        />

        <FormField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
          placeholder="Enter your phone number"
          disabled={saving}
          required
        />

        <FormField
          label="College ID"
          name="collegeId"
          value={formData.collegeId}
          onChange={handleChange}
          icon={GraduationCap}
          placeholder="Enter your college ID"
          disabled={saving}
          required
        />

        <FormField
          label="Profile Image URL"
          name="avatarUrl"
          value={formData.avatarUrl}
          onChange={handleChange}
          icon={Image}
          placeholder="https://example.com/profile.jpg"
          disabled={saving}
        />

        {/* Email */}

        <div className="rounded-2xl border border-border bg-muted/30 p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </p>

          <p className="mt-1 break-all text-sm font-semibold">
            {user?.email ||
              "Not available"}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Email cannot be changed from the
            profile page.
          </p>

        </div>

        {/* Security note */}

        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">

          <p className="text-sm font-semibold text-primary">
            Profile security
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Your role, password, authentication
            provider and account verification
            settings cannot be modified from
            this form.
          </p>

        </div>

        {/* Actions */}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border
              border-border
              bg-background/50
              px-6
              py-3
              font-semibold
              transition-all
              duration-300
              hover:border-primary/30
              hover:bg-card
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-6
              py-3
              font-semibold
              text-primary-foreground
              shadow-glow
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:brightness-110
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-primary-foreground/30
                    border-t-primary-foreground
                  "
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={17} />

                Save Changes
              </>
            )}
          </button>

        </div>

      </form>
    </section>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  placeholder,
  disabled,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <div className="relative">

        <Icon
          size={18}
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="
            w-full
            rounded-xl
            border
            border-border
            bg-background/50
            py-3
            pl-11
            pr-4
            text-sm
            text-foreground
            outline-none
            transition
            placeholder:text-muted-foreground
            focus:border-primary/50
            focus:ring-2
            focus:ring-primary/10
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

      </div>
    </div>
  );
}