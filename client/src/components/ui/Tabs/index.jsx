import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../common/cn';

function Tabs({ items = [], defaultIndex = 0, className }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className={cn('w-full', className)}>
      <div role="tablist" aria-label="Tabs" className="flex flex-wrap gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1">
        {items.map((item, index) => (
          <button
            key={item.label}
            role="tab"
            aria-selected={activeIndex === index}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition',
              activeIndex === index ? 'bg-[color:var(--color-accent)] text-white' : 'text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items[activeIndex] ? (
        <motion.div key={items[activeIndex].label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
          {items[activeIndex].content}
        </motion.div>
      ) : null}
    </div>
  );
}

export default Tabs;
