const fs = require('fs');
const path = require('path');

async function download() {
  const fontDir = path.join(__dirname, '../public/fonts');

  const list = [
    { name: 'Tajawal-Regular.ttf', url: 'https://fonts.gstatic.com/s/tajawal/v12/Iurf6YBj_oCad4k1l5qkLrY.ttf' },
    { name: 'Almarai-Regular.ttf', url: 'https://fonts.gstatic.com/s/almarai/v19/tssoApxBaigK_hnnS-Kg.ttf' },
    { name: 'Inter-Regular.ttf', url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf' },
    { name: 'Inter-Bold.ttf', url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf' },
  ];

  for (const item of list) {
    const filePath = path.join(fontDir, item.name);
    if (!fs.existsSync(filePath)) {
      console.log('Downloading', item.name, '...');
      const res = await fetch(item.url);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      console.log('Saved', item.name, 'size:', buf.length, 'bytes');
    }
  }
}

download().catch(console.error);
