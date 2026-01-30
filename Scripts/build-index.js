import fs from "fs";
import path from "path";

const ASSETS_DIR = "assets";
const OUTPUT = path.join(ASSETS_DIR, "index.json");

let items = [];
let ids = new Set();

for (const folder of fs.readdirSync(ASSETS_DIR)) {
    const dataFile = path.join(ASSETS_DIR, folder, "data.json");
    if (!fs.existsSync(dataFile)) continue;

    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    for (const item of data.items) {
        if (ids.has(item.id)) {
            throw new Error(`Duplicate id: ${item.id}`);
        }
        ids.add(item.id);

        items.push({
            ...item,
            category: data.category
        });
    }
}

const index = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    items
};

fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));
console.log("✅ index.json generated");
