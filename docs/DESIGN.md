# Design Guidelines

Starter: replace these guidelines and token values with the project's approved design.
Paths are relative to the application directory.

## Source of Truth

The adjacent `design-tokens.json` defines shared design values.
These JSON tokens are documentation until explicitly wired into CSS variables or the
project's existing styling system. Do not assume Tailwind utilities already exist.

## Rules

- Reuse existing components listed in the adjacent `COMPONENTS.md`.
- Use tokens for colors, spacing, typography, and radii.
- No hardcoded colors in application components.
- Use semantic elements, labels, keyboard interaction, and visible focus states.
- Include loading, empty, error, and success states where applicable.
- Verify layouts at relevant mobile and desktop widths.
- Respect reduced-motion preferences when adding animation.

## Project Decisions

- Brand and approved palette: UNKNOWN: confirm with developer.
- Typography and font loading: UNKNOWN: confirm with developer.
- Token integration location: UNKNOWN: confirm with developer.
