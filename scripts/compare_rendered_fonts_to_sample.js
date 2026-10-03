const sharp = require('sharp');

async function compare() {
  const fonts = ['almarai', 'tajawal', 'cairo'];
  for (const f of fonts) {
    const { data, info } = await sharp(`scripts/test_${f}_full.png`).raw().toBuffer({ resolveWithObject: true });
    // measure name bounds (y: 20..65)
    let minX = 999, maxX = 0, minY = 999, maxY = 0;
    for (let y = 20; y <= 65; y++) {
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
    const nameW = maxX - minX + 1;
    const nameH = maxY - minY + 1;

    // measure digits bounds (y: 75..110)
    let dMinX = 999, dMaxX = 0, dMinY = 999, dMaxY = 0;
    for (let y = 75; y <= 110; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        if (data[idx] < 100) {
          if (x < dMinX) dMinX = x;
          if (x > dMaxX) dMaxX = x;
          if (y < dMinY) dMinY = y;
          if (y > dMaxY) dMaxY = y;
        }
      }
    }
    const digW = dMaxX - dMinX + 1;
    const digH = dMaxY - dMinY + 1;

    console.log(`[${f.toUpperCase()}]:`);
    console.log(`  Name:   w=${nameW}px, h=${nameH}px (Target in sample: w=326-330px, h=32px)`);
    console.log(`  Digits: w=${digW}px, h=${digH}px (Target in sample: w=135-140px, h=16-17px)`);
  }
}
compare();
