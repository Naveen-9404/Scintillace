import { X } from "lucide-react";
import { cn } from "../../utils";

function Dialog({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export const Drawer = Dialog;

export function Dropdown({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Dialog;