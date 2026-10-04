const sharp = require('sharp');
const fs = require('fs');

// Let's render the driving license with the exact coordinates from defaultTemplates.ts
// dl-name-ar: x = 94.54% = 900.02, y = 27.60% = 159.53 (baseline)
// dl-name-en: x = 94.54% = 900.02, y = 34.80% = 201.14 (baseline)
// with text-anchor="end" (which is textAlign="right")

const svg = `<svg width="952" height="578" xmlns="http://www.w3.org/2000/svg">
  <text x="900" y="160" font-family="Arial" font-size="32" font-weight="700" fill="#141414" text-anchor="end">اسلام حماده فؤاد عبد الرحمن</text>
  <text x="900" y="201" font-family="Arial" font-size="24.5" font-weight="400" fill="#303030" text-anchor="end" letter-spacing="0.35">ESLAM HAMADA FOUAD ABDELRAHMAN</text>
  <line x1="900" y1="130" x2="900" y2="230" stroke="red" stroke-width="1" />
</svg>`;

sharp(Buffer.from(svg)).png().toFile('scripts/test_name_align.png').then(() => {
  console.log('Saved scripts/test_name_align.png');
});
