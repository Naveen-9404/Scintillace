# FestSphere Component Library

## Navbar

- Purpose: Primary global navigation for all users.
- Variants: student, volunteer, admin, guest.
- States: default, active, hover, mobile collapsed, sticky.
- Accessibility Notes: ensure visible focus states, keyboard access, and clear labels.

## Footer

- Purpose: Support links, legal pages, contact, and social links.
- Variants: minimal and marketing-focused.
- States: default, hover, active.
- Accessibility Notes: maintain landmark structure and sufficient contrast.

## Sidebar

- Purpose: Section navigation for dashboards and admin tools.
- Variants: collapsed and expanded.
- States: active, hover, disabled.
- Accessibility Notes: support keyboard navigation and screen reader labels.

## Buttons

- Purpose: Primary actions such as register, submit, and continue.
- Variants: primary, secondary, ghost, danger, icon-only.
- States: default, hover, active, focus, loading, disabled.
- Accessibility Notes: minimum target size of 44px, clear labeling, visible focus ring.

## Cards

- Purpose: Group related content with visual separation.
- Variants: default, glass, feature, analytics, event, team, profile.
- States: default, hover, selected, loading.
- Accessibility Notes: use strong heading hierarchy and sufficient spacing.

## Badges

- Purpose: Indicate status, category, or priority.
- Variants: neutral, success, warning, danger, information.
- States: default, active, muted.
- Accessibility Notes: avoid relying on color alone.

## Alerts

- Purpose: Communicate success, warning, danger, and informational messages.
- Variants: inline, toast, banner.
- States: visible, dismissible, persistent.
- Accessibility Notes: provide ARIA roles and screen-reader-friendly text.

## Modals

- Purpose: Focused interactions such as payments, confirmations, and forms.
- Variants: confirmation, form, detail, full-width.
- States: default, loading, error, success.
- Accessibility Notes: trap focus, support Escape, and provide clear titles.

## Drawers

- Purpose: Mobile navigation and contextual settings.
- Variants: left, right, full-height.
- States: open, closed, loading.
- Accessibility Notes: ensure large hit areas and dismissible behavior.

## Dropdowns

- Purpose: Select from sets of actions or options.
- Variants: menu, select, action list.
- States: default, open, selected, disabled.
- Accessibility Notes: support keyboard movement and avoid deep nesting.

## Accordions

- Purpose: Show grouped information progressively.
- Variants: single-open and multi-open.
- States: collapsed, expanded, disabled.
- Accessibility Notes: use readable headings and keyboard toggling.

## Tabs

- Purpose: Switch between views within a section.
- Variants: horizontal, vertical, pill.
- States: default, active, hover, disabled.
- Accessibility Notes: keep tab order logical and announce active state.

## Forms

- Purpose: Collect student and admin information.
- Variants: stacked, two-column, multi-step.
- States: default, active, error, success, disabled.
- Accessibility Notes: associate labels clearly and show inline validation.

## Input Fields

- Purpose: Enter text such as names, email, and event details.
- Variants: text, email, password, search, textarea.
- States: default, focus, error, success, disabled.
- Accessibility Notes: include helper text and clear error copy.

## Select Boxes

- Purpose: Choose from a list of predefined values.
- Variants: single select, multi select, searchable select.
- States: default, open, selected, disabled.
- Accessibility Notes: ensure visible current choice and keyboard support.

## Checkboxes

- Purpose: Select multiple options.
- Variants: standard, grouped, indeterminate.
- States: unchecked, checked, indeterminate, disabled.
- Accessibility Notes: provide clear labels and avoid ambiguous grouping.

## Radio Buttons

- Purpose: Choose one option from a group.
- Variants: standard, card-style.
- States: unchecked, checked, disabled.
- Accessibility Notes: group options semantically and ensure one selection only.

## Tables

- Purpose: Display lists of events, participants, payments, and registrations.
- Variants: simple, compact, sortable, paginated.
- States: default, hover, selected, empty.
- Accessibility Notes: use proper headers, row labels, and logical tab order.

## Search Bar

- Purpose: Find events, users, and content quickly.
- Variants: inline, floating, mobile compact.
- States: default, focused, loading, empty result.
- Accessibility Notes: add a descriptive label and clear search affordance.

## Pagination

- Purpose: Move through long lists of data.
- Variants: numbered, previous/next, compact.
- States: active, disabled, ellipsis.
- Accessibility Notes: make current page clear and support keyboard navigation.

## Loader

- Purpose: Indicate pending actions and page transitions.
- Variants: spinner, progress bar, shimmer.
- States: loading, complete.
- Accessibility Notes: include role and label for assistive technologies.

## Skeleton Loader

- Purpose: Show content structure before data loads.
- Variants: card, table, form, profile.
- States: loading.
- Accessibility Notes: avoid flashing and maintain layout stability.

## Toast

- Purpose: Show short, non-blocking feedback.
- Variants: success, error, info.
- States: visible, dismissing, queued.
- Accessibility Notes: time out appropriately and remain screen-reader friendly.

## QR Card

- Purpose: Present digital ticket and event access credentials.
- Variants: compact, full-size, printable.
- States: default, scanned, expired.
- Accessibility Notes: include contrast-safe text and clear status indicator.

## Event Card

- Purpose: Highlight event information and encourage registration.
- Variants: featured, compact, list-item.
- States: default, hover, selected, sold out.
- Accessibility Notes: keep essential information visible without crowding.

## Team Card

- Purpose: Show team composition and actions for group registration.
- Variants: leader view, member view.
- States: active, pending, full.
- Accessibility Notes: use concise labels and avoid dense content.

## Profile Card

- Purpose: Display user summary and profile actions.
- Variants: student, volunteer, admin.
- States: default, editing, loading.
- Accessibility Notes: provide clear hierarchy and accessible controls.

## Dashboard Cards

- Purpose: Surface key metrics and shortcuts.
- Variants: stat card, task card, notification card.
- States: default, hover, active.
- Accessibility Notes: show labels, units, and trends clearly.

## Analytics Cards

- Purpose: Visualize registrations, attendance, and revenue.
- Variants: chart card, KPI card, trend card.
- States: default, loading, empty.
- Accessibility Notes: provide legends and accessible summaries.

## Charts

- Purpose: Present event and attendance trends.
- Variants: line, bar, donut, stacked bar.
- States: loading, empty, filtered.
- Accessibility Notes: include legends, labels, and text alternatives.
