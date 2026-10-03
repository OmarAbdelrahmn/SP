const sharp = require('sharp');

async function measureTextWidths() {
  const tests = [
    { label: 'Arabic Name', text: 'اسلام حماده فؤاد عبد الرحمن', font: 'Arial', size: 31.5, weight: 'bold' },
    { label: 'English Name', text: 'ESLAM HAMADA FOUAD ABDELRAHMAN', font: 'Arial', size: 27.5, weight: '500' },
    { label: 'DL ID EN', text: '2579236403', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL ID AR', text: '٢٥٧٩٢٣٦٤٠٣', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Lic Type EN', text: 'Light Transport', font: 'Arial', size: 22, weight: 'bold' },
    { label: 'DL Lic Type AR', text: 'نقل خفيف', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Issue Date EN', text: '02/04/2026', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Issue Date AR', text: '٢٠٢٦/٠٤/٠٢', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL DOB EN', text: '01/12/1999', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL DOB AR', text: '١٩٩٩/١٢/٠١', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Nation EN', text: 'Egypt', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Nation AR', text: 'مصر', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Exp Date EN', text: '06/02/2031', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Exp Date AR', text: '٢٠٣١/٠٢/٠٦', font: 'Arial', size: 23, weight: 'bold' },
    { label: 'DL Blood Type', text: 'A+', font: 'Arial', size: 23, weight: 'bold' },
    // Muqeem
    { label: 'MQ Place of Issue', text: 'موقع بوابة الوزارة الإلكترونية', font: 'Arial', size: 19, weight: 'bold' },
    { label: 'MQ Profession', text: 'سائق شاحنة صغيرة', font: 'Arial', size: 21, weight: 'bold' },
    { label: 'MQ Work Place', text: 'منطقة تبوك', font: 'Arial', size: 21, weight: 'bold' },
    { label: 'MQ Employer Name', text: 'شركة غضى التجارية', font: 'Arial', size: 21, weight: 'bold' },
  ];

  for (const t of tests) {
    const svg = `<svg width="1000" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="50" y="50" font-family="${t.font}" font-size="${t.size}" font-weight="${t.weight}" fill="black">${t.text}</text>
    </svg>`;
    const { data, info } = await sharp(Buffer.from(svg)).raw().toBuffer({ resolveWithObject: true });
    let minX = 9999, maxX = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        if (data[idx] < 100) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    const w = maxX - minX + 1;
    const wPct = ((w / 952) * 100).toFixed(2);
    console.log(`${t.label}: rendered width = ${w}px (${wPct}% of 952 card width)`);
  }
}
measureTextWidths();
