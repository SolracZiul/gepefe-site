# Project conventions
- Keep the institutional repository UI in `src/components/repository` and use shared article data and existing reader/favorites services; homepage presentation must not require schema changes.
- Keep academic filtering, author formatting and browser-only reading history in `src/lib/repository.ts` with focused behavior tests; these rules must be reusable and independently verifiable.
- Reading history stores only article IDs under a user-scoped browser key, not account permissions or article snapshots; it is device-local and does not imply synced analytics.
- All routes use RepositoryShell as the sole owner of institutional header/sidebar/footer, so navigation and theme remain identical without page-level chrome.
- Institutional link ordering and mobile account shortcuts come from shared navigation definitions; the shell provides bottom navigation below the desktop breakpoint to prevent per-page drift.
- RepositoryShell measures the fixed header height for content and full-height sidebar offsets; page wrappers stay fluid without centered max-width constraints to keep all routes edge-to-edge.
- Collection routes and Home use RepositoryCollection with PublicationCard and repository utilities, so filters and bibliographic actions cannot drift between pages.
- Mobile filter chips and the year/author bottom sheet share RepositoryCollection filter state with desktop controls, so changing presentation never changes academic filtering rules.
- The sidebar menu lists only collection and section destinations while institutional identity lives in the sidebar's institutional block, and each article page renders its citation once, so no destination or bibliographic string is offered twice.
- Article citations use only existing metadata; absent DOI, affiliation or translated abstract must never be invented.
- Institutional content lives on one page (`/linhas-de-pesquisa`) covering mission, objectives, research lines and researchers; former addresses (`/sobre`, `/integrantes`) redirect there keeping a known section anchor, so no destination is offered twice in navigation.
- Admin forms use FileDropzone/FormSection/FormPageHeader from `src/components/repository/FileDropzone.tsx` so PDF and image uploads share one drag & drop area and section layout.

- Quick category chips derive from shared academic search matches before refinement; the full category selector remains independent of the quick-chip limit, and Tudo clears refinement without discarding search so advanced categories remain selectable.
- The quick-filter chip bar renders one non-wrapping row through the shared `.repository-chip-scroll` class in `src/index.css` (nowrap, horizontal overflow, scrollbar hidden in every engine, vertical overflow hidden and touch-action left automatic) with each chip shrink-0, so pills never stack, no scroll indicator shows, thumb swipe and vertical page swiping from the row both still work, and the advanced-filters icon stays on the same line.
