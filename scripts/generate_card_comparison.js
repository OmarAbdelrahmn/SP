const sharp = require('sharp');
const fs = require('fs');

async function renderCardComparison() {
  // 1. Driving License
  // Template is 952 x 578
  const dlSvg = `<svg width="952" height="578" xmlns="http://www.w3.org/2000/svg">
    <!-- Arabic Name -->
    <text x="${(84.5/100)*952}" y="${(29.2/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="28.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">اسلام حماده فؤاد عبد الرحمن</text>
    <!-- English Name -->
    <text x="${(84.5/100)*952}" y="${(35.8/100)*578}" font-family="Arial, 'Segoe UI', sans-serif" font-size="23" font-weight="600" fill="#111827" text-anchor="end" dominant-baseline="middle">ESLAM HAMADA FOUAD ABDELRAHMAN</text>
    <!-- Row 1: ID Number -->
    <text x="${(48.0/100)*952}" y="${(41.5/100)*578}" font-family="Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">2579236403</text>
    <text x="${(84.0/100)*952}" y="${(41.5/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">٢٥٧٩٢٣٦٤٠٣</text>
    <!-- Row 2: License Type -->
    <text x="${(48.0/100)*952}" y="${(48.6/100)*578}" font-family="Arial, sans-serif" font-size="21.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">Light Transport</text>
    <text x="${(84.0/100)*952}" y="${(48.6/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">نقل خفيف</text>
    <!-- Row 3: Issue Date -->
    <text x="${(48.0/100)*952}" y="${(57.1/100)*578}" font-family="Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">02/04/2026</text>
    <text x="${(84.0/100)*952}" y="${(57.1/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">٢٠٢٦/٠٤/٠٢</text>
    <!-- Row 4: Date of Birth -->
    <text x="${(48.0/100)*952}" y="${(65.2/100)*578}" font-family="Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">01/12/1999</text>
    <text x="${(84.0/100)*952}" y="${(65.2/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">١٩٩٩/١٢/٠١</text>
    <!-- Row 5: Nationality -->
    <text x="${(48.0/100)*952}" y="${(74.2/100)*578}" font-family="Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">Egypt</text>
    <text x="${(84.0/100)*952}" y="${(74.2/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">مصر</text>
    <!-- Row 6: Expiry Date -->
    <text x="${(48.0/100)*952}" y="${(81.7/100)*578}" font-family="Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">06/02/2031</text>
    <text x="${(84.0/100)*952}" y="${(81.7/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">٢٠٣١/٠٢/٠٦</text>
    <!-- Row 7: Blood Type -->
    <text x="${(48.0/100)*952}" y="${(88.1/100)*578}" font-family="Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="start" dominant-baseline="middle">A+</text>
    <text x="${(84.0/100)*952}" y="${(88.1/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="22.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">A+</text>
  </svg>`;

  const dlSvgBuf = await sharp(Buffer.from(dlSvg)).png().toBuffer();
  const photo = await sharp('public/templates/sample-person.jpg')
    .resize(Math.round((24.68/100)*952), Math.round((48.1/100)*578), { fit: 'cover' })
    .toBuffer();

  const photoLeft = Math.round(((18.96 - 24.68/2)/100)*952);
  const photoTop = Math.round(((49.14 - 48.1/2)/100)*578);

  const dlResult = await sharp('public/templates/saudi-driving-license-blank.jpg')
    .composite([
      { input: photo, left: photoLeft, top: photoTop },
      { input: dlSvgBuf, left: 0, top: 0 },
    ])
    .toFile('scripts/test_dl_result.png');

  console.log('Generated scripts/test_dl_result.png');

  // 2. Muqeem ID
  const mqSvg = `<svg width="952" height="578" xmlns="http://www.w3.org/2000/svg">
    <!-- Arabic Name -->
    <text x="${(84.5/100)*952}" y="${(31.8/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="28.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">اسلام حماده فؤاد عبد الرحمن</text>
    <!-- English Name -->
    <text x="${(84.5/100)*952}" y="${(38.0/100)*578}" font-family="Arial, 'Segoe UI', sans-serif" font-size="23" font-weight="600" fill="#111827" text-anchor="end" dominant-baseline="middle">ESLAM HAMADA FOUAD ABDELRAHMAN</text>
    <!-- Middle Column -->
    <text x="${(49.5/100)*952}" y="${(43.4/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">٢٠٢٦/٠٩/٢١</text>
    <text x="${(49.0/100)*952}" y="${(50.0/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">مصر</text>
    <text x="${(53.5/100)*952}" y="${(56.4/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">الاسلام</text>
    <!-- Right Column -->
    <text x="${(84.5/100)*952}" y="${(43.4/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">٢٥٧٩٢٣٦٤٠٣</text>
    <text x="${(84.0/100)*952}" y="${(49.8/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">١٩٩٩/١٢/٠١</text>
    <text x="${(87.0/100)*952}" y="${(56.4/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">مصر</text>
    <text x="${(88.0/100)*952}" y="${(63.7/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">سائق شاحنة صغيرة</text>
    <text x="${(78.0/100)*952}" y="${(70.2/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">٧٠٣٧٤٢٧٦٠١</text>
    <text x="${(83.0/100)*952}" y="${(76.6/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="17.5" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">موقع بوابة الوزارة الإلكترونية</text>
    <text x="${(82.5/100)*952}" y="${(83.2/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">منطقة تبوك</text>
    <text x="${(78.0/100)*952}" y="${(89.6/100)*578}" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#111827" text-anchor="end" dominant-baseline="middle">شركة غضى التجارية</text>
  </svg>`;

  const mqSvgBuf = await sharp(Buffer.from(mqSvg)).png().toBuffer();
  const mqResult = await sharp('public/templates/saudi-muqeem-id-blank.jpg')
    .composite([
      { input: photo, left: photoLeft, top: photoTop },
      { input: mqSvgBuf, left: 0, top: 0 },
    ])
    .toFile('scripts/test_mq_result.png');

  console.log('Generated scripts/test_mq_result.png');
}

renderCardComparison();
