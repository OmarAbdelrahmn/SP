const sharp = require('sharp');

async function analyzeOriginal() {
  const origPath = 'C:/Users/omarf/.gemini/antigravity-ide/brain/786df0c4-68aa-43eb-bf4a-64282854f68b/.user_uploaded/media_1790957327018.jpg';
  const downloadPath = 'C:/Users/omarf/.gemini/antigravity-ide/brain/786df0c4-68aa-43eb-bf4a-64282854f68b/.user_uploaded/media_1790957327018.png';

  const origImg = sharp(origPath);
  const { data: origData, info: origInfo } = await origImg.raw().toBuffer({ resolveWithObject: true });

  console.log(`Original image: ${origInfo.width} x ${origInfo.height}`);

  // Let's find where the top line "بطاقة رقم 38.00057886" is in the original
  let topTextBounds = { minX: 999, maxX: 0, minY: 999, maxY: 0 };
  for (let y = 125; y <= 160; y++) {
    for (let x = 200; x <= 600; x++) {
      const idx = (y * origInfo.width + x) * origInfo.channels;
      const r = origData[idx], g = origData[idx+1], b = origData[idx+2];
      // Dark text
      if (r < 180 && g < 180 && b < 180) {
        if (x < topTextBounds.minX) topTextBounds.minX = x;
        if (x > topTextBounds.maxX) topTextBounds.maxX = x;
        if (y < topTextBounds.minY) topTextBounds.minY = y;
        if (y > topTextBounds.maxY) topTextBounds.maxY = y;
      }
    }
  }
  console.log('Original Header Subtitle bounds:', topTextBounds);

  // Let's inspect the English label column and English value column
  // For Section 1, Row 1 (y: 275-290):
  // Let's find where "Driver Card Number:" ends, and where "38.00057886" starts and ends
  function analyzeRow(labelName, yStart, yEnd) {
    const darkPixelsByX = [];
    for (let x = 30; x < origInfo.width - 30; x++) {
      let count = 0;
      for (let y = yStart; y <= yEnd; y++) {
        const idx = (y * origInfo.width + x) * origInfo.channels;
        const r = origData[idx], g = origData[idx+1], b = origData[idx+2];
        if (r < 180 && g < 180 && b < 180) count++;
      }
      darkPixelsByX.push({ x, count });
    }

    // Find clusters
    const clusters = [];
    let inCluster = false;
    let startX = 0;
    for (let i = 0; i < darkPixelsByX.length; i++) {
      if (darkPixelsByX[i].count > 1) {
        if (!inCluster) {
          inCluster = true;
          startX = darkPixelsByX[i].x;
        }
      } else {
        if (inCluster) {
          inCluster = false;
          const endX = darkPixelsByX[i-1].x;
          if (endX - startX > 3) {
            clusters.push({ startX, endX, width: endX - startX });
          }
        }
      }
    }
    console.log(`Row [${labelName}] (y: ${yStart}-${yEnd}):`, clusters);
  }

  console.log('\n--- SECTION 1 ---');
  analyzeRow('Driver Card Number', 275, 290);
  analyzeRow('Driver Name', 300, 316);
  analyzeRow('Driver Id', 325, 340);
  analyzeRow('Issue Date', 350, 366);
  analyzeRow('Expiration Date', 375, 390);
  analyzeRow('Card Category', 400, 416);

  console.log('\n--- SECTION 2 ---');
  analyzeRow('License Number', 540, 558);
  analyzeRow('License City', 568, 584);
  analyzeRow('Issue Date', 592, 608);
  analyzeRow('Expiry Date', 618, 634);
  analyzeRow('Activity Type', 642, 658);
  analyzeRow('MOI Number', 670, 686);
  analyzeRow('Company Name', 696, 712);
}

analyzeOriginal().catch(console.error);
