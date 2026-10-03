const sharp = require('sharp');

async function findExactArabicFont() {
  for (const size of [24, 25, 26, 27, 28, 29, 30, 31, 32]) {
    for (const weight of ['bold', '700', '800']) {
      const svg = `<svg width="1000" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50" y="60" font-family="'Segoe UI', Tahoma, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="black">اسلام حماده فؤاد عبد الرحمن</text>
      </svg>`;
      const { data, info } = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true });
      let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const idx = (y * info.width + x) * info.channels;
          if (data[idx] < 100) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      if (Math.abs(w - 330) < 30) {
        console.log(`size: ${size}, weight: ${weight} -> w=${w}px, h=${h}px (target: w=330px, h=32px)`);
      }
    }
  }
}
findExactArabicFont();
