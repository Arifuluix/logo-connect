import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.resolve('assets');
const OUTPUT_FILE = path.resolve('assets/index.json');

const results = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    }

    if (entry.isFile() && entry.name === 'data.json') {
      processDataFile(fullPath);
    }
  }
}

function processDataFile(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const baseDir = path.dirname(filePath);

  const normalized = {
    id: raw.id,
    name: raw.name,
    category: raw.category || 'uncategorized',
    brand: raw.brand || null,
    tags: raw.tags || [],
    assets: {}
  };

  if (raw.assets) {
    for (const [key, value] of Object.entries(raw.assets)) {
      normalized.assets[key] = path
        .join(baseDir, value)
        .replace(/\\/g, '/');
    }
  }

  if (raw.filename && !normalized.assets.mark) {
    normalized.assets.mark = raw.filename;
  }

  results.push(normalized);
}

walk(ASSETS_DIR);

results.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(
    {
      version: new Date().toISOString(),
      items: results
    },
    null,
    2
  )
);

console.log(`index.json generated with ${results.length} logos`);
