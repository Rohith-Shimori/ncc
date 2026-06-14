const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('[Compressor] Starting asset compression...');

  const publicDir = path.join(__dirname, 'public');
  const assetsDir = path.join(__dirname, 'src/assets');

  // 1. Process PWA Icons
  const sourceIconPath = path.join(publicDir, 'ncc-logo.png');
  
  if (fs.existsSync(sourceIconPath)) {
    console.log('[Compressor] Compressing PWA Icons from ncc-logo.png...');
    try {
      const icon = await Jimp.read(sourceIconPath);
      
      // Save 32x32 Favicon
      const icon32 = icon.clone().resize({ w: 32, h: 32 });
      await icon32.write(path.join(publicDir, 'favicon.png'));
      console.log('  - Generated public/favicon.png (32x32)');

      // Save 192x192 PWA Icon
      const icon192 = icon.clone().resize({ w: 192, h: 192 });
      await icon192.write(path.join(publicDir, 'ncc-logo-192.png'));
      console.log('  - Generated public/ncc-logo-192.png (192x192)');

      // Save 512x512 PWA Icon
      const icon512 = icon.clone().resize({ w: 512, h: 512 });
      await icon512.write(path.join(publicDir, 'ncc-logo-512.png'));
      console.log('  - Generated public/ncc-logo-512.png (512x512)');
      
      // Also overwrite main public/ncc-logo.png to be standard 512x512 compressed
      await icon.clone().resize({ w: 512, h: 512 }).write(sourceIconPath);
      console.log('  - Overwrote public/ncc-logo.png with optimized 512x512');
    } catch (err) {
      console.error('[Compressor] Error processing icons:', err);
    }
  } else {
    console.warn('[Compressor] Source icon public/ncc-logo.png not found!');
  }

  // 2. Process Background Images (which are 1.2MB and 1.9MB)
  const bg1Path = path.join(assetsDir, 'pexels-pramodtiwari-13315966.jpg');
  const bg2Path = path.join(assetsDir, 'pexels-pramodtiwari-13316131.jpg');

  const compressBackground = async (filePath, name) => {
    if (fs.existsSync(filePath)) {
      console.log(`[Compressor] Compressing background image: ${name}...`);
      try {
        const image = await Jimp.read(filePath);
        // Resize to 1100px width (maintaining aspect ratio) for web performance
        if (image.width > 1100) {
          image.resize({ w: 1100 });
        }
        // Save with 60% JPEG quality
        await image.write(filePath, { quality: 60 });
        console.log(`  - Optimized ${name} successfully!`);
      } catch (err) {
        console.error(`[Compressor] Error compressing ${name}:`, err);
      }
    } else {
      console.warn(`[Compressor] Background image ${name} not found!`);
    }
  };

  await compressBackground(bg1Path, 'pexels-pramodtiwari-13315966.jpg (Login BG)');
  await compressBackground(bg2Path, 'pexels-pramodtiwari-13316131.jpg');

  // Delete temp test file if exists
  try {
    const tempFile = path.join(assetsDir, 'test_compress.jpg');
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } catch (_) {}

  console.log('[Compressor] Compression finished successfully!');
}

main().catch(err => {
  console.error('[Compressor] Fatal error in compression script:', err);
});
