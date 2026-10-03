const sharp = require('sharp');

async function findExactRowFont() {
  for (const size of [14, 15, 16, 17, 18, 19, 20, 21, 22]) {
    for (const weight of ['bold', '700']) {
      const svg = `<svg width="500" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="black">2579236403</text>
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
      if (Math.abs(w - 131) < 20) {
        console.log(`size: ${size}, weight: ${weight} -> w=${w}px, h=${h}px (target: w=131px, h=16-17px)`);
      }
    }
  }
}
findExactRowFont();
