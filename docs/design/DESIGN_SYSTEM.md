# FestSphere Design System

## Design Philosophy

FestSphere should feel like a premium, modern festival platform that balances excitement with clarity. The product should feel polished, trustworthy, and effortless for students, volunteers, and administrators alike.

### Core Principles
- Minimal: reduce clutter and emphasize what matters most.
- Elegant: use restraint, precision, and refined visual hierarchy.
- Spacious: allow breathing room between content blocks to improve comfort.
- Professional: reflect credibility, organization, and high-quality operations.
- Premium: create a sense of quality through thoughtful motion, spacing, and typography.
- Accessible: ensure strong contrast, readable text, and keyboard-friendly interfaces.
- Modern: favor simple surfaces, clean structure, and progressive interaction patterns.
- Mobile-first: design for small screens first, then expand gracefully.

## Visual Principles

- Prioritize one primary action per screen.
- Use calm, dark surfaces with bright accents for focus.
- Build hierarchy through spacing, size, and contrast rather than visual noise.
- Favor soft boundaries and high-quality elevation over heavy outlines.
- Keep motion subtle and purposeful.

## Layout System

### Page Structure
- App shell with top navigation, main content, and contextual side panels when needed.
- Content width should be constrained for readability.
- Primary actions should remain visible without crowding the layout.

### Recommended Max Widths
- Mobile: full width
- Tablet: 768px to 1023px
- Laptop: 1024px to 1439px
- Desktop: 1440px+

## Grid System

Use a 12-column grid.

- Mobile: 4 columns
- Tablet: 8 columns
- Desktop: 12 columns
- Large desktop: 12 columns with wider gutters

### Suggested Grid Rules
- Column gap: 24px
- Outer margins: 16px on mobile, 24px on tablet, 32px on desktop
- Content max width: 1280px

## Spacing System

Use an 8-point spacing system.

| Token | Value |
| --- | ---: |
| 1x | 8px |
| 2x | 16px |
| 3x | 24px |
| 4x | 32px |
| 5x | 40px |
| 6x | 48px |
| 8x | 64px |
| 10x | 80px |
| 12x | 96px |

## Border Radius Scale

| Token | Value |
| --- | ---: |
| xs | 6px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 20px |
| pill | 999px |

## Elevation System

| Level | Use Case |
| --- | --- |
| 0 | Flat surfaces |
| 1 | Default cards |
| 2 | Elevated panels |
| 3 | Modals and drawers |
| 4 | Overlays and critical interactions |

## Shadow System

Use soft, diffused shadows with low opacity.

- Shadow 1: subtle hover state
- Shadow 2: standard card elevation
- Shadow 3: modal or drawer elevation
- Shadow 4: floating action surfaces

## Component Principles

- Components should be simple, reusable, and predictable.
- Provide clear states for default, hover, active, focus, disabled, and loading.
- Keep labels short and action-oriented.
- Favor clarity over novelty.
- Maintain consistency across admin, student, and volunteer experiences.
