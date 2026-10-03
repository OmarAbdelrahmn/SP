const sharp = require('sharp');
const fs = require('fs');

async function run() {
  // Resize dl_card_crop.png to 952 x 578
  const sampleResized = await sharp('scripts/dl_card_crop.png')
    .resize(952, 578)
    .toFile('scripts/dl_sample_952x578.png');

  // Also resize mq_card_crop.png to 952 x 578
  const mqResized = await sharp('scripts/mq_card_crop.png')
    .resize(952, 578)
    .toFile('scripts/mq_sample_952x578.png');

  console.log('Resized samples to 952x578');
}
run();
