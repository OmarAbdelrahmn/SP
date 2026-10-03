const sharp = require('sharp');
const fs = require('fs');

async function testAllFonts() {
  const fonts = [
    { name: 'Tajawal Bold', family: 'Tajawal', weight: 'bold' },
    { name: 'Almarai Bold', family: 'Almarai', weight: 'bold' },
    { name: 'Cairo Bold', family: 'Cairo', weight: 'bold' },
    { name: 'Tahoma Bold', family: 'Tahoma', weight: 'bold' },
    { name: 'Segoe UI Bold', family: 'Segoe UI', weight: 'bold' },
    { name: 'Arial Bold', family: 'Arial', weight: 'bold' },
    { name: 'Simplified Arabic Bold', family: 'Simplified Arabic', weight: 'bold' },
    { name: 'Traditional Arabic Bold', family: 'Traditional Arabic', weight: 'bold' },
    { name: 'Sakkal Majalla Bold', family: 'Sakkal Majalla', weight: 'bold' },
    { name: 'Calibri Bold', family: 'Calibri', weight: 'bold' },
  ];

  const W = 600, H = 50;
  const svgs = [];
  for (const f of fonts) {
    const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="32" font-family="sans-serif" font-size="13" fill="#666">${f.name}</text>
      <text x="580" y="34" font-family="'${f.family}', Tajawal, sans-serif" font-size="25" font-weight="${f.weight}" fill="black" text-anchor="end">اسلام حماده فؤاد عبد الرحمن</text>
    </svg>`);
    const png = await sharp(svg).png().toBuffer();
    svgs.push(png);
  }

  // Include original crop at top
  const orig = await sharp('scripts/orig_name_ar_crop.png').resize({ width: W, height: H, fit: 'contain', background: '#f5f5f5' }).png().toBuffer();
  
  const totalH = H * (svgs.length + 1) + 10;
  const compList = [{ input: orig, top: 0, left: 0 }];
  for (let i = 0; i < svgs.length; i++) {
    compList.push({ input: svgs[i], top: (i + 1) * H + 5, left: 0 });
  }

  await sharp({ create: { width: W, height: totalH, channels: 3, background: '#e2e8f0' } })
    .composite(compList)
    .png()
    .toFile('scripts/font_comparison_all.png');
  console.log('Saved scripts/font_comparison_all.png');
}
testAllFonts();
