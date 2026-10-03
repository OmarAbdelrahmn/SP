const sharp = require('sharp');

async function testDigits() {
  const fonts = [
    { name: 'ORIGINAL CARD', isOrig: true },
    { name: 'Simplified Arabic Bold', family: 'Simplified Arabic', weight: 'bold', size: 21 },
    { name: 'Arial Bold', family: 'Arial', weight: 'bold', size: 21 },
    { name: 'Tahoma Bold', family: 'Tahoma', weight: 'bold', size: 19 },
    { name: 'Traditional Arabic Bold', family: 'Traditional Arabic', weight: 'bold', size: 22 },
  ];

  const W = 650, H = 55;
  const list = [];
  
  const orig = await sharp('scripts/orig_row1_crop.png')
    .resize({ width: 450, height: 35, fit: 'fill' })
    .png()
    .toBuffer();
    
  const origPlate = await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([
      { input: Buffer.from(`<svg width="180" height="${H}"><text x="10" y="34" font-family="sans-serif" font-size="12" font-weight="bold" fill="#059669">ORIGINAL CARD</text></svg>`), left: 0, top: 0 },
      { input: orig, left: 190, top: 10 }
    ])
    .png()
    .toBuffer();
  list.push(origPlate);

  for (let i = 1; i < fonts.length; i++) {
    const f = fonts[i];
    const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="34" font-family="sans-serif" font-size="12" fill="#333">${f.name}</text>
      <text x="620" y="38" font-family="'${f.family}', Arial, sans-serif" font-size="${f.size}" font-weight="${f.weight}" fill="#111827" text-anchor="end">٢٥٧٩٢٣٦٤٠٣       ٢٠٢٦/٠٩/٢١</text>
    </svg>`);
    const png = await sharp(svg).png().toBuffer();
    list.push(png);
  }

  const compList = list.map((img, idx) => ({ input: img, top: idx * (H + 4), left: 0 }));
  await sharp({ create: { width: W, height: list.length * (H + 4), channels: 3, background: '#cbd5e1' } })
    .composite(compList)
    .png()
    .toFile('scripts/digits_compare.png');

  console.log('Saved scripts/digits_compare.png');
}
testDigits();
