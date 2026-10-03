const sharp = require('sharp');
const fs = require('fs');

async function testFontRender() {
  const fonts = ['Tahoma', 'Segoe UI', 'Arial', 'Calibri'];

  for (const font of fonts) {
    const svg = `<svg width="700" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="650" y="65" font-family="${font}" font-size="28" font-weight="bold" fill="black" text-anchor="end">اسلام حماده فؤاد عبد الرحمن</text>
    </svg>`;

    await sharp(Buffer.from(svg))
      .png()
      .toFile(`scripts/font_test_${font.replace(/\s+/g, '_')}.png`);
  }
  console.log('Saved font tests for local fonts.');
}
testFontRender();
