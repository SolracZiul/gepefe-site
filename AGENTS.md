# Project conventions
- Keep the institutional repository UI in `src/components/repository` and use shared article data and existing reader/favorites services; homepage presentation must not require schema changes.
- Keep academic filtering, author formatting and browser-only reading history in `src/lib/repository.ts` with focused behavior tests; these rules must be reusable and independently verifiable.
- Reading history stores only article IDs under a user-scoped browser key, not account permissions or article snapshots; it is device-local and does not imply synced analytics.