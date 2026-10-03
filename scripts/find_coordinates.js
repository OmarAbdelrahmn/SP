const sharp = require('sharp');

async function testBounds() {
  const { data, info } = await sharp('public/templates/saudi-driver-card-original.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  function findTextRows(startY, endY, checkXStart, checkXEnd) {
    const rowDarkness = [];
    for (let y = startY; y <= endY; y++) {
      let darkPixels = 0;
      for (let x = checkXStart; x <= checkXEnd; x++) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        // Dark text pixels (< 150)
        if (r < 140 && g < 140 && b < 140) {
          darkPixels++;
        }
      }
      rowDarkness.push({ y, darkPixels });
    }
    // Filter rows with significant dark pixels
    const textPeaks = [];
    let inText = false;
    let currentBlock = [];
    for (const r of rowDarkness) {
      if (r.darkPixels > 8) {
        if (!inText) inText = true;
        currentBlock.push(r.y);
      } else {
        if (inText) {
          inText = false;
          if (currentBlock.length >= 4) {
            const mid = Math.round((currentBlock[0] + currentBlock[currentBlock.length - 1]) / 2);
            textPeaks.push({ start: currentBlock[0], end: currentBlock[currentBlock.length - 1], mid });
          }
          currentBlock = [];
        }
      }
    }
    return textPeaks;
  }

  console.log('--- Section 1 English Labels (x: 45-160) ---');
  const sec1Labels = findTextRows(240, 440, 45, 160);
  console.log(sec1Labels);

  console.log('--- Section 1 Data Values (x: 180-340) ---');
  const sec1Values = findTextRows(240, 440, 180, 340);
  console.log(sec1Values);

  console.log('--- Section 2 English Labels (x: 45-160) ---');
  const sec2Labels = findTextRows(500, 720, 45, 160);
  console.log(sec2Labels);

  console.log('--- Section 2 Data Values (x: 180-340) ---');
  const sec2Values = findTextRows(500, 720, 180, 340);
  console.log(sec2Values);

  console.log('--- Top Header Card Number (y: 120-160, x: 260-440) ---');
  const headerCardNo = findTextRows(120, 160, 260, 440);
  console.log(headerCardNo);
}

testBounds().catch(console.error);
