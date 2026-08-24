# Frontend Architecture Review

The project currently has two shared-component systems. The following overlaps
should be consolidated deliberately in a future change; no files were removed
as part of this review.

| Overlap | Recommended owner | Rationale |
| --- | --- | --- |
| Button | `components/ui` | A reusable interaction primitive. |
| Card | `components/ui` | A reusable visual primitive. |
| Avatar | `components/ui` | A reusable visual primitive. |
| Badge | `components/ui` | A reusable visual primitive. |
| Breadcrumb | `components/ui` | A reusable navigation primitive. |
| Container | `components/ui` | A reusable layout primitive. |
| Modal | `components/ui` | A reusable overlay primitive. |
| LoadingSpinner / Spinner | `components/ui` | The UI system should own loading feedback. |
| EmptyState / Feedback | `components/common` | Page-level state presentations belong with shared composites. |
| SectionDivider / Divider | `components/ui` | A reusable visual primitive. |

`components/common` should remain focused on composed, page-level building
blocks such as `PageHeader`, `SectionHeading`, `SearchBar`, and `ErrorMessage`.
