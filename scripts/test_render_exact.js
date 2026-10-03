const sharp = require('sharp');

async function testRender() {
  console.log('Testing English Name sizes:');
  for (const s of [16.5, 18, 20, 22, 24, 26, 28]) {
    const svg = `<svg width="800" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="50" font-family="Arial, sans-serif" font-size="${s}" font-weight="bold" fill="black">ESLAM HAMADA FOUAD ABDELRAHMAN</text>
    </svg>`;
    const { data, info } = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true });
    let minY = 999, maxY = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        // Text is dark (r < 100)
        if (data[idx] < 100) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const h = maxY - minY + 1;
    console.log(`fontSize ${s} -> text height = ${h}px (target in sample: 20px)`);
  }

  console.log('\nTesting ID Number sizes:');
  for (const s of [14, 15, 15.5, 17, 19, 21, 23, 25]) {
    const svg = `<svg width="400" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="40" font-family="Arial, sans-serif" font-size="${s}" font-weight="bold" fill="black">2579236403</text>
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
    console.log(`fontSize ${s} -> text height = ${h}px (target in sample: 16-17px)`);
  }
}

testRender();
