import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Template, TemplateField, PersonRecord } from '../types/template';

// Cache loaded images to make re-rendering ultra fast
const imageCache = new Map<string, HTMLImageElement>();

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
  if (field.key === 'company') return person.company;
  if (field.key === 'email') return person.email;
  if (field.key === 'qr') {
    // Return encoded verification URL or structured payload
    return `https://verify.cert.io/v/${person.code}?id=${person.id}&name=${encodeURIComponent(person.name)}`;
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
        document.fonts.load('400 14px "Almarai"'),
        document.fonts.load('700 14px "Almarai"'),
        document.fonts.load('600 14px "Inter"'),
        document.fonts.load('700 14px "Inter"'),
        document.fonts.load('400 14px "Tajawal"'),
        document.fonts.load('700 14px "Tajawal"'),
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

      ctx.direction = 'ltr';
      ctx.font = `${field.fontStyle} ${field.fontWeight} ${fontSize}px "${field.fontFamily}", "Almarai", "Tajawal", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

      // Auto-fit: only shrink if text exceeds container and available space
      let textWidth = ctx.measureText(text).width;
      const maxAllowedWidth = Math.max(containerWidth, (field.width / 100) * width, 320 * scaleFactor);
      if (textWidth > maxAllowedWidth && maxAllowedWidth > 50) {
        const reduction = maxAllowedWidth / textWidth;
        fontSize = Math.max(12, fontSize * reduction);
        ctx.font = `${field.fontStyle} ${field.fontWeight} ${fontSize}px "${field.fontFamily}", "Almarai", "Tajawal", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        textWidth = ctx.measureText(text).width;
      }

      ctx.textAlign = field.textAlign;
      ctx.textBaseline = 'middle';

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
        const pillY = centerY - pillH / 2;

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
      const boxW = containerWidth;
      const boxH = ((field.height || field.width) / 100) * height;
      const boxX = centerX - boxW / 2;
      const boxY = centerY - boxH / 2;

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
        drawImageProp(ctx, imgToDraw, boxX, boxY, boxW, boxH);
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

// Draw image covering box while maintaining aspect ratio (object-fit: cover)
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  const aspect = nw / nh;
  const targetAspect = w / h;

  let sx = 0,
    sy = 0,
    sw = nw,
    sh = nh;

  if (aspect > targetAspect) {
    sw = nh * targetAspect;
    sx = (nw - sw) / 2;
  } else {
    sh = nw / targetAspect;
    sy = (nh - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
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
