const sharp = require('sharp');

async function createPristineBlankCard() {
  const originalPath = 'public/templates/saudi-driver-card-original.jpg';
  const outputPath = 'public/templates/saudi-driver-card-blank.png';

  // Exact masking:
  // 1. Top Header subtitle: original text is between x=285 and x=420, y=134 to 148.
  //    Mask from x=265 to x=445 (width 180, height 24) with #ffffff.
  // 2. Section 1 data column: from x=175 to x=545 (width 370), y=265 to y=425 (height 160) with #f8f8f8.
  // 3. Section 2 data column: from x=175 to x=545 (width 370), y=530 to y=722 (height 192) with #f8f8f8.
  // 4. QR code (x: 82-153, y: 85-156) is NOT masked, keeping the static original QR intact.

  const svgMask = `
    <svg width="708" height="1024" xmlns="http://www.w3.org/2000/svg">
      <!-- 1. Top Header Subtitle (بطاقة رقم 38.00057886) -->
      <rect x="265" y="132" width="180" height="22" fill="#ffffff" />
      
      <!-- 2. Section 1 Driver Card Info Data Column (#f8f8f8) -->
      <rect x="175" y="265" width="370" height="160" fill="#f8f8f8" />
      
      <!-- 3. Section 2 License & Company Info Data Column (#f8f8f8) -->
      <rect x="175" y="530" width="370" height="192" fill="#f8f8f8" />
    </svg>
  `;

  await sharp(originalPath)
    .composite([
      {
        input: Buffer.from(svgMask),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(outputPath);

  console.log('Successfully generated clean blank card template at', outputPath);
}

createPristineBlankCard().catch(console.error);
