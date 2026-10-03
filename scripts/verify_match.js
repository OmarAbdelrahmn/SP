const sharp = require('sharp');

async function verifyMatch() {
  const { data: testData, info: testInfo } = await sharp('scripts/test_dl_result.png').raw().toBuffer({ resolveWithObject: true });
  const { data: sampleData, info: sampleInfo } = await sharp('scripts/dl_sample_952x578.png').raw().toBuffer({ resolveWithObject: true });

  console.log('--- VERIFYING DRIVING LICENSE ---');
  function checkRegion(name, yMin, yMax, xMin, xMax) {
    let tMinY = 999, tMaxY = 0, tMinX = 999, tMaxX = 0;
    let sMinY = 999, sMaxY = 0, sMinX = 999, sMaxX = 0;

    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const idx = (y * 952 + x) * 3;
        if (testData[idx] < 100) {
          if (y < tMinY) tMinY = y;
          if (y > tMaxY) tMaxY = y;
          if (x < tMinX) tMinX = x;
          if (x > tMaxX) tMaxX = x;
        }
        if (sampleData[idx] < 100) {
          if (y < sMinY) sMinY = y;
          if (y > sMaxY) sMaxY = y;
          if (x < sMinX) sMinX = x;
          if (x > sMaxX) sMaxX = x;
        }
      }
    }

    const tH = tMaxY - tMinY + 1;
    const sH = sMaxY - sMinY + 1;
    const tW = tMaxX - tMinX + 1;
    const sW = sMaxX - sMinX + 1;
    console.log(`[${name}]:`);
    console.log(`  Rendered: y=${tMinY}..${tMaxY} (H=${tH}px), x=${tMinX}..${tMaxX} (W=${tW}px)`);
    console.log(`  Sample:   y=${sMinY}..${sMaxY} (H=${sH}px), x=${sMinX}..${sMaxX} (W=${sW}px)`);
    console.log(`  Delta H: ${tH - sH}px, Delta W: ${tW - sW}px`);
  }

  checkRegion('Arabic Name', 140, 190, 480, 830);
  checkRegion('English Name', 190, 230, 360, 830);
  checkRegion('ID Number EN', 235, 275, 430, 600);
  checkRegion('ID Number AR', 235, 275, 640, 830);
  checkRegion('Lic Type EN', 280, 320, 430, 600);
  checkRegion('Lic Type AR', 280, 320, 640, 830);
}

verifyMatch();
