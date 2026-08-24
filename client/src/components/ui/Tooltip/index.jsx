import { motion } from 'framer-motion';
import { useId, useState } from 'react';

function Tooltip({ label, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <span tabIndex={0} aria-describedby={id} className="inline-flex">
        {children}
      </span>
      {open ? (
        <motion.div
          id={id}
          role="tooltip"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs text-[color:var(--color-text-secondary)] shadow-[0_12px_32px_rgba(6,8,22,0.25)]"
        >
          {label}
        </motion.div>
      ) : null}
    </div>
  );
}

export default Tooltip;
