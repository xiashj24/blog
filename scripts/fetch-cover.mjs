#!/usr/bin/env node
// Usage:
//   node scripts/fetch-cover.mjs album  "Radiohead" "OK Computer"
//   node scripts/fetch-cover.mjs book   "The Three-Body Problem" ["Liu Cixin"]
//   node scripts/fetch-cover.mjs movie  "Inception" [year]        (requires TMDB_API_KEY)
//   node scripts/fetch-cover.mjs game   "Hollow Knight"

import { createWriteStream, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.join(__dirname, '..', 'src', 'content', 'media', 'covers');

function toSlug(...parts) {
  return parts.join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  await pipeline(res.body, createWriteStream(dest));
}

async function fetchAlbum(artist, album) {
  if (!album) throw new Error('album requires both artist and title.');
  const query = encodeURIComponent(`${artist} ${album}`);
  const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=album&limit=5`);
  const data = await res.json();
  if (!data.results?.length) throw new Error('No results found on iTunes.');
  const match = data.results.find((r) => r.collectionName?.toLowerCase() === album.toLowerCase()) ?? data.results[0];
  console.log(`Matched: ${match.artistName} — ${match.collectionName} (${match.releaseDate?.slice(0, 4)})`);
  const artworkUrl = match.artworkUrl100.replace('100x100bb', '600x600bb');
  const ext = artworkUrl.includes('.png') ? 'png' : 'jpg';
  return { url: artworkUrl, slug: toSlug(artist, album), ext };
}

async function fetchBook(title, author) {
  const q = encodeURIComponent(author ? `${title} ${author}` : title);
  const res = await fetch(`https://openlibrary.org/search.json?q=${q}&fields=title,author_name,cover_i&limit=5`);
  const data = await res.json();
  const match = (data.docs ?? []).find((r) => r.cover_i) ?? data.docs?.[0];
  if (!match) throw new Error('No results found on Open Library.');
  if (!match.cover_i) throw new Error('No cover image found on Open Library for this book.');
  console.log(`Matched: "${match.title}" by ${match.author_name?.[0] ?? 'unknown'}`);
  return {
    url: `https://covers.openlibrary.org/b/id/${match.cover_i}-L.jpg`,
    slug: toSlug(title),
    ext: 'jpg',
  };
}

async function fetchMovie(title, year) {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      'TMDB_API_KEY is not set.\n' +
      '  1. Get a free key at https://www.themoviedb.org/settings/api\n' +
      '  2. Set it: $env:TMDB_API_KEY="your_key"  (PowerShell)'
    );
  }
  const query = encodeURIComponent(title);
  const yearParam = year ? `&year=${year}` : '';
  const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${query}${yearParam}`);
  const data = await res.json();
  if (!data.results?.length) throw new Error('No results found on TMDB.');
  const match = data.results[0];
  console.log(`Matched: ${match.title} (${match.release_date?.slice(0, 4)})`);
  if (!match.poster_path) throw new Error('No poster found for this movie on TMDB.');
  return {
    url: `https://image.tmdb.org/t/p/w500${match.poster_path}`,
    slug: toSlug(title),
    ext: 'jpg',
  };
}

async function fetchGame(title) {
  const query = encodeURIComponent(title);
  const res = await fetch(`https://store.steampowered.com/api/storesearch/?term=${query}&l=en&cc=us`);
  const data = await res.json();
  const items = data.items ?? [];
  if (!items.length) throw new Error('No results found on Steam. Add the cover manually.');
  const match = items.find((i) => i.name.toLowerCase() === title.toLowerCase()) ?? items[0];
  console.log(`Matched: ${match.name} (Steam app ${match.id})`);
  const url = `https://cdn.akamai.steamstatic.com/steam/apps/${match.id}/library_600x900.jpg`;
  const check = await fetch(url, { method: 'HEAD' });
  if (!check.ok) {
    throw new Error(
      `Portrait cover not available for "${match.name}".\n` +
      `  Fallback header image: https://cdn.akamai.steamstatic.com/steam/apps/${match.id}/header.jpg\n` +
      `  Or add the cover manually.`
    );
  }
  return { url, slug: toSlug(title), ext: 'jpg' };
}

// --- main ---

const USAGE = `Usage:
  node scripts/fetch-cover.mjs album  "Artist"  "Album"
  node scripts/fetch-cover.mjs book   "Title"   ["Author"]
  node scripts/fetch-cover.mjs movie  "Title"   [year]     (requires TMDB_API_KEY)
  node scripts/fetch-cover.mjs game   "Title"`;

const [type, ...args] = process.argv.slice(2);

if (!type || !args[0]) {
  console.error(USAGE);
  process.exit(1);
}

let result;
try {
  if      (type === 'album') result = await fetchAlbum(args[0], args[1]);
  else if (type === 'book')  result = await fetchBook(args[0], args[1]);
  else if (type === 'movie') result = await fetchMovie(args[0], args[1]);
  else if (type === 'game')  result = await fetchGame(args[0]);
  else {
    console.error(`Unknown type "${type}". Must be: album, book, movie, game.\n\n${USAGE}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

mkdirSync(COVERS_DIR, { recursive: true });

const filename = `${result.slug}.${result.ext}`;
const dest = path.join(COVERS_DIR, filename);

console.log(`Downloading ${result.url}`);
try {
  await downloadTo(result.url, dest);
} catch (err) {
  console.error(`Failed to download: ${err.message}`);
  process.exit(1);
}

console.log(`\nSaved to: src/content/media/covers/${filename}`);
console.log(`\nAdd to frontmatter:\n  cover: ./covers/${filename}`);
