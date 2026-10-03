const sharp = require('sharp');

async function testArabic() {
  console.log('Testing Arabic Name sizes:');
  for (const s of [25.5, 28, 30, 32, 34, 36, 38, 40]) {
    const svg = `<svg width="800" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="50" y="70" font-family="Arial, sans-serif" font-size="${s}" font-weight="bold" fill="black">اسلام حماده فؤاد عبد الرحمن</text>
    </svg>`;
    const { data, info } = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true });
    let minY = 999, maxY = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        if (data[idx] < 100) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const h = maxY - minY + 1;
    console.log(`fontSize ${s} -> text height = ${h}px (target in sample: 32px)`);
  }
}

testArabic();
