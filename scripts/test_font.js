const sharp = require('sharp');
const fs = require('fs');

async function testSvg() {
  const svg = `<svg width="500" height="100">
    <text x="10" y="50" font-family="Arial" font-size="28" font-weight="bold" fill="black">ESLAM HAMADA FOUAD</text>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  console.log('Sharp SVG rendered! buf length:', buf.length);
}
testSvg();
