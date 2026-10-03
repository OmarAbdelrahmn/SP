const sharp = require('sharp');

async function measureExactMuqeem() {
  const { data, info } = await sharp('scripts/mq_sample_952x578.png').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  console.log('=== EXACT MEASUREMENTS IN 952 x 578 MUQEEM ID SAMPLE ===');

  function analyzeRegion(name, yMin, yMax, xMin, xMax) {
    let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
    let darkPixels = 0;

    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        if (r < 90 && g < 90 && b < 90) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          darkPixels++;
        }
      }
    }

    if (darkPixels === 0) {
      console.log(`[${name}]: No dark text found`);
      return;
    }

    const textHeight = maxY - minY + 1;
    const textWidth = maxX - minX + 1;
    const yCenter = Math.round((minY + maxY) / 2);
    const yCenterPct = ((yCenter / height) * 100).toFixed(2);
    const xMinPct = ((minX / width) * 100).toFixed(2);
    const xMaxPct = ((maxX / width) * 100).toFixed(2);

    console.log(`[${name}]:`);
    console.log(`  y: ${minY}..${maxY} (height = ${textHeight}px, center = ${yCenter} = ${yCenterPct}%)`);
    console.log(`  x: ${minX}..${maxX} (width = ${textWidth}px, range = ${xMinPct}%..${xMaxPct}%)`);
  }

  // 1. Arabic Name: y approx 150..190, x approx 350..830
  analyzeRegion('Arabic Name (MQ)', 150, 195, 350, 830);

  // 2. English Name: y approx 195..235, x approx 300..830
  analyzeRegion('English Name (MQ)', 195, 235, 300, 830);

  // Middle Column (Expiry, Place of Birth, Religion) around x: 300..500
  analyzeRegion('MQ Mid 1 Expiry Date', 240, 280, 310, 500);
  analyzeRegion('MQ Mid 2 Place of Birth', 280, 320, 310, 500);
  analyzeRegion('MQ Mid 3 Religion', 320, 360, 310, 500);

  // Right Column (ID, DOB, Nationality, Profession, Employer ID, Place Issue, Place Work, Employer Name) around x: 500..840
  analyzeRegion('MQ Right 1 ID Number', 240, 280, 550, 840);
  analyzeRegion('MQ Right 2 Date of Birth', 280, 320, 550, 840);
  analyzeRegion('MQ Right 3 Nationality', 320, 360, 550, 840);
  analyzeRegion('MQ Right 4 Profession', 360, 400, 550, 840);
  analyzeRegion('MQ Right 5 Employer ID', 400, 440, 550, 840);
  analyzeRegion('MQ Right 6 Place of Issue', 440, 480, 550, 840);
  analyzeRegion('MQ Right 7 Place of Work', 480, 515, 550, 840);
  analyzeRegion('MQ Right 8 Employer Name', 515, 550, 550, 840);
}

measureExactMuqeem();
