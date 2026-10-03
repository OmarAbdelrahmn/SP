const sharp = require('sharp');
async function checkW() {
  for (const sz of [29, 30, 31, 32, 33, 34]) {
    const svg = Buffer.from(`<svg width="800" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="750" y="50" font-family="'Simplified Arabic'" font-size="${sz}" font-weight="bold" fill="black" text-anchor="end">اسلام حماده فؤاد عبد الرحمن</text>
    </svg>`);
    const { data, info } = await sharp(svg).greyscale().raw().toBuffer({ resolveWithObject: true });
    let minX = 999, maxX = 0, minY = 999, maxY = 0;
    for (let y = 0; y < info.height; y++)
      for (let x = 0; x < info.width; x++)
        if (data[y * info.width + x] < 120) {
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
    console.log('sz:', sz, 'h:', maxY - minY + 1, 'w:', maxX - minX + 1);
  }
}
checkW();
