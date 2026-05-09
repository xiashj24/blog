Done:

Astro v6 blog scaffolded with your title ("Shijie Xia"), site URL (https://www.xiashj.com), and RSS feed
Svelte + Tailwind v4 integrated — ready for interactive components
Header/footer cleaned up (removed Astro placeholder links)
.github/workflows/deploy.yml — push to main → build → rsync to your server
Caddyfile — serves dist/ at www.xiashj.com, redirects bare domain to www

## Media Shelf (src/pages/media/, src/components/media/MediaShelf.svelte)

Content collection at src/content/media/ with Zod schema in src/content.config.ts.
Supported types: movie, book, game, album, live — differentiated by a `type` field in frontmatter.
Type-specific optional fields: author (book), director + year (movie), platform (game), artist + label (album), artist + venue (live).

Cover images live in src/content/media/covers/ and are referenced as `cover: ./covers/<filename>` in frontmatter.

scripts/fetch-cover.mjs — CLI to download cover art from the web:
  - album: iTunes Search API (no key)
  - book:  Open Library Covers API (no key)
  - movie: TMDB API (requires TMDB_API_KEY env var — free key at themoviedb.org)
  - game:  Steam store API (no key; falls back with a warning for non-Steam titles)
  Usage: node scripts/fetch-cover.mjs <type> "Title" ["Author/Artist"] [year]

MediaShelf sidebar filters:
  - By type (All / Movie / Book / Game / Album / Live)
  - By Tag — derived from items under the active type filter; clicking a card tag also sets it
  - By Time — clickable year labels + month buttons; year and month are mutually exclusive

global.css: base font-size moved to html (20px desktop, 18px mobile) so rem units scale uniformly.
  At ≥2560px (4K), font-size bumps to 25px (=125% of 20px). main width is 36rem (auto-scales).