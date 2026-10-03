const sharp = require('sharp');

async function detailedCompare() {
  const fonts = [
    { name: 'Original', isOrig: true },
    { name: 'Simplified Arabic Bold', family: 'Simplified Arabic', weight: 'bold', size: 26 },
    { name: 'Arial Bold', family: 'Arial', weight: 'bold', size: 26 },
    { name: 'Traditional Arabic Bold', family: 'Traditional Arabic', weight: 'bold', size: 28 },
    { name: 'Calibri Bold', family: 'Calibri', weight: 'bold', size: 26 },
    { name: 'Segoe UI Bold', family: 'Segoe UI', weight: 'bold', size: 25 },
    { name: 'Tajawal Bold', family: 'Tajawal', weight: 'bold', size: 27 },
  ];

  const W = 650, H = 55;
  const list = [];
  
  // Crop original name exactly
  const orig = await sharp('scripts/orig_name_ar_crop.png')
    .resize({ width: 380, height: 35, fit: 'fill' })
    .png()
    .toBuffer();
    
  const origPlate = await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([
      { input: Buffer.from(`<svg width="200" height="${H}"><text x="10" y="34" font-family="sans-serif" font-size="14" font-weight="bold" fill="#059669">ORIGINAL CARD</text></svg>`), left: 0, top: 0 },
      { input: orig, left: 240, top: 10 }
    ])
    .png()
    .toBuffer();
  list.push(origPlate);

  for (let i = 1; i < fonts.length; i++) {
    const f = fonts[i];
    const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="34" font-family="sans-serif" font-size="13" fill="#333">${f.name}</text>
      <text x="620" y="38" font-family="'${f.family}', Tajawal, sans-serif" font-size="${f.size}" font-weight="${f.weight}" fill="#111827" text-anchor="end">اسلام حماده فؤاد عبد الرحمن</text>
    </svg>`);
    const png = await sharp(svg).png().toBuffer();
    list.push(png);
  }

  const compList = list.map((img, idx) => ({ input: img, top: idx * (H + 4), left: 0 }));
  await sharp({ create: { width: W, height: list.length * (H + 4), channels: 3, background: '#cbd5e1' } })
    .composite(compList)
    .png()
    .toFile('scripts/detail_font_compare.png');

  console.log('Saved scripts/detail_font_compare.png');
}
detailedCompare();
