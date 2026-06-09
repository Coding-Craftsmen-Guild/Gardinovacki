#!/usr/bin/env node
/*
 * Verifies site/ structure: file counts, JSON validity,
 * component coverage, content spot-checks, no-spam, live-link sanity.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_ROOT = path.resolve(__dirname, '..');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

const results = { ok: [], fail: [] };
function check(name, cond, detail = '') {
  (cond ? results.ok : results.fail).push({ name, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

// 1. File counts
const componentFiles = fs.readdirSync(path.join(SITE_ROOT, 'components')).filter(f => f.endsWith('.json'));
const pageFiles = walk(path.join(SITE_ROOT, 'pages')).filter(f => f.endsWith('.json'));
check('11 component spec files', componentFiles.length === 11, `found ${componentFiles.length}`);
check('23 page files', pageFiles.length === 23, `found ${pageFiles.length}`);
check('sitemap.json exists', fs.existsSync(path.join(SITE_ROOT, 'sitemap.json')));
check('globals.json exists', fs.existsSync(path.join(SITE_ROOT, 'globals.json')));
check('README.md exists', fs.existsSync(path.join(SITE_ROOT, 'README.md')));

// 2. JSON validity (all .json files under site/)
const allJson = walk(SITE_ROOT).filter(f => f.endsWith('.json'));
let parseErrors = 0;
for (const f of allJson) { try { readJson(f); } catch (e) { parseErrors++; console.log(`  PARSE ERR ${path.relative(SITE_ROOT, f)}: ${e.message}`); } }
check(`every JSON file parses (${allJson.length} files)`, parseErrors === 0, `${parseErrors} parse error(s)`);

// 3. Component coverage
const componentTypes = new Set(componentFiles.map(f => readJson(path.join(SITE_ROOT, 'components', f)).componentType));
const globalsObj = readJson(path.join(SITE_ROOT, 'globals.json'));
const globalKeys = Object.keys(globalsObj).filter(k => k !== 'description');
let missingComponent = 0;
let missingGlobal = 0;
for (const f of pageFiles) {
  const page = readJson(f);
  for (const sec of page.sections || []) {
    if (!componentTypes.has(sec.component)) {
      missingComponent++;
      console.log(`  ${path.relative(SITE_ROOT, f)}: unknown component "${sec.component}"`);
    }
  }
  for (const g of page.globalSections || []) {
    if (!globalKeys.includes(g)) {
      missingGlobal++;
      console.log(`  ${path.relative(SITE_ROOT, f)}: unknown globalSection "${g}"`);
    }
  }
}
check('all page sections reference known components', missingComponent === 0, `${missingComponent} unknown`);
check('all globalSections reference known globals keys', missingGlobal === 0, `${missingGlobal} unknown`);

// 4. Sitemap coverage
const sitemap = readJson(path.join(SITE_ROOT, 'sitemap.json'));
check('sitemap.json lists every page', sitemap.totalPages === pageFiles.length, `sitemap.totalPages=${sitemap.totalPages}, page files=${pageFiles.length}`);

// 5. Content spot-checks
const home = readJson(path.join(SITE_ROOT, 'pages', 'home.json'));
const heroSlides = home.sections.find(s => s.component === 'carousel-hero-banner').props.slides;
check('home.json hero has 5 slideshow slides', heroSlides.length === 5);
check('home.json hero slides include IMG_4880', heroSlides.some(s => s.image.includes('IMG_4880')));

const family = readJson(path.join(SITE_ROOT, 'pages', 'paketi', 'family.json'));
const familyNumbers = family.sections.find(s => s.component === 'numbers').props.items;
check('paketi/family has 6 numbered features', familyNumbers.length === 6);
check('paketi/family includes "Izrada 3 foto knjige"', familyNumbers.some(i => i.label.includes('3 foto knjige')));

const tijana = readJson(path.join(SITE_ROOT, 'pages', 'galerija', 'tijana-luka.json'));
const tijanaImages = tijana.sections.find(s => s.component === 'media-gallery').props.items;
check('galerija/tijana-luka has at least 10 images', tijanaImages.length >= 10);
check('galerija/tijana-luka images point at gardinovacki.com', tijanaImages.every(i => i.src.startsWith('https://gardinovacki.com/wp-content/uploads/')));

const about = readJson(path.join(SITE_ROOT, 'pages', 'o-meni.json'));
const aboutBody = about.sections.find(s => s.component === 'intro-text').props.body.join(' ');
check('o-meni body includes the "prvi put" quote', aboutBody.includes('prvi put'));

// 6. No spam carryover
const allText = allJson.map(f => fs.readFileSync(f, 'utf8')).join('\n');
check('no "ladys.one" anywhere in site/', !/ladys\.one/i.test(allText));

// 7. Live link HEAD check (3 random image URLs)
function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}
const allUrls = new Set();
const URL_RE = /https:\/\/gardinovacki\.com\/wp-content\/uploads\/[^"'\s)]+/g;
for (const f of allJson) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.match(URL_RE) || []) allUrls.add(m);
}
const samples = pickRandom([...allUrls], 3);

function headCheck(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'GardinovackiRebuildVerifier/1.0' } }, res => {
      resolve({ url, status: res.statusCode });
      res.resume();
    });
    req.on('error', err => resolve({ url, status: 0, error: err.message }));
    req.end();
  });
}

(async () => {
  console.log(`\nLive HEAD checks on ${samples.length} sample image URLs:`);
  for (const u of samples) {
    const r = await headCheck(u);
    check(`200 OK for ${u.replace('https://gardinovacki.com', '...')}`, r.status === 200, r.error ? `error: ${r.error}` : `status ${r.status}`);
  }

  console.log(`\n${results.ok.length} checks passed, ${results.fail.length} failed.`);
  if (results.fail.length) process.exit(1);
})();
