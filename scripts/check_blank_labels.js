const sharp = require('sharp');

async function checkBlankLabels() {
  const { data, info } = await sharp('public/templates/saudi-driving-license-blank.jpg').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Let's inspect the blank template around y=230..260 at x=350 (where "ID Number" label is)
  // and at x=880 (where "رقم الهوية" label is)
  console.log('Driving License Blank Template Labels vs Sample Value:');
  for (let y = 220; y <= 270; y += 2) {
    // English label around x=320..420
    let darkEn = 0;
    for (let x = 320; x <= 420; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx] < 180) darkEn++;
    }
    // Value area around x=450..550 in blank
    let darkVal = 0;
    for (let x = 450; x <= 550; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx] < 180) darkVal++;
    }
    console.log(`y=${y} (${((y/height)*100).toFixed(2)}%): labelDark=${darkEn}, valAreaDark=${darkVal}`);
  }
}
checkBlankLabels();
