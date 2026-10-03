const sharp = require('sharp');

async function testEnglishFonts() {
  const fonts = [
    { name: 'ORIGINAL CARD', isOrig: true },
    { name: 'Arial Regular', family: 'Arial', weight: 'normal', size: 21 },
    { name: 'Arial Medium/Semi', family: 'Arial', weight: '500', size: 21 },
    { name: 'Arial Bold', family: 'Arial', weight: 'bold', size: 21 },
    { name: 'Segoe UI Regular', family: 'Segoe UI', weight: 'normal', size: 21 },
    { name: 'Segoe UI SemiBold', family: 'Segoe UI', weight: '600', size: 21 },
    { name: 'Calibri Regular', family: 'Calibri', weight: 'normal', size: 22 },
    { name: 'Inter Regular', family: 'Inter', weight: 'normal', size: 21 },
    { name: 'Inter SemiBold', family: 'Inter', weight: '600', size: 21 },
  ];

  const W = 650, H = 45;
  const list = [];
  
  const orig = await sharp('scripts/orig_name_en_crop.png')
    .resize({ width: 450, height: 26, fit: 'fill' })
    .png()
    .toBuffer();
    
  const origPlate = await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([
      { input: Buffer.from(`<svg width="180" height="${H}"><text x="10" y="28" font-family="sans-serif" font-size="12" font-weight="bold" fill="#059669">ORIGINAL CARD</text></svg>`), left: 0, top: 0 },
      { input: orig, left: 190, top: 9 }
    ])
    .png()
    .toBuffer();
  list.push(origPlate);

  for (let i = 1; i < fonts.length; i++) {
    const f = fonts[i];
    const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="28" font-family="sans-serif" font-size="12" fill="#333">${f.name}</text>
      <text x="630" y="30" font-family="'${f.family}', sans-serif" font-size="${f.size}" font-weight="${f.weight}" fill="#111827" text-anchor="end">ESLAM HAMADA FOUAD ABDELRAHMAN</text>
    </svg>`);
    const png = await sharp(svg).png().toBuffer();
    list.push(png);
  }

  const compList = list.map((img, idx) => ({ input: img, top: idx * (H + 4), left: 0 }));
  await sharp({ create: { width: W, height: list.length * (H + 4), channels: 3, background: '#cbd5e1' } })
    .composite(compList)
    .png()
    .toFile('scripts/english_compare.png');

  console.log('Saved scripts/english_compare.png');
}
testEnglishFonts();
