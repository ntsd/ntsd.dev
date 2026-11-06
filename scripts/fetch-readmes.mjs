import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const CACHE_DIR = path.resolve(process.cwd(), '.cache/readmes');

async function main() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // Load projects from YAML sources
  const featuredPath = path.resolve(process.cwd(), '_data/featured-projects.yaml');
  const regularPath = path.resolve(process.cwd(), '_data/projects.yaml');
  const jsonCatalogPath = path.resolve(process.cwd(), 'src/content/projects/projects.json');

  let allProjects = [];

  if (fs.existsSync(featuredPath) && fs.existsSync(regularPath)) {
    const featured = yaml.load(fs.readFileSync(featuredPath, 'utf8')) || [];
    const regular = yaml.load(fs.readFileSync(regularPath, 'utf8')) || [];

    // Tag featured projects with featured: true
    const featuredWithFlag = featured.map((p) => ({
      ...p,
      featured: true,
      tags: Array.isArray(p.tags) ? (p.tags.includes('Featured') ? p.tags : [...p.tags, 'Featured']) : ['Featured']
    }));

    const regularWithFlag = regular.map((p) => ({
      ...p,
      featured: false,
      tags: Array.isArray(p.tags) ? p.tags : []
    }));

    allProjects = [...featuredWithFlag, ...regularWithFlag];

    // Ensure output directory src/content/projects exists and write projects.json
    const projectsDir = path.dirname(jsonCatalogPath);
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }
    fs.writeFileSync(jsonCatalogPath, JSON.stringify(allProjects, null, 2), 'utf8');
    console.log(`[fetch-readmes] Written ${allProjects.length} projects to ${jsonCatalogPath}`);
  } else if (fs.existsSync(jsonCatalogPath)) {
    allProjects = JSON.parse(fs.readFileSync(jsonCatalogPath, 'utf8'));
  } else {
    throw new Error('No project data files found in _data/ or src/content/projects/');
  }

  const headers = {
    'User-Agent': 'ntsd-dev-astro-build'
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  for (const project of allProjects) {
    const cacheFile = path.join(CACHE_DIR, `${project.id}.md`);

    if (!project.readme) {
      if (!fs.existsSync(cacheFile)) {
        const fallbackContent = `# ${project.name}\n\n${project.description || ''}\n\n${project.web ? `[Visit Website](${project.web})` : ''}\n`;
        fs.writeFileSync(cacheFile, fallbackContent, 'utf8');
      }
      continue;
    }

    try {
      console.log(`[fetch-readmes] Fetching ${project.readme} ...`);
      const response = await fetch(project.readme, { headers });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      fs.writeFileSync(cacheFile, text, 'utf8');
      console.log(`[fetch-readmes] Cached README for ${project.id}`);
    } catch (err) {
      if (fs.existsSync(cacheFile)) {
        console.warn(`[fetch-readmes] Fetch failed for ${project.id}, using existing cached copy: ${err.message}`);
      } else {
        console.warn(`[fetch-readmes] Fetch failed for ${project.id} with no cache; generating fallback: ${err.message}`);
        const fallbackContent = `# ${project.name}\n\n${project.description || ''}\n\n${project.web ? `[Visit Website](${project.web})` : ''}\n`;
        fs.writeFileSync(cacheFile, fallbackContent, 'utf8');
      }
    }
  }

  console.log('[fetch-readmes] Successfully fetched and cached all READMEs.');
}

main().catch((err) => {
  console.error('[fetch-readmes] Fatal error:', err);
  process.exit(1);
});

