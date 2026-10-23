# Project conventions
- Keep the institutional repository UI in `src/components/repository` and use shared article data and existing reader/favorites services; homepage presentation must not require schema changes.
- Keep academic filtering, author formatting and browser-only reading history in `src/lib/repository.ts` with focused behavior tests; these rules must be reusable and independently verifiable.
- Reading history stores only article IDs under a user-scoped browser key, not account permissions or article snapshots; it is device-local and does not imply synced analytics.
- All routes use RepositoryShell as the sole owner of institutional header/sidebar/footer, so navigation and theme remain identical without page-level chrome.
- RepositoryShell measures the fixed header height for content and full-height sidebar offsets; page wrappers stay fluid without centered max-width constraints to keep all routes edge-to-edge.
- Collection routes and Home use RepositoryCollection with PublicationCard and repository utilities, so filters and bibliographic actions cannot drift between pages.
- Article citations use only existing metadata; absent DOI, affiliation or translated abstract must never be invented.
