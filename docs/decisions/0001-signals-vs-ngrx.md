ADR-0001: Signals over NgRx
Context
Small SPA, local persistence, no complex effects/server flows. Maintainability and speed of delivery are priorities.

Decision
Use Angular Signals with lightweight per-page stores instead of NgRx.

Consequences
✅ Less boilerplate, faster iteration, easier to read.

⚠️ If server interaction and side-effects grow, NgRx (or effects) can be introduced later without major churn.
