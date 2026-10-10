require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("./config/cloudinary");
const { Shop, Product, Banner } = require("./models");

const localImgDir = path.join(__dirname, "..", "client", "public", "images", "food");

async function runUpload() {
  console.log("☁️  Connecting to Cloudinary & MongoDB Atlas...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB Atlas Connected!\n");

  const files = fs.readdirSync(localImgDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`📁 Found ${files.length} local image files to upload to Cloudinary...\n`);

  const urlMap = {};
  let count = 0;

  for (const file of files) {
    const filePath = path.join(localImgDir, file);
    const fileNameWithoutExt = path.parse(file).name;

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "food_delivery/products",
        public_id: fileNameWithoutExt,
        overwrite: true,
      });

      const localPath = `/images/food/${file.toLowerCase()}`;
      urlMap[localPath] = result.secure_url;
      count++;
      console.log(`  [${count}/${files.length}] Uploaded ${file} ➔ ${result.secure_url}`);
    } catch (err) {
      console.error(`❌ Failed to upload ${file}:`, err.message);
    }
  }

  console.log("\n🔄 Updating Product & Shop URLs in MongoDB Atlas...");
  const products = await Product.find({});
  for (const prod of products) {
    if (prod.image_url && urlMap[prod.image_url.toLowerCase()]) {
      prod.image_url = urlMap[prod.image_url.toLowerCase()];
      await prod.save();
    }
  }

  const shops = await Shop.find({});
  for (const shop of shops) {
    if (shop.logo_url && urlMap[shop.logo_url.toLowerCase()]) {
      shop.logo_url = urlMap[shop.logo_url.toLowerCase()];
    }
    if (shop.cover_url && urlMap[shop.cover_url.toLowerCase()]) {
      shop.cover_url = urlMap[shop.cover_url.toLowerCase()];
    }
    await shop.save();
  }

  const banners = await Banner.find({});
  for (const banner of banners) {
    if (banner.image_url && urlMap[banner.image_url.toLowerCase()]) {
      banner.image_url = urlMap[banner.image_url.toLowerCase()];
      await banner.save();
    }
  }

  console.log("=======================================================");
  console.log(`✅ COMPLETE! All ${count} images uploaded to Cloudinary.`);
  console.log("✅ All product, shop & banner URLs in MongoDB Atlas updated to Cloudinary HTTPS links!");
  console.log("=======================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

runUpload().catch(err => {
  console.error("❌ Upload script failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
