const fs = require("fs");
const path = require("path");

const rootDir = "C:\\Users\\Asus\\food1";
const targetDir = path.join(rootDir, "client", "public", "images", "food");

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Find the image folder in root (could be named "ảnh" or unicode)
const entries = fs.readdirSync(rootDir, { withFileTypes: true });
const imgFolderEntry = entries.find(e => e.isDirectory() && (e.name.toLowerCase().includes("nh") || e.name.toLowerCase().includes("anh") || e.name.toLowerCase().includes("img")));

if (!imgFolderEntry) {
  console.error("❌ Could not find image folder in root");
  process.exit(1);
}

const sourceDir = path.join(rootDir, imgFolderEntry.name);
console.log(`📁 Source folder: ${sourceDir}`);
console.log(`🎯 Target folder: ${targetDir}`);

let copyCount = 0;

function copyRecursive(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      copyRecursive(fullPath);
    } else if (item.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
      const destFile = path.join(targetDir, item.name.toLowerCase());
      fs.copyFileSync(fullPath, destFile);
      copyCount++;
    }
  }
}

copyRecursive(sourceDir);
console.log(`✅ Successfully copied ${copyCount} food image files to client/public/images/food/!`);
