const sharp = require('sharp');

// Let's render the exact canvas output as currently configured in defaultTemplates.ts:
// DL:
// dl-name-ar: x=94.54%, y=27.60% (900, 160)
// dl-name-en: x=94.54%, y=34.80% (900, 201)
// Wait! What if x was 94.54%, but textAlign was NOT right in some place?
// Let's see how it looks if dl-name-en is right-aligned vs left-aligned vs starting from right!

async function test() {
  const blank = await sharp('public/templates/saudi-driving-license-blank.jpg').toBuffer();
  
  // Case A: Current defaultTemplates.ts (both text-anchor="end" at x=900)
  const svgA = `<svg width="952" height="578" xmlns="http://www.w3.org/2000/svg">
    <text x="900" y="160" font-family="Arial" font-size="32.5" font-weight="700" fill="#141414" text-anchor="end">اسلام حماده فؤاد عبد الرحمن</text>
    <text x="900" y="201" font-family="Arial" font-size="24.5" font-weight="400" fill="#303030" text-anchor="end" letter-spacing="0.35">ESLAM HAMADA FOUAD ABDELRAHMAN</text>
  </svg>`;
  
  await sharp(blank).composite([{ input: Buffer.from(svgA), left: 0, top: 0 }]).toFile('scripts/render_caseA.png');
  console.log('Saved render_caseA.png');
}
test();
