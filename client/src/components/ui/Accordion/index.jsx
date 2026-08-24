import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../common/cn';

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[color:var(--color-text-primary)]">
        <span>{title}</span>
        <span className="text-[color:var(--color-text-secondary)]">{open ? '−' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 text-sm text-[color:var(--color-text-secondary)]">
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Accordion({ items = [], className }) {
  return <div className={cn('flex flex-col gap-3', className)}>{items.map((item) => <AccordionItem key={item.title} title={item.title} defaultOpen={item.defaultOpen}>{item.content}</AccordionItem>)}</div>;
}

export { AccordionItem };
export default Accordion;
