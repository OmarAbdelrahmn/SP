const sharp = require('sharp');

async function calibrate() {
  const origPath = 'C:/Users/omarf/.gemini/antigravity-ide/brain/786df0c4-68aa-43eb-bf4a-64282854f68b/.user_uploaded/media_1790957327018.jpg';
  const { data, info } = await sharp(origPath).raw().toBuffer({ resolveWithObject: true });

  const rows = [
    { name: 'Header Subtitle', y1: 130, y2: 152, x1: 280, x2: 430 },
    // Section 1
    { name: 'Sec1 Row1 (Card No)', y1: 275, y2: 292, x1: 170, x2: 550 },
    { name: 'Sec1 Row2 (Driver Name)', y1: 300, y2: 320, x1: 170, x2: 550 },
    { name: 'Sec1 Row3 (Driver Id)', y1: 325, y2: 342, x1: 170, x2: 550 },
    { name: 'Sec1 Row4 (Issue Date)', y1: 350, y2: 368, x1: 170, x2: 550 },
    { name: 'Sec1 Row5 (Expiry Date)', y1: 375, y2: 393, x1: 170, x2: 550 },
    { name: 'Sec1 Row6 (Category)', y1: 400, y2: 418, x1: 170, x2: 550 },
    // Section 2
    { name: 'Sec2 Row1 (License No)', y1: 540, y2: 560, x1: 170, x2: 550 },
    { name: 'Sec2 Row2 (City)', y1: 568, y2: 586, x1: 170, x2: 550 },
    { name: 'Sec2 Row3 (Lic Issue Date)', y1: 592, y2: 610, x1: 170, x2: 550 },
    { name: 'Sec2 Row4 (Lic Expiry Date)', y1: 618, y2: 636, x1: 170, x2: 550 },
    { name: 'Sec2 Row5 (Activity Type)', y1: 642, y2: 660, x1: 170, x2: 550 },
    { name: 'Sec2 Row6 (MOI Number)', y1: 670, y2: 688, x1: 170, x2: 550 },
    { name: 'Sec2 Row7 (Company Name)', y1: 696, y2: 714, x1: 170, x2: 550 },
  ];

  console.log(`Image size: ${info.width} x ${info.height}`);

  for (const r of rows) {
    // English value (x: 170 to 350)
    let enMinX = 999, enMaxX = 0, enMinY = 999, enMaxY = 0;
    // Arabic value (x: 350 to 540)
    let arMinX = 999, arMaxX = 0, arMinY = 999, arMaxY = 0;

    for (let y = r.y1; y <= r.y2; y++) {
      for (let x = 175; x <= 350; x++) {
        const idx = (y * info.width + x) * info.channels;
        if (data[idx] < 170) {
          if (x < enMinX) enMinX = x;
          if (x > enMaxX) enMaxX = x;
          if (y < enMinY) enMinY = y;
          if (y > enMaxY) enMaxY = y;
        }
      }
      for (let x = 360; x <= 540; x++) {
        const idx = (y * info.width + x) * info.channels;
        if (data[idx] < 170) {
          if (x < arMinX) arMinX = x;
          if (x > arMaxX) arMaxX = x;
          if (y < arMinY) arMinY = y;
          if (y > arMaxY) arMaxY = y;
        }
      }
    }

    const enYMid = Math.round((enMinY + enMaxY) / 2);
    const arYMid = Math.round((arMinY + arMaxY) / 2);
    const yPercent = (enYMid / info.height * 100).toFixed(2);
    const enXPercent = (enMinX / info.width * 100).toFixed(2);
    const arXPercent = (arMaxX / info.width * 100).toFixed(2);

    console.log(`${r.name}:`);
    console.log(`  EN: startX=${enMinX} (${enXPercent}%), endX=${enMaxX}, yMid=${enYMid} (${yPercent}%), height=${enMaxY - enMinY + 1}px`);
    console.log(`  AR: startX=${arMinX}, endX=${arMaxX} (${arXPercent}%), yMid=${arYMid}, height=${arMaxY - arMinY + 1}px`);
  }
}

calibrate().catch(console.error);
