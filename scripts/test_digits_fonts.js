const sharp = require('sharp');
const path = require('path');

async function testDigits() {
  const digits = '٢٥٧٩٢٣٦٤٠٣';
  const name = 'اسلام حماده فؤاد عبد الرحمن';

  const pathAlm = path.resolve('public/fonts/Almarai-Bold.ttf');
  const pathTaj = path.resolve('public/fonts/Tajawal-Bold.ttf');
  const pathCai = path.resolve('public/fonts/Cairo-Bold.ttf');

  const svg = (fontName, filePath) => `<svg width="700" height="120" xmlns="http://www.w3.org/2000/svg">
    <style>
      @font-face {
        font-family: '${fontName}';
        src: url('file:///${filePath.replace(/\\/g, '/')}');
      }
    </style>
    <rect width="100%" height="100%" fill="white"/>
    <text x="650" y="50" font-family="'${fontName}', Arial" font-size="28.5" font-weight="bold" fill="black" text-anchor="end">${name}</text>
    <text x="650" y="95" font-family="'${fontName}', Arial" font-size="22" font-weight="bold" fill="black" text-anchor="end">${digits}</text>
  </svg>`;

  await sharp(Buffer.from(svg('AlmaraiLocal', pathAlm))).png().toFile('scripts/test_almarai_full.png');
  await sharp(Buffer.from(svg('TajawalLocal', pathTaj))).png().toFile('scripts/test_tajawal_full.png');
  await sharp(Buffer.from(svg('CairoLocal', pathCai))).png().toFile('scripts/test_cairo_full.png');

  console.log('Saved test_almarai_full.png, test_tajawal_full.png, test_cairo_full.png');
}

testDigits().catch(console.error);
