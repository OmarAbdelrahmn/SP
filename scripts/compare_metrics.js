const sharp = require('sharp');

async function compareWithSample() {
  const fonts = ['Tahoma', 'Segoe_UI', 'Arial', 'Calibri'];

  for (const f of fonts) {
    const { data, info } = await sharp(`scripts/font_test_${f}.png`).raw().toBuffer({ resolveWithObject: true });
    let minX = 999, maxX = 0, minY = 999, maxY = 0;
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
    console.log(`Font ${f}: w=${w}px, h=${h}px (target in sample: w=330px, h=32px)`);
  }
}
compareWithSample();
