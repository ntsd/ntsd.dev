import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASELINE_PATH = path.resolve(process.cwd(), 'routes-baseline.json');

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`[verify-parity] ERROR: dist directory not found at ${DIST_DIR}. Did you run build?`);
    process.exit(1);
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`[verify-parity] ERROR: routes-baseline.json not found at ${BASELINE_PATH}.`);
    process.exit(1);
  }

  const baselineRoutes = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  console.log(`[verify-parity] Auditing ${baselineRoutes.length} canonical routes from routes-baseline.json against dist/...`);

  let missingCount = 0;
  let canonicalMismatchCount = 0;
  const missingRoutes = [];

  for (const route of baselineRoutes) {
    let expectedFile = '';

    if (route.endsWith('/')) {
      // Directory style route: e.g. /about/ -> dist/about/index.html
      const relPath = route.replace(/^\//, '');
      expectedFile = path.join(DIST_DIR, relPath, 'index.html');
    } else {
      // File route: e.g. /feed.xml -> dist/feed.xml or /robots.txt -> dist/robots.txt
      const relPath = route.replace(/^\//, '');
      expectedFile = path.join(DIST_DIR, relPath);
    }

    if (!fs.existsSync(expectedFile)) {
      missingCount++;
      missingRoutes.push({ route, expectedFile });
      console.error(`  [FAIL] Missing target: ${route} (Expected: ${expectedFile})`);
    } else {
      // Verify canonical link and og:url inside HTML files
      if (expectedFile.endsWith('.html') && route !== '/404/') {
        const html = fs.readFileSync(expectedFile, 'utf8');
        const expectedCanonical = `https://ntsd.dev${route}`;

        const canonicalRegex = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i;
        const ogUrlRegex = /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i;

        const canonicalMatch = html.match(canonicalRegex);
        const ogUrlMatch = html.match(ogUrlRegex);

        if (!canonicalMatch) {
          console.warn(`  [WARN] Missing canonical link in ${route}`);
        } else if (canonicalMatch[1] !== expectedCanonical) {
          console.error(`  [FAIL] Canonical mismatch in ${route}: Expected "${expectedCanonical}", got "${canonicalMatch[1]}"`);
          canonicalMismatchCount++;
        }

        if (!ogUrlMatch) {
          console.warn(`  [WARN] Missing og:url in ${route}`);
        } else if (ogUrlMatch[1] !== expectedCanonical) {
          console.error(`  [FAIL] og:url mismatch in ${route}: Expected "${expectedCanonical}", got "${ogUrlMatch[1]}"`);
          canonicalMismatchCount++;
        }
      }
      console.log(`  [OK] ${route}`);
    }
  }

  // Audit DOM anchor IDs in /tags/ and /categories/
  const tagsHtmlPath = path.join(DIST_DIR, 'tags', 'index.html');
  if (fs.existsSync(tagsHtmlPath)) {
    const tagsHtml = fs.readFileSync(tagsHtmlPath, 'utf8');
    const commonTags = ['Programming', 'Database', 'Python', 'TypeScript', 'Node.js'];
    for (const tag of commonTags) {
      if (!tagsHtml.includes(`id="${tag}"`) && !tagsHtml.includes(`id='${tag}'`)) {
        console.warn(`  [WARN] Expected tag anchor id="${tag}" not found in /tags/`);
      }
    }
  }

  const catHtmlPath = path.join(DIST_DIR, 'categories', 'index.html');
  if (fs.existsSync(catHtmlPath)) {
    const catHtml = fs.readFileSync(catHtmlPath, 'utf8');
    const commonCats = ['Software Development'];
    for (const cat of commonCats) {
      if (!catHtml.includes(`id="${cat}"`) && !catHtml.includes(`id='${cat}'`)) {
        console.warn(`  [WARN] Expected category anchor id="${cat}" not found in /categories/`);
      }
    }
  }

  console.log('\n--- Parity Verification Summary ---');
  console.log(`Total canonical routes audited: ${baselineRoutes.length}`);
  console.log(`Missing routes: ${missingCount}`);
  console.log(`Canonical/og:url mismatches: ${canonicalMismatchCount}`);

  if (missingCount > 0 || canonicalMismatchCount > 0) {
    console.error('\n[verify-parity] Verification FAILED.');
    process.exit(1);
  }

  console.log('\n[verify-parity] 100% PARITY VERIFICATION PASSED SUCCESSFULLY!\n');
}

main();
