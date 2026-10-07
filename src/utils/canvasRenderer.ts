import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Template, TemplateField, PersonRecord } from '../types/template';

// Cache loaded images to make re-rendering ultra fast
const imageCache = new Map<string, HTMLImageElement>();
// Cache trimmed images to avoid re-analyzing pixels repeatedly
const trimmedImageCache = new WeakMap<HTMLImageElement, HTMLCanvasElement | HTMLImageElement>();

export function clearImageCache(src?: string) {
  if (src) {
    // Remove both exact and query-parameter variations
    for (const key of Array.from(imageCache.keys())) {
      if (key === src || key.startsWith(src + '?')) {
        const cached = imageCache.get(key);
        if (cached) trimmedImageCache.delete(cached);
        imageCache.delete(key);
      }
    }
  } else {
    imageCache.clear();
  }
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) return cached;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Return fallback placeholder rather than throwing
      const placeholder = createFallbackImage();
      resolve(placeholder);
    };
    img.src = src;
  });
}

function createFallbackImage(): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ID', 100, 100);
  }
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

export function toArabicNumerals(str: string | number | undefined | null): string {
  if (!str) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str)
    .replace(/[0-9]/g, (w) => arabicDigits[+w])
    .replace(/-/g, '/');
}

export function resolveFieldValue(field: TemplateField, person: PersonRecord): string {
  if (field.key === 'photo') {
    return person.photoUrl || '/templates/sample-person.jpg';
  }
  if (field.key === 'name') return person.name;
  if (field.key === 'nameAr') return person.customFields?.nameAr || person.name;
  if (field.key === 'nameEn') return person.customFields?.nameEn || 'ESLAM HAMADA FOUAD ABDELRAHMAN';
  if (field.key === 'title') return person.title;
  if (field.key === 'date') return person.date;
  if (field.key === 'code') return person.code;
  if (field.key === 'company') {
    if (field.id === 'f-tga-comp-en' || field.name.includes('(EN)')) {
      return (
        person.customFields?.companyEn ||
        (person.company && !/[\u0600-\u06FF]/.test(person.company) ? person.company : 'Ghada Company Commercial')
      );
    }
    return person.company;
  }
  if (field.key === 'email') return person.email;
  if (field.key === 'qr' || field.key === 'operationCardQr') {
    // Return encoded verification URL or structured payload
    return (
      person.customFields?.operationCardQr ||
      person.customFields?.qrUrl ||
      `https://naql.logisti.sa/validate-operation-card?token=${person.customFields?.token || '12aeed0c-87b8-4adc-8147-49b3d4d8901d'}`
    );
  }
  if (person.customFields && person.customFields[field.key]) {
    return person.customFields[field.key];
  }

  // Automatic fallbacks for Arabic card keys
  if (field.key === 'idNumberEn') return person.customFields?.driverId || person.code || '2579236403';
  if (field.key === 'idNumberAr') return toArabicNumerals(person.customFields?.driverId || person.code || '2579236403');
  if (field.key === 'licenseTypeEn') return person.customFields?.licenseTypeEn || 'Light Transport';
  if (field.key === 'licenseTypeAr') return person.customFields?.licenseTypeAr || 'نقل خفيف';
  if (field.key === 'issueDateEn') return person.date?.replace(/-/g, '/') || '02/04/2026';
  if (field.key === 'issueDateAr') return toArabicNumerals(person.date || '2026/04/02');
  if (field.key === 'dobEn') return person.customFields?.dobEn || '01/12/1999';
  if (field.key === 'dobAr') return toArabicNumerals(person.customFields?.dobEn || '1999/12/01');
  if (field.key === 'nationalityEn') return person.customFields?.nationalityEn || 'Egypt';
  if (field.key === 'nationalityAr') return person.customFields?.nationalityAr || 'مصر';
  if (field.key === 'expiryDateEn') return person.customFields?.expiryDate?.replace(/-/g, '/') || '06/02/2031';
  if (field.key === 'expiryDateAr') return toArabicNumerals(person.customFields?.expiryDate || '2031/02/06');
  if (field.key === 'bloodType') return person.customFields?.bloodType || 'A+';

  // Muqeem fallbacks
  if (field.key === 'pobAr') return person.customFields?.pobAr || 'مصر';
  if (field.key === 'religionAr') return person.customFields?.religionAr || 'الاسلام';
  if (field.key === 'professionAr') return person.customFields?.professionAr || 'سائق شاحنة صغيرة';
  if (field.key === 'employerIdAr') return toArabicNumerals(person.customFields?.moiNumber || '7037427601');
  if (field.key === 'issuePlaceAr') return person.customFields?.issuePlaceAr || 'موقع بوابة الوزارة الإلكترونية';
  if (field.key === 'workPlaceAr') return person.customFields?.cityAr ? `منطقة ${person.customFields.cityAr}` : 'منطقة تبوك';
  if (field.key === 'employerNameAr') return person.customFields?.companyAr || 'شركة غضى التجارية';

  // Operation Card (بطاقة تشغيل) fallbacks
  if (field.key === 'operationCardNo') return person.customFields?.operationCardNo || person.code || '38-00075448';
  if (field.key === 'operationCardIssueDate') return person.customFields?.operationCardIssueDate || person.date || '2026-04-27';
  if (field.key === 'operationCardExpiryDate') return person.customFields?.operationCardExpiryDate || person.customFields?.expiryDate || '2027-04-29';
  if (field.key === 'operationCardRenewDate') return person.customFields?.operationCardRenewDate || 'null';
  if (field.key === 'vehicleMaker') return person.customFields?.vehicleMaker || 'سوزوكي';
  if (field.key === 'vehicleModel') return person.customFields?.vehicleModel || 'ديز اير';
  if (field.key === 'plateNumber') return person.customFields?.plateNumber || '8781 أ أ ر';
  if (field.key === 'vehicleColor') return person.customFields?.vehicleColor || 'فضي';
  if (field.key === 'vehicleYear') return person.customFields?.vehicleYear || '2024';
  if (field.key === 'companyEn') return person.customFields?.companyEn || 'Ghada Company Cars Rental';
  if (field.key === 'moiNumber') return person.customFields?.moiNumber || '7037427601';
  if (field.key === 'licenseNumber') return person.customFields?.licenseNumber || '38/00021153';
  if (field.key === 'cityEn') return person.customFields?.cityEn || 'Tabuk';
  if (field.key === 'cityAr') return person.customFields?.cityAr || 'تبوك';
  if (field.key === 'licenseIssueDate') return person.customFields?.licenseIssueDate || '2025-12-08';
  if (field.key === 'licenseExpiryDate') return person.customFields?.licenseExpiryDate || '2028-12-08';

  // If field has custom prefix and no data key value
  return field.prefix || '';
}

function applyTransform(text: string, transform: TemplateField['textTransform']): string {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  if (transform === 'capitalize') {
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return text;
}

export async function renderTemplateToCanvas(
  canvas: HTMLCanvasElement,
  template: Template,
  person: PersonRecord,
  options: {
    highlightFieldId?: string | null;
    scaleMultiplier?: number;
  } = {}
): Promise<void> {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Make sure fonts are loaded in document if supported
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await Promise.all([
        document.fonts.load('400 14px "Alyamama"'),
        document.fonts.load('700 14px "Alyamama"'),
        document.fonts.load('400 14px "Noto Naskh Arabic"'),
        document.fonts.load('700 14px "Noto Naskh Arabic"'),
        document.fonts.load('400 14px "Amiri"'),
        document.fonts.load('700 14px "Amiri"'),
        document.fonts.load('400 14px "Noto Kufi Arabic"'),
        document.fonts.load('700 14px "Noto Kufi Arabic"'),
        document.fonts.load('400 14px "Frutiger LT Arabic"'),
        document.fonts.load('600 14px "Frutiger LT Arabic"'),
        document.fonts.load('700 14px "Frutiger LT Arabic"'),
        document.fonts.load('800 14px "Frutiger LT Arabic"'),
        document.fonts.load('400 14px "Simplified Arabic"'),
        document.fonts.load('600 14px "Simplified Arabic"'),
        document.fonts.load('700 14px "Simplified Arabic"'),
        document.fonts.load('400 14px "Arial"'),
        document.fonts.load('500 14px "Arial"'),
        document.fonts.load('600 14px "Arial"'),
        document.fonts.load('700 14px "Arial"'),
        document.fonts.load('400 14px "Tajawal"'),
        document.fonts.load('700 14px "Tajawal"'),
        document.fonts.load('400 14px "Inter"'),
        document.fonts.load('600 14px "Inter"'),
        document.fonts.load('700 14px "Inter"'),
        document.fonts.load('400 14px "Almarai"'),
        document.fonts.load('700 14px "Almarai"'),
        document.fonts.ready,
      ]);
    } catch {
      // Continue anyway
    }
  }

  // Load and draw base template image
  const baseImg = await loadImage(template.imageUrl);
  const width = template.naturalWidth || baseImg.naturalWidth || 1200;
  const height = template.naturalHeight || baseImg.naturalHeight || 800;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(baseImg, 0, 0, width, height);

  // Sort fields by zIndex
  const sortedFields = [...template.fields].sort((a, b) => a.zIndex - b.zIndex);

  for (const field of sortedFields) {
    ctx.save();
    ctx.globalAlpha = field.opacity ?? 1;

    // Calculate center coordinates
    const centerX = (field.x / 100) * width;
    const centerY = (field.y / 100) * height;
    const containerWidth = (field.width / 100) * width;

    if (field.type === 'text') {
      const rawVal = resolveFieldValue(field, person);
      let text = rawVal;
      if (field.prefix && !text.startsWith(field.prefix)) {
        text = field.prefix + text;
      }
      if (field.suffix && !text.endsWith(field.suffix)) {
        text = text + field.suffix;
      }
      text = applyTransform(text, field.textTransform);

      // Scaled font calculation relative to template natural width
      const refWidth = template.naturalWidth || 1000;
      const scaleFactor = width / refWidth;
      let fontSize = field.fontSize * scaleFactor;

      // Ensure specific field font is loaded in browser
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          await document.fonts.load(`${field.fontWeight} ${fontSize}px "${field.fontFamily}"`);
        } catch {
          // Continue
        }
      }

      // Text direction is decided by the CONTENT, not the alignment: Latin values placed in a
      // right-aligned (Arabic) column such as blood type "A+" must stay LTR, otherwise the
      // bidi algorithm moves the neutral "+" to the front and renders "+A".
      // (textAlign 'left'/'right' are absolute in canvas, so alignment is unaffected.)
      const isArabic = /[\u0600-\u06FF]/.test(text);
      const hasLatin = /[A-Za-z]/.test(text);
      ctx.direction = isArabic || (field.textAlign === 'right' && !hasLatin) ? 'rtl' : 'ltr';

      // Font stack tailored to field language
      const isEnglish = !isArabic && /[a-zA-Z]/.test(text);
      const fontStack = isEnglish
        ? `"${field.fontFamily}", "Arial", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`
        : `"${field.fontFamily}", "Alyamama", "Noto Naskh Arabic", "Frutiger LT Arabic", "Simplified Arabic", "Arial", "Tajawal", "Almarai", "Cairo", "Segoe UI", Tahoma, sans-serif`;

      ctx.font = `${field.fontStyle} ${field.fontWeight} ${fontSize}px ${fontStack}`;

      // Letter spacing (supported by modern Chromium/Firefox/Safari canvas)
      const spacingPx = (field.letterSpacing || 0) * scaleFactor;
      if ('letterSpacing' in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacingPx}px`;
      }

      // Auto-fit: only shrink if text exceeds container and available space
      let textWidth = ctx.measureText(text).width;
      const maxAllowedWidth = Math.max(containerWidth, (field.width / 100) * width, 320 * scaleFactor);
      if (textWidth > maxAllowedWidth && maxAllowedWidth > 50) {
        const reduction = maxAllowedWidth / textWidth;
        fontSize = Math.max(12, fontSize * reduction);
        ctx.font = `${field.fontStyle} ${field.fontWeight} ${fontSize}px ${fontStack}`;
        textWidth = ctx.measureText(text).width;
      }

      ctx.textAlign = field.textAlign;
      // 'alphabetic' pins y to the exact text baseline (used for official ID card layouts)
      ctx.textBaseline = field.textBaseline || 'middle';

      // Drop shadow
      if (field.shadowColor && field.shadowBlur) {
        ctx.shadowColor = field.shadowColor;
        ctx.shadowBlur = field.shadowBlur * scaleFactor;
        ctx.shadowOffsetX = (field.shadowOffsetX || 0) * scaleFactor;
        ctx.shadowOffsetY = (field.shadowOffsetY || 0) * scaleFactor;
      }

      // Background pill container (optional)
      if (field.hasBackground) {
        const padX = (field.paddingX || 16) * scaleFactor;
        const padY = (field.paddingY || 8) * scaleFactor;
        const pillW = textWidth + padX * 2;
        const pillH = fontSize + padY * 2;
        let pillX = centerX - pillW / 2;
        if (field.textAlign === 'left') pillX = centerX - padX;
        if (field.textAlign === 'right') pillX = centerX - pillW + padX;
        const pillY = field.textBaseline === 'alphabetic' ? centerY - fontSize * 0.75 - padY : centerY - pillH / 2;

        ctx.fillStyle = field.backgroundColor || 'rgba(255,255,255,0.9)';
        const radius = (field.borderRadius || 6) * scaleFactor;
        drawRoundedRect(ctx, pillX, pillY, pillW, pillH, radius);
        ctx.fill();

        if (field.borderWidth && field.borderColor) {
          ctx.lineWidth = field.borderWidth * scaleFactor;
          ctx.strokeStyle = field.borderColor;
          ctx.stroke();
        }
      }

      ctx.fillStyle = field.color;
      ctx.fillText(text, centerX, centerY);
    } else if (field.type === 'image') {
      const boxW = Math.round(containerWidth);
      const boxH = Math.round(((field.height || field.width) / 100) * height);
      const boxX = Math.round(centerX - boxW / 2);
      const boxY = Math.round(centerY - boxH / 2);

      const photoUrl = resolveFieldValue(field, person);
      let imgToDraw: HTMLImageElement | null = null;
      if (photoUrl) {
        try {
          imgToDraw = await loadImage(photoUrl);
        } catch {
          imgToDraw = null;
        }
      }

      ctx.save();
      const radius = (field.borderRadius || 8) * (width / 1000);
      if (field.imageShape === 'circle') {
        const r = Math.min(boxW, boxH) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else if (field.imageShape === 'rounded') {
        drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
        ctx.clip();
      } else {
        ctx.beginPath();
        ctx.rect(boxX, boxY, boxW, boxH);
        ctx.closePath();
        ctx.clip();
      }

      if (imgToDraw) {
        const zoom = (person.photoZoom ?? (person.customFields?.photoZoom ? Number(person.customFields.photoZoom) : 1)) || 1;
        const offsetX = (person.photoOffsetX ?? (person.customFields?.photoOffsetX ? Number(person.customFields.photoOffsetX) : 0)) || 0;
        const offsetY = (person.photoOffsetY ?? (person.customFields?.photoOffsetY ? Number(person.customFields.photoOffsetY) : 0)) || 0;
        drawImageProp(ctx, imgToDraw, boxX, boxY, boxW, boxH, zoom, offsetX, offsetY);
      } else {
        // Fallback stylish avatar box
        ctx.fillStyle = '#475569';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${boxH * 0.35}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initials = person.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('');
        ctx.fillText(initials || 'ID', centerX, centerY);
      }
      ctx.restore();

      // Draw border around photo if specified
      if (field.borderWidth && field.borderColor) {
        ctx.save();
        ctx.lineWidth = field.borderWidth * (width / 1000);
        ctx.strokeStyle = field.borderColor;
        if (field.imageShape === 'circle') {
          const r = Math.min(boxW, boxH) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          drawRoundedRect(ctx, boxX, boxY, boxW, boxH, radius);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else if (field.type === 'qr') {
      const qrW = containerWidth;
      const qrH = ((field.height || field.width) / 100) * height;
      const qrX = centerX - qrW / 2;
      const qrY = centerY - qrH / 2;

      const qrPayload = resolveFieldValue(field, person);
      try {
        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
          margin: 1,
          width: Math.round(qrW),
          color: {
            dark: field.color || '#000000',
            light: field.backgroundColor || '#ffffff',
          },
        });
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, qrX, qrY, qrW, qrH);
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    }

    ctx.restore();
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}


/**
 * Automatically detects and trims uniform white/light or transparent border bands from an image,
 * ensuring any uploaded photo or picture fits fully into the card frame without white margins.
 */
export function trimImageBorders(img: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement | HTMLImageElement {
  if (typeof document === 'undefined') return img;
  if ('complete' in img && trimmedImageCache.has(img as HTMLImageElement)) {
    return trimmedImageCache.get(img as HTMLImageElement)!;
  }

  const nw = 'naturalWidth' in img ? (img.naturalWidth || img.width) : img.width;
  const nh = 'naturalHeight' in img ? (img.naturalHeight || img.height) : img.height;
  if (!nw || !nh || nw < 10 || nh < 10) return img;

  try {
    const canvas = document.createElement('canvas');
    // Scale down for ultra-fast border detection (max 300px)
    const maxDim = 300;
    const scale = Math.min(1, maxDim / Math.max(nw, nh));
    const sw = Math.max(10, Math.round(nw * scale));
    const sh = Math.max(10, Math.round(nh * scale));

    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return img;

    ctx.drawImage(img, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    // A pixel is blank if transparent (alpha < 25) or near-white (RGB all > 238)
    const isBlank = (x: number, y: number): boolean => {
      const idx = (y * sw + x) * 4;
      if (data[idx + 3] < 25) return true;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      return r > 238 && g > 238 && b > 238;
    };

    // Scan top margin (up to 30% of height)
    let top = 0;
    const maxTop = Math.floor(sh * 0.3);
    for (let y = 0; y < maxTop; y++) {
      let blankCount = 0;
      for (let x = 0; x < sw; x++) {
        if (isBlank(x, y)) blankCount++;
      }
      if (blankCount / sw >= 0.95) top = y + 1;
      else break;
    }

    // Scan bottom margin (up to 30% of height)
    let bottom = sh;
    const maxBottom = Math.floor(sh * 0.7);
    for (let y = sh - 1; y >= maxBottom; y--) {
      let blankCount = 0;
      for (let x = 0; x < sw; x++) {
        if (isBlank(x, y)) blankCount++;
      }
      if (blankCount / sw >= 0.95) bottom = y;
      else break;
    }

    // Scan left margin (up to 30% of width)
    let left = 0;
    const maxLeft = Math.floor(sw * 0.3);
    for (let x = 0; x < maxLeft; x++) {
      let blankCount = 0;
      for (let y = 0; y < sh; y++) {
        if (isBlank(x, y)) blankCount++;
      }
      if (blankCount / sh >= 0.95) left = x + 1;
      else break;
    }

    // Scan right margin (up to 30% of width)
    let right = sw;
    const maxRight = Math.floor(sw * 0.7);
    for (let x = sw - 1; x >= maxRight; x--) {
      let blankCount = 0;
      for (let y = 0; y < sh; y++) {
        if (isBlank(x, y)) blankCount++;
      }
      if (blankCount / sh >= 0.95) right = x;
      else break;
    }

    // If nothing trimmed, return original
    if (top === 0 && bottom === sh && left === 0 && right === sw) {
      if ('complete' in img) trimmedImageCache.set(img as HTMLImageElement, img);
      return img;
    }

    // Map back to full-res coordinates
    const realLeft = Math.round(left / scale);
    const realTop = Math.round(top / scale);
    const realRight = Math.min(nw, Math.round(right / scale));
    const realBottom = Math.min(nh, Math.round(bottom / scale));
    const cropW = Math.max(10, realRight - realLeft);
    const cropH = Math.max(10, realBottom - realTop);

    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = cropW;
    trimmedCanvas.height = cropH;
    const tCtx = trimmedCanvas.getContext('2d');
    if (!tCtx) return img;

    tCtx.drawImage(img, realLeft, realTop, cropW, cropH, 0, 0, cropW, cropH);

    if ('complete' in img) trimmedImageCache.set(img as HTMLImageElement, trimmedCanvas);
    return trimmedCanvas;
  } catch {
    return img;
  }
}

// Draw image covering box while maintaining aspect ratio (object-fit: cover) with zoom and position offsets
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number,
  zoom: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0
) {
  const source = trimImageBorders(img);
  const nw = 'naturalWidth' in source ? (source.naturalWidth || source.width) : source.width;
  const nh = 'naturalHeight' in source ? (source.naturalHeight || source.height) : source.height;
  if (!nw || !nh) return;

  const aspect = nw / nh;
  const targetAspect = w / h;

  let baseSw = nw;
  let baseSh = nh;
  let baseSx = 0;
  let baseSy = 0;

  if (aspect > targetAspect) {
    // Image is wider than target frame: crop width, center horizontally
    baseSw = nh * targetAspect;
    baseSx = (nw - baseSw) / 2;
  } else {
    // Image is taller than target frame: crop height
    // Biasing slightly towards the top (0.35) keeps heads/faces nicely centered without cutting hair
    baseSh = nw / targetAspect;
    baseSy = (nh - baseSh) * 0.35;
  }

  // Safe zoom clamp: between 0.5 and 3.0
  const z = Math.max(0.5, Math.min(3.0, zoom || 1.0));
  const sw = baseSw / z;
  const sh = baseSh / z;

  // Center with user offsets (-50% to +50% range)
  const cx = baseSx + baseSw / 2 - ((offsetX || 0) / 100) * baseSw;
  const cy = baseSy + baseSh / 2 - ((offsetY || 0) / 100) * baseSh;

  const sx = cx - sw / 2;
  const sy = cy - sh / 2;

  ctx.drawImage(source, sx, sy, sw, sh, x, y, w, h);
}

// Export single person image as Blob (PNG or JPEG)
export async function exportSingleImage(
  template: Template,
  person: PersonRecord,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.95
): Promise<Blob> {
  const offscreenCanvas = document.createElement('canvas');
  await renderTemplateToCanvas(offscreenCanvas, template, person);

  return new Promise((resolve, reject) => {
    offscreenCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      format,
      quality
    );
  });
}

// Batch export all people as a ZIP file with high-res images
export async function exportBatchZip(
  template: Template,
  people: PersonRecord[],
  onProgress?: (current: number, total: number, personName: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(template.name.replace(/[^a-zA-Z0-9_-]/g, '_')) || zip;

  const total = people.length;
  for (let i = 0; i < total; i++) {
    const person = people[i];
    if (onProgress) {
      onProgress(i + 1, total, person.name);
    }

    const blob = await exportSingleImage(template, person, 'image/png');
    const safeName = person.name.replace(/[^a-zA-Z0-9_-]/g, '_') || `person_${i + 1}`;
    const filename = `${template.category}_${safeName}_${person.code || i + 1}.png`;
    folder.file(filename, blob);
  }

  return zip.generateAsync({ type: 'blob' });
}
