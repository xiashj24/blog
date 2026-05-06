#!/usr/bin/env node
// Creates a new media entry: fetches cover, populates frontmatter, writes the .md file.
// Usage:
//   node scripts/new-media.mjs album  "Radiohead" "OK Computer"
//   node scripts/new-media.mjs book   "The Three-Body Problem" ["Liu Cixin"]
//   node scripts/new-media.mjs movie  "Inception" [year]
//   node scripts/new-media.mjs game   "Hollow Knight"

import { fetchAlbum, fetchBook, fetchMovie, fetchGame, downloadTo, COVERS_DIR, toSlug } from './fetch-cover.mjs';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = path.join(__dirname, '..', 'src', 'content', 'media');
const today = new Date().toISOString().slice(0, 10);

const USAGE = `Usage:
  node scripts/new-media.mjs album  "Artist"  "Album"
  node scripts/new-media.mjs book   "Title"   ["Author"]
  node scripts/new-media.mjs movie  "Title"   [year]
  node scripts/new-media.mjs game   "Title"`;

const [type, ...args] = process.argv.slice(2);
if (!type || !args[0]) { console.error(USAGE); process.exit(1); }

// Resolve title, slug, and type-specific frontmatter fields
let title, slug, extraLines;
if (type === 'album') {
  const [artist, album] = args;
  if (!album) { console.error('album requires artist and album name.\n\n' + USAGE); process.exit(1); }
  title = album;
  slug = toSlug(artist, album);
  extraLines = (year) => [`artist: '${artist}'`, `year: ${year ?? 0}`];
} else if (type === 'book') {
  title = args[0];
  slug = toSlug(title);
  extraLines = () => [`author: '${args[1] ?? ''}'`];
} else if (type === 'movie') {
  title = args[0];
  slug = toSlug(title);
  extraLines = (year, director) => [`director: '${director ?? ''}'`, `year: ${year ?? (args[1] ? parseInt(args[1]) : 0)}`];
} else if (type === 'game') {
  title = args[0];
  slug = toSlug(title);
  extraLines = () => [`platform: ''`, `year: 0`];
} else {
  console.error(`Unknown type "${type}". Must be: album, book, movie, game.\n\n${USAGE}`);
  process.exit(1);
}

// Fetch cover
let coverLine = `# cover: ./covers/  ← add manually`;
try {
  let result;
  if      (type === 'album') result = await fetchAlbum(args[0], args[1]);
  else if (type === 'book')  result = await fetchBook(args[0], args[1]);
  else if (type === 'movie') result = await fetchMovie(args[0], args[1]);
  else if (type === 'game')  result = await fetchGame(args[0]);

  mkdirSync(COVERS_DIR, { recursive: true });
  const filename = `${result.slug}.${result.ext}`;
  const dest = path.join(COVERS_DIR, filename);
  process.stdout.write('Downloading cover... ');
  await downloadTo(result.url, dest);
  console.log('done.');
  coverLine = `cover: ./covers/${filename}`;

  // use year and director from API if available
  if (type === 'album' || type === 'movie') {
    extraLines = ((orig) => () => orig(result.year, result.director))(extraLines);
  }
} catch (err) {
  console.warn(`Warning: could not fetch cover — ${err.message}`);
}

// Write .md file
const destFile = path.join(MEDIA_DIR, `${slug}.md`);
if (existsSync(destFile)) {
  console.error(`File already exists: src/content/media/${slug}.md`);
  process.exit(1);
}

const frontmatter = [
  '---',
  `title: '${title}'`,
  `type: '${type}'`,
  `status: 'completed'`,
  `date: '${today}'`,
  coverLine,
  ...extraLines(),
  `tags: []`,
  '---',
  '',
].join('\n');

writeFileSync(destFile, frontmatter);
console.log(`\nCreated: src/content/media/${slug}.md`);
