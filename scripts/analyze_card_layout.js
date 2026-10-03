// Registers a reference screenshot (sample) against the blank template and
// extracts the bounding boxes of the filled-in value text in blank-template pixel coords.
// Usage: node scripts/analyze_card_layout.js muqeem|license
const sharp = require('sharp');

const which = process.argv[2] || 'muqeem';
const files = {
  muqeem: ['public/templates/saudi-muqeem-id-sample.jpg', 'public/templates/saudi-muqeem-id-blank.jpg'],
  license: ['public/templates/saudi-driving-license-sample.jpg', 'public/templates/saudi-driving-license-blank.jpg'],
};

async function gray(path, resizeW) {
  let img = sharp(path).greyscale();
  if (resizeW) img = img.resize({ width: resizeW });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, c: info.channels };
}

async function main() {
  const [samplePath, blankPath] = files[which];
  const S = await gray(samplePath);
  const B0 = await gray(blankPath);

  // 1. Registration: brute force scale + offset using the label column on the right side
  let best = { err: Infinity };
  if (process.env.REG) {
    // REG="s,ox,oy" skips the brute-force search
    const [rs, rox, roy] = process.env.REG.split(',').map(Number);
    const bw = Math.round(B0.w * rs);
    const Bt = await gray(blankPath, bw);
    best = { err: 0, s: rs, sy: Bt.h / B0.h, ox: rox, oy: roy, bw, bh: Bt.h };
  }
  for (let s = 0.62; s <= 0.67 && !process.env.REG; s += 0.0025) {
    const bw = Math.round(B0.w * s);
    const B = await gray(blankPath, bw);
    const sy = B.h / B0.h;
    // region in blank (natural px) containing only static labels / header
    const rx0 = Math.round(560 * s), rx1 = Math.round(940 * s);
    const ry0 = Math.round(10 * sy), ry1 = Math.round(120 * sy);
    for (let ox = 200; ox <= 240; ox++) {
      for (let oy = 30; oy <= 70; oy++) {
        let err = 0, n = 0;
        for (let y = ry0; y < ry1; y += 1) {
          for (let x = rx0; x < rx1; x += 1) {
            const sx = x + ox, syy = y + oy;
            if (sx >= S.w || syy >= S.h) continue;
            err += Math.abs(S.data[(syy * S.w + sx) * S.c] - B.data[(y * B.w + x) * B.c]);
            n++;
          }
        }
        err /= n;
        if (err < best.err) best = { err, s, sy, ox, oy, bw, bh: B.h };
      }
    }
  }
  console.log('Registration:', best);

  const { s, sy, ox, oy } = best;
  const Bfit = await gray(blankPath, best.bw);

  // 2. Value pixels: dark in sample, light in blank at same location, inside data area (right of photo)
  const mask = new Uint8Array(S.w * S.h);
  const x0 = Math.round(300 * s) + ox; // right of photo/QR block
  for (let y = oy + Math.round(120 * sy); y < oy + Math.round(570 * sy) && y < S.h; y++) {
    for (let x = x0; x < ox + Math.round(940 * s) && x < S.w; x++) {
      const v = S.data[(y * S.w + x) * S.c];
      const bx = x - ox, by = y - oy;
      const bv = Bfit.data[(by * Bfit.w + bx) * Bfit.c];
      if (v < Number(process.env.TH || 110) && bv > 150) mask[y * S.w + x] = 1;
    }
  }

  // 3. Row clustering via horizontal projection
  const rows = [];
  let inRow = false, start = 0;
  for (let y = 0; y < S.h; y++) {
    let cnt = 0;
    for (let x = 0; x < S.w; x++) cnt += mask[y * S.w + x];
    if (cnt > 1 && !inRow) { inRow = true; start = y; }
    if (cnt <= 1 && inRow) { inRow = false; if (y - start > 3) rows.push([start, y - 1]); }
  }

  const toBx = (x) => (x - ox) / s;
  const toBy = (y) => (y - oy) / sy;

  for (const [ya, yb] of rows) {
    // column clustering inside row (gap > 12px sample => separate segments)
    const cols = [];
    let inC = false, cs = 0, gap = 0, last = 0;
    for (let x = 0; x < S.w; x++) {
      let cnt = 0;
      for (let y = ya; y <= yb; y++) cnt += mask[y * S.w + x];
      if (cnt > 0) {
        if (!inC) { inC = true; cs = x; }
        last = x; gap = 0;
      } else if (inC) {
        gap++;
        if (gap > 12) { inC = false; if (last - cs > 3) cols.push([cs, last]); }
      }
    }
    if (inC && last - cs > 3) cols.push([cs, last]);
    for (const [xa, xb] of cols) {
      let sya = yb, syb = ya;
      for (let y = ya; y <= yb; y++)
        for (let x = xa; x <= xb; x++)
          if (mask[y * S.w + x]) { if (y < sya) sya = y; if (y > syb) syb = y; }
      const L = toBx(xa), R = toBx(xb), T = toBy(sya), Bm = toBy(syb);
      console.log(
        `row y=${T.toFixed(0)}-${Bm.toFixed(0)} (h=${(Bm - T).toFixed(1)}, cy=${((T + Bm) / 2).toFixed(1)} => ${(((T + Bm) / 2) / 578 * 100).toFixed(2)}%)  x=${L.toFixed(0)}-${R.toFixed(0)} (w=${(R - L).toFixed(0)})  left%=${(L / 952 * 100).toFixed(2)} right%=${(R / 952 * 100).toFixed(2)}`
      );
    }
  }
}

main().catch(console.error);
