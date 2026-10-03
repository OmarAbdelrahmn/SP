const fs = require('fs');
const path = require('path');

async function download() {
  const fontDir = path.join(__dirname, '../public/fonts');
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  const list = [
    { name: 'Tajawal-Bold.ttf', url: 'https://fonts.gstatic.com/s/tajawal/v12/Iurf6YBj_oCad4k1l4qkLrY.ttf' },
    { name: 'Almarai-Bold.ttf', url: 'https://fonts.gstatic.com/s/almarai/v19/tssoApxBaigK_hnnS-aghng.ttf' },
    { name: 'Cairo-Bold.ttf', url: 'https://fonts.gstatic.com/s/cairo/v31/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hAc5W1Q.ttf' },
    { name: 'Inter-SemiBold.ttf', url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf' },
  ];

  for (const item of list) {
    const filePath = path.join(fontDir, item.name);
    console.log('Downloading', item.name, '...');
    const res = await fetch(item.url);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buf);
    console.log('Saved', item.name, 'size:', buf.length, 'bytes');
  }
  console.log('All fonts downloaded to public/fonts/');
}

download().catch(console.error);
