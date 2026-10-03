const sharp = require('sharp');

async function measureExact() {
  const { data, info } = await sharp('scripts/dl_sample_952x578.png').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  console.log('=== EXACT MEASUREMENTS IN 952 x 578 DRIVING LICENSE SAMPLE ===');

  function analyzeRegion(name, yMin, yMax, xMin, xMax) {
    let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
    let darkPixels = 0;
    const yProjection = new Array(yMax - yMin + 1).fill(0);

    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        // Sample text is dark black (< 90)
        if (r < 90 && g < 90 && b < 90) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          darkPixels++;
          yProjection[y - yMin]++;
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

  // 1. Arabic Name: y approx 140..190, x approx 350..820
  analyzeRegion('Arabic Name (DL)', 140, 190, 350, 830);

  // 2. English Name: y approx 190..230, x approx 300..830
  analyzeRegion('English Name (DL)', 190, 230, 300, 830);

  // 3. Row 1: ID Number (EN left, AR right)
  analyzeRegion('Row 1 ID EN (DL)', 235, 275, 420, 600);
  analyzeRegion('Row 1 ID AR (DL)', 235, 275, 600, 830);

  // 4. Row 2: License Type
  analyzeRegion('Row 2 Lic Type EN (DL)', 280, 320, 420, 600);
  analyzeRegion('Row 2 Lic Type AR (DL)', 280, 320, 600, 830);

  // 5. Row 3: Issue Date
  analyzeRegion('Row 3 Issue Date EN (DL)', 325, 365, 420, 600);
  analyzeRegion('Row 3 Issue Date AR (DL)', 325, 365, 600, 830);

  // 6. Row 4: Date of Birth
  analyzeRegion('Row 4 DOB EN (DL)', 370, 410, 420, 600);
  analyzeRegion('Row 4 DOB AR (DL)', 370, 410, 600, 830);

  // 7. Row 5: Nationality
  analyzeRegion('Row 5 Nationality EN (DL)', 415, 455, 420, 600);
  analyzeRegion('Row 5 Nationality AR (DL)', 415, 455, 600, 830);

  // 8. Row 6: Expiry Date
  analyzeRegion('Row 6 Expiry Date EN (DL)', 460, 500, 420, 600);
  analyzeRegion('Row 6 Expiry Date AR (DL)', 460, 500, 600, 830);

  // 9. Row 7: Blood Type
  analyzeRegion('Row 7 Blood Type (DL)', 500, 535, 420, 600);
}

measureExact();
