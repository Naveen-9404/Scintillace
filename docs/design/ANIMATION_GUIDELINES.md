# FestSphere Animation Guidelines

## Motion Philosophy

Animations should feel smooth, subtle, and professional. Motion should guide attention, reinforce feedback, and improve clarity without overwhelming the experience.

## Recommended Motion Principles

- Use short durations: 120ms to 240ms for common interactions.
- Use easing that feels natural and polished, such as ease-out.
- Avoid excessive bounce or dramatic transitions.
- Preserve motion consistency across components.

## Page Transitions

- Use fade and slight slide transitions between main screens.
- Keep transition duration around 200ms to 300ms.
- Avoid large, complex page movements.

## Hover Animations

- Apply subtle elevation or tint changes on interactive cards and buttons.
- Use opacity and small transform shifts rather than dramatic motion.

## Loading Animations

- Use skeletons for content loading.
- For small actions, use a lightweight spinner or progress indicator.
- Keep loading feedback calm and non-blocking where possible.

## Scroll Animations

- Reveal sections gently as the user scrolls.
- Avoid animated content that distracts from reading.
- Use progressive enhancement only when it adds clarity.

## Card Animations

- Cards may lift slightly on hover and settle smoothly on press.
- Keep hover states subtle to maintain a premium feel.

## Button Animations

- Apply a brief scale or color transition on press and hover.
- Ensure disabled states remain visually stable.

## Modal Animations

- Use fade-in and scale-in behavior for modals.
- Keep entrance and exit timing consistent.
- Ensure motion does not interfere with accessibility or focus handling.

## Framer Motion Concepts

Recommended concepts:
- motion.div for animated containers
- AnimatePresence for transitions
- transition duration and easing props for consistent timing
- whileHover, whileTap, and initial/animate states for interface feedback
