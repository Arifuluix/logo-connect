import fs from "fs";
import path from "path";

const ASSETS_DIR = "assets";

const categories = fs
  .readdirSync(ASSETS_DIR)
  .filter(folder =>
    fs.existsSync(path.join(ASSETS_DIR, folder, "data.json"))
  );

let items = [];
let ids = new Set();

for (const categoryFolder of categories) {
  const filePath = path.join(ASSETS_DIR, categoryFolder, "data.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  data.items.forEach(item => {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate id found: ${item.id}`);
    }
    ids.add(item.id);

    items.push({
      ...item,
      category: data.category
    });
  });
}

const index = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  items
};

fs.writeFileSync(
  path.join(ASSETS_DIR, "index.json"),
  JSON.stringify(index, null, 2)
);

console.log("✅ index.json generated successfully");
