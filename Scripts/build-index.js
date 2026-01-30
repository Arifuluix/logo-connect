import fs from "fs";
import path from "path";
import crypto from "crypto";

const ASSETS_DIR = "assets";
const OUTPUT = path.join(ASSETS_DIR, "index.json");

function findDataFiles(dir, results = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            findDataFiles(fullPath, results);
        } else if (entry.isFile() && entry.name === "data.json") {
            results.push(fullPath);
        }
    }

    return results;
}

function normalizeAssets(item, dataDir) {
    const assets = {};

    if (item.assets) {
        for (const [key, value] of Object.entries(item.assets)) {
            assets[key] = path.join(dataDir, value).replace(/\\/g, "/");
        }
    } else if (item.filename) {
        assets.mark = item.filename;
    }

    return assets;
}

const dataFiles = findDataFiles(ASSETS_DIR);
const items = [];
const ids = new Set();

for (const dataFile of dataFiles) {
    const dataDir = path.dirname(dataFile);
    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
            if (ids.has(item.id)) {
                throw new Error(`Duplicate id: ${item.id}`);
            }
            ids.add(item.id);

            const normalized = {
                id: item.id,
                name: item.name,
                category: data.category,
                tags: item.tags || [],
                assets: normalizeAssets(item, dataDir)
            };

            if (item.brand) {
                normalized.brand = item.brand;
            }

            items.push(normalized);
        }
    } else {
        if (ids.has(data.id)) {
            throw new Error(`Duplicate id: ${data.id}`);
        }
        ids.add(data.id);

        const normalized = {
            id: data.id,
            name: data.name,
            category: data.category,
            tags: data.tags || [],
            assets: normalizeAssets(data, dataDir)
        };

        if (data.brand) {
            normalized.brand = data.brand;
        }

        items.push(normalized);
    }
}

items.sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    return a.id.localeCompare(b.id);
});

const contentString = JSON.stringify(items);
const hash = crypto.createHash("sha256").update(contentString).digest("hex").substring(0, 8);

const index = {
    version: hash,
    items
};

fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));
console.log(`✅ index.json generated with ${items.length} logos (version: ${hash})`);
