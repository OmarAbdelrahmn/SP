const sharp = require('sharp');

async function compareSampleAndBlank() {
  const { data: blankData, info: blankInfo } = await sharp('public/templates/saudi-driving-license-blank.jpg').raw().toBuffer({ resolveWithObject: true });
  const { data: sampleData, info: sampleInfo } = await sharp('scripts/dl_sample_952x578.png').raw().toBuffer({ resolveWithObject: true });
  const width = 952, height = 578;

  // Let's find the exact vertical position of the label "ID Number" in BOTH blank and sample!
  // "ID Number" label is around x: 330..420
  console.log('Comparing label "ID Number" in blank vs sample:');
  for (let y = 220; y <= 270; y += 2) {
    let bDark = 0, sDark = 0;
    for (let x = 340; x <= 410; x++) {
      const idx = (y * width + x) * 3;
      if (blankData[idx] < 180) bDark++;
      if (sampleData[idx] < 180) sDark++;
    }
    if (bDark > 0 || sDark > 0) {
      console.log(`y=${y}: blank=${bDark}, sample=${sDark}`);
    }
  }
}
compareSampleAndBlank();
