const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dwk1jl1bs",
  api_key: "991356141425782",
  api_secret: "Njx_gergxERIqkf6sF8Yk2THDZw",
});

function sanitizeFileName(name) {
  if (typeof name !== "string") return "";
  return name
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

async function fetchAssets(resource_type) {
  const allAssets = [];
  let nextCursor = undefined;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type,
      max_results: 500,
      next_cursor: nextCursor,
    });

    allAssets.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return allAssets;
}

(async () => {
  console.log("⏳ Fetching Cloudinary assets...");

  const [photoAssets, videoAssets] = await Promise.all([
    fetchAssets("image"),
    fetchAssets("video"),
  ]);

  const assetMap = {};
  for (const asset of [...photoAssets, ...videoAssets]) {
    const baseName = path.basename(asset.public_id).toLowerCase();
    assetMap[baseName] = {
      url: asset.secure_url,
      type: asset.resource_type,
    };
  }

  const metadataPath = path.join(__dirname, "../public/data/metadata.json");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

  const publicIdMap = {};
  const missingFiles = [];

  for (const entry of metadata) {
    const file = entry.fileName || entry.file || "";
    const type = entry.type_of_implementation?.toLowerCase() || "unknown";

    const baseName = sanitizeFileName(file.replace(/\.(jpg|png|mp4)$/i, ""));
    const match = assetMap[baseName];

    if (match) {
      publicIdMap[entry.KEF_ID] = path.basename(match.url).split(".")[0];
    } else {
      missingFiles.push({ file: file, type: type });
    }
  }

  const outputDir = path.join(__dirname, "../public/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "publicIdMap.json"),
    JSON.stringify(publicIdMap, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, "missing_files.json"),
    JSON.stringify(missingFiles, null, 2)
  );

  const photoCount = Object.values(publicIdMap).filter((_, key) =>
    metadata[key]?.type_of_implementation?.toLowerCase().includes("photo")
  ).length;

  const videoCount = Object.values(publicIdMap).filter((_, key) =>
    metadata[key]?.type_of_implementation?.toLowerCase().includes("video")
  ).length;

  console.log(`✅ Done! Photos: ${photoCount}, Videos: ${videoCount}, Missing: ${missingFiles.length}`);
})();
