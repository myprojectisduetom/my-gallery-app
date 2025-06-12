const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dwk1jl1bs",
  api_key: "991356141425782",
  api_secret: "Njx_gergxERIqkf6sF8Yk2THDZw",
});

function normalize(name) {
  return name
    .replace(/\.[^.]+$/, "")         // remove extension
    .replace(/[\s()]/g, "_")         // replace space and brackets
    .replace(/[^a-zA-Z0-9_]/g, "")   // remove special characters
    .toLowerCase();
}

async function fetchAssets(resource_type) {
  const allAssets = [];
  let nextCursor = undefined;

  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type,
      max_results: 500,
      next_cursor: nextCursor,
    });
    allAssets.push(...res.resources);
    nextCursor = res.next_cursor;
  } while (nextCursor);

  return allAssets;
}

(async () => {
  const missingPath = path.join(__dirname, "../public/data/missing_files.json");
  const missingFiles = JSON.parse(fs.readFileSync(missingPath, "utf-8"));

  const imageAssets = await fetchAssets("image");
  const videoAssets = await fetchAssets("video");

  const allAssets = [...imageAssets, ...videoAssets];

  const recoveredMap = {};
  const stillMissing = [];

  for (const item of missingFiles) {
    const normMissing = normalize(item.file);
    let matched = false;

    for (const asset of allAssets) {
      const normAsset = normalize(path.basename(asset.public_id));
      if (normAsset.startsWith(normMissing)) {
        const baseKey = item.file.replace(/\.[^.]+$/, ""); // remove .jpg or .mp4
        recoveredMap[baseKey] = asset.public_id;
        matched = true;
        break;
      }
    }

    if (!matched) {
      stillMissing.push(item);
    }
  }

  const outDir = path.join(__dirname, "../public/data");
  fs.writeFileSync(path.join(outDir, "recoveredPublicIdMap.json"), JSON.stringify(recoveredMap, null, 2));
  fs.writeFileSync(path.join(outDir, "still_missing_files.json"), JSON.stringify(stillMissing, null, 2));

  console.log(`✅ Recovered: ${Object.keys(recoveredMap).length}`);
  console.log(`❌ Still missing: ${stillMissing.length}`);
})();
