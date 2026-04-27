#!/usr/bin/env node
// Convert legacy .html pages into Astro pages backed by BaseLayout.
//
// Strategy: extract <head> meta (title, description, canonical, OG, JSON-LD,
// page-specific <style> blocks, page-specific <link rel="stylesheet">) and the
// inner content of <main> (or <body> minus header/footer/widgets if no <main>).
// Emit src/pages/<path>.astro that uses BaseLayout with the extracted props.
//
// Usage:  node scripts/html-to-astro.mjs <input.html> <output.astro>
// Bulk:   node scripts/html-to-astro.mjs --all
//
// The script is intentionally conservative — it leaves the body content as raw
// HTML rendered via <Fragment set:html={...}>. This ships pixel-identical output
// while keeping the door open for incremental refactor into native Astro
// components.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// HTML scrubbers — regex-based because the source HTML is hand-written and
// well-behaved (no nested <head> trickery, etc.). Cheerio would be cleaner but
// adds a dependency.
// ----------------------------------------------------------------------------

function extract(html, regex, group = 1) {
  const m = html.match(regex);
  return m ? m[group] : null;
}

function escapeForAstroAttr(str) {
  if (str == null) return '';
  return str.replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

function escapeForAstroSetHtml(str) {
  if (str == null) return '';
  // Inside `set:html={`...`}` we use a backtick-delimited string. Escape backticks
  // and template literal interpolations.
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

function parsePage(html, srcPath) {
  // Title
  const title = extract(html, /<title[^>]*>([^<]+)<\/title>/i)?.trim() ?? '';

  // Meta description
  const description = extract(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ?? '';

  // Canonical
  const canonical = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) ?? null;

  // Robots noindex check
  const robots = extract(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i) ?? '';
  const noIndex = /noindex/i.test(robots);

  // OG image
  const ogImage = extract(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ?? null;
  const ogTitle = extract(html, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ?? null;
  const ogDescription = extract(html, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ?? null;

  // JSON-LD blocks
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const jsonLd = jsonLdMatches.map(m => m[1].trim()).filter(Boolean);

  // Page-specific <style> blocks (exclude inline critical loader CSS — that's in BaseLayout)
  const styleMatches = [...html.matchAll(/<style(?:\s+[^>]*)?>([\s\S]*?)<\/style>/gi)];
  const pageStyles = styleMatches
    .map(m => m[1])
    .filter(css => !/sw-loader|sw-q\d|sw-bar|sw-text|sw-border|sw-line/.test(css))
    .join('\n\n');

  // Page-specific <link rel="stylesheet"> beyond shared/home + Google Fonts + FA + devicons
  const linkMatches = [...html.matchAll(/<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi)];
  const extraStylesheets = linkMatches
    .map(m => m[0])
    .filter(tag =>
      !/shared\.min\.css|home\.min\.css|fonts\.googleapis|font-awesome|devicon|cloudflare\.com/.test(tag)
    );

  // Body content — prefer <main>, fall back to <body> minus header/footer/widgets
  let body = '';
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    body = mainMatch[1];
  } else {
    // Get everything inside <body>
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    body = bodyMatch ? bodyMatch[1] : html;
    // Strip header / nav / footer / floating widgets / scripts / loader etc.
    body = body
      .replace(/<header[^>]*id=["']site-header["'][\s\S]*?<\/header>/i, '')
      .replace(/<header[^>]*class=["']pnav["'][\s\S]*?<\/header>/i, '')
      .replace(/<div[^>]*id=["']swh-mob["'][\s\S]*?<\/div>\s*(?=<main|<section|<footer)/i, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<div[^>]*class=["']sw-loader["'][\s\S]*?<\/div>\s*<\/div>/i, '')
      .replace(/<div[^>]*id=["']progress-bar["'][^/]*\/?>(<\/div>)?/i, '')
      .replace(/<a[^>]*id=["']wa-btn["'][\s\S]*?<\/a>/i, '')
      .replace(/<div[^>]*id=["']wa-tooltip["'][\s\S]*?<\/div>/i, '')
      .replace(/<button[^>]*id=["']btt["'][\s\S]*?<\/button>/i, '')
      .replace(/<div[^>]*id=["']cookie["'][\s\S]*?<\/div>/i, '')
      .replace(/<div[^>]*class=["']pol-overlay["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '')
      .replace(/<a[^>]*class=["']skip-link["'][\s\S]*?<\/a>/i, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .trim();
  }

  // Rewrite asset paths: relative href="assets/foo" → href="/assets/foo".
  // Skip already-absolute, scheme-prefixed, hash, and dot-relative paths
  // (./foo, ../foo) — prefixing those produced literal /./foo and /../foo
  // in earlier runs.
  body = body.replace(/(\s(?:href|src)=["'])(?!\/|https?:|mailto:|tel:|#|data:|\.\.?\/)/g, '$1/');

  return {
    title,
    description,
    canonical,
    noIndex,
    ogImage,
    ogTitle,
    ogDescription,
    jsonLd,
    pageStyles,
    extraStylesheets,
    body,
  };
}

function buildAstro(page, srcPath) {
  const {
    title,
    description,
    canonical,
    noIndex,
    ogImage,
    ogTitle,
    ogDescription,
    jsonLd,
    pageStyles,
    extraStylesheets,
    body,
  } = page;

  // ----- Frontmatter -----
  const props = [];
  props.push(`const title = ${JSON.stringify(title)};`);
  props.push(`const description = ${JSON.stringify(description)};`);
  if (canonical) props.push(`const canonical = ${JSON.stringify(canonical)};`);
  if (noIndex) props.push(`const noIndex = true;`);
  if (ogImage) props.push(`const ogImage = ${JSON.stringify(ogImage)};`);
  if (ogTitle) props.push(`const ogTitle = ${JSON.stringify(ogTitle)};`);
  if (ogDescription) props.push(`const ogDescription = ${JSON.stringify(ogDescription)};`);
  if (jsonLd.length) {
    const parsed = jsonLd.map(s => {
      try { return JSON.parse(s); } catch { return null; }
    }).filter(Boolean);
    if (parsed.length) props.push(`const jsonLd = ${JSON.stringify(parsed, null, 2)};`);
  }

  // ----- Layout invocation -----
  const layoutProps = [
    `title={title}`,
    `description={description}`,
  ];
  if (canonical) layoutProps.push(`canonical={canonical}`);
  if (ogImage) layoutProps.push(`ogImage={ogImage}`);
  if (ogTitle) layoutProps.push(`ogTitle={ogTitle}`);
  if (ogDescription) layoutProps.push(`ogDescription={ogDescription}`);
  if (jsonLd.length && (() => { try { return jsonLd.every(s => JSON.parse(s)); } catch { return false; } })()) {
    layoutProps.push(`jsonLd={jsonLd}`);
  }
  if (noIndex) layoutProps.push(`noIndex`);

  // ----- Body chunks -----
  const chunks = [];
  if (extraStylesheets.length) {
    chunks.push(`  <Fragment slot="head-css" set:html={\`${escapeForAstroSetHtml(extraStylesheets.join('\n'))}\`} />`);
  }
  if (pageStyles.trim()) {
    chunks.push(`  <style is:global slot="head-css" set:html={\`${escapeForAstroSetHtml(pageStyles)}\`}></style>`);
  }
  chunks.push(`  <Fragment set:html={\`${escapeForAstroSetHtml(body)}\`} />`);

  // ----- Assemble -----
  return `---
import BaseLayout from '${(() => {
  let rel = path.relative(path.dirname(srcPath), path.join(ROOT, 'src/layouts/BaseLayout.astro'));
  rel = rel.split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
})()}';

${props.join('\n')}
---

<BaseLayout ${layoutProps.join(' ')}>
${chunks.join('\n')}
</BaseLayout>
`;
}

function htmlToAstroPath(htmlPath) {
  // index.html → index.astro
  // about.html → about.astro
  // products/crm-software.html → products/crm-software.astro
  // blog/foo.html → blog/foo.astro (blog handled separately as collection — skip)
  const rel = path.relative(ROOT, htmlPath).split(path.sep).join('/');
  // Skip 404 (already handled by hand) + node_modules. Blog posts are migrated as
  // .astro pages for now — converting to a content collection is a future cleanup.
  if (rel === '404.html' || rel.includes('node_modules')) return null;
  // Output path
  const astroRel = rel.replace(/\.html$/, '.astro');
  return path.join(ROOT, 'src/pages', astroRel);
}

function convertOne(htmlPath, astroPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const page = parsePage(html, htmlPath);
  const astro = buildAstro(page, astroPath);
  fs.mkdirSync(path.dirname(astroPath), { recursive: true });
  fs.writeFileSync(astroPath, astro);
}

function findHtmlPages(root) {
  const out = [];
  function walk(dir) {
    if (path.basename(dir) === 'node_modules' || path.basename(dir).startsWith('.')) return;
    if (path.basename(dir) === 'public' || path.basename(dir) === 'dist' || path.basename(dir) === 'src') return;
    if (path.basename(dir) === 'screenshots' || path.basename(dir) === 'keyword-research') return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) out.push(p);
    }
  }
  walk(root);
  return out;
}

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.includes('--all')) {
  const pages = findHtmlPages(ROOT);
  let count = 0;
  for (const html of pages) {
    const astro = htmlToAstroPath(html);
    if (!astro) continue;
    convertOne(html, astro);
    console.log(`✓ ${path.relative(ROOT, html)} → ${path.relative(ROOT, astro)}`);
    count++;
  }
  console.log(`\nConverted ${count} pages.`);
} else if (args.length === 2) {
  convertOne(path.resolve(args[0]), path.resolve(args[1]));
  console.log('Done.');
} else {
  console.error('Usage:\n  node scripts/html-to-astro.mjs <input.html> <output.astro>\n  node scripts/html-to-astro.mjs --all');
  process.exit(1);
}
