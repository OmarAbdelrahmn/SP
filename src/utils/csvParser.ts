import { PersonRecord, Template } from '../types/template';

export interface ParsedCsvResult {
  headers: string[];
  records: PersonRecord[];
  rawRowCount: number;
}

export function parseCsvText(csvContent: string): ParsedCsvResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], records: [], rawRowCount: 0 };
  }

  // Detect delimiter (, or \t or ;)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  // Parse lines taking quoted values into account
  const parsedRows: string[][] = lines.map((line) => splitCsvLine(line, delimiter));

  // Determine if first row is header
  const hasHeader = detectHeader(parsedRows[0]);
  const headers = hasHeader
    ? parsedRows[0].map((h) => h.toLowerCase().trim())
    : ['name', 'code', 'date', 'company', 'title'];

  const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows;

  // Header column index finder helper
  const findColIndex = (...candidates: string[]): number => {
    return headers.findIndex((h) =>
      candidates.some((c) => h === c || h.includes(c))
    );
  };

  const nameIdx = findColIndex('driver name', 'name', 'full name', 'اسم السائق', 'recipient');
  const codeIdx = findColIndex('card number', 'code', 'رقم بطاقة السائق', 'بطاقة رقم', 'id number', 'serial');
  const driverIdIdx = findColIndex('driver id', 'national id', 'رقم هوية السائق', 'هوية السائق', 'iqama');
  const dateIdx = findColIndex('issue date', 'date', 'تاريخ الإصدار');
  const expiryDateIdx = findColIndex('expiration date', 'expiry date', 'تاريخ الانتهاء');
  const catEnIdx = findColIndex('card category en', 'category en', 'category');
  const catArIdx = findColIndex('card category ar', 'category ar', 'تصنيف البطاقة');

  const licNoIdx = findColIndex('license number', 'رقم الترخيص');
  const cityEnIdx = findColIndex('city en', 'license city en', 'city');
  const cityArIdx = findColIndex('city ar', 'license city ar', 'مدينة الترخيص');
  const licIssueIdx = findColIndex('license issue date', 'تاريخ إصدار الترخيص');
  const licExpIdx = findColIndex('license expiry date', 'license expiration', 'تاريخ انتهاء الترخيص');
  const actEnIdx = findColIndex('activity type en', 'activity en', 'activity');
  const actArIdx = findColIndex('activity type ar', 'activity ar', 'نوع النشاط');
  const moiIdx = findColIndex('moi number', 'رقم هوية المنشأة', 'moi');
  const compEnIdx = findColIndex('company name en', 'company en', 'company');
  const compArIdx = findColIndex('company name ar', 'company ar', 'اسم المنشأة');

  const records: PersonRecord[] = dataRows.map((cols, idx) => {
    const rawName = nameIdx >= 0 && cols[nameIdx] ? cols[nameIdx] : cols[0] || `Driver ${idx + 1}`;
    const rawCode = codeIdx >= 0 && cols[codeIdx] ? cols[codeIdx] : `38.${(50000000 + idx + 1).toString()}`;
    const rawDate = dateIdx >= 0 && cols[dateIdx] ? cols[dateIdx] : '2026-06-07';
    const rawCompany = compEnIdx >= 0 && cols[compEnIdx] ? cols[compEnIdx] : 'Transport Co';

    const customFields: Record<string, string> = {};

    if (driverIdIdx >= 0 && cols[driverIdIdx]) customFields['driverId'] = cols[driverIdIdx];
    if (expiryDateIdx >= 0 && cols[expiryDateIdx]) customFields['expiryDate'] = cols[expiryDateIdx];
    if (catEnIdx >= 0 && cols[catEnIdx]) customFields['cardCategoryEn'] = cols[catEnIdx];
    if (catArIdx >= 0 && cols[catArIdx]) customFields['cardCategoryAr'] = cols[catArIdx];
    if (licNoIdx >= 0 && cols[licNoIdx]) customFields['licenseNumber'] = cols[licNoIdx];
    if (cityEnIdx >= 0 && cols[cityEnIdx]) customFields['cityEn'] = cols[cityEnIdx];
    if (cityArIdx >= 0 && cols[cityArIdx]) customFields['cityAr'] = cols[cityArIdx];
    if (licIssueIdx >= 0 && cols[licIssueIdx]) customFields['licenseIssueDate'] = cols[licIssueIdx];
    if (licExpIdx >= 0 && cols[licExpIdx]) customFields['licenseExpiryDate'] = cols[licExpIdx];
    if (actEnIdx >= 0 && cols[actEnIdx]) customFields['activityTypeEn'] = cols[actEnIdx];
    if (actArIdx >= 0 && cols[actArIdx]) customFields['activityTypeAr'] = cols[actArIdx];
    if (moiIdx >= 0 && cols[moiIdx]) customFields['moiNumber'] = cols[moiIdx];
    if (compArIdx >= 0 && cols[compArIdx]) customFields['companyAr'] = cols[compArIdx];
    if (compEnIdx >= 0 && cols[compEnIdx]) customFields['companyEn'] = cols[compEnIdx];

    // Collect any other remaining columns as custom fields
    headers.forEach((h, hIdx) => {
      if (!customFields[h] && cols[hIdx] && hIdx !== nameIdx && hIdx !== codeIdx && hIdx !== dateIdx) {
        customFields[h] = cols[hIdx];
      }
    });

    return {
      id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      name: rawName.trim(),
      title: 'Driver / سائق',
      company: rawCompany.trim(),
      date: rawDate.trim(),
      code: rawCode.trim(),
      email: '',
      customFields,
      isSelected: true,
    };
  });

  return {
    headers,
    records,
    rawRowCount: dataRows.length,
  };
}

function detectHeader(firstRow: string[]): boolean {
  const commonKeywords = [
    'name',
    'driver',
    'سائق',
    'بطاقة',
    'card',
    'code',
    'title',
    'role',
    'company',
    'organization',
    'date',
    'id',
    'license',
    'ترخيص',
  ];
  return firstRow.some((col) =>
    commonKeywords.some((keyword) => col.toLowerCase().trim().includes(keyword))
  );
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Generate tailored CSV sheet template based on active template
export function generateCsvTemplateForTemplate(template: Template, samplePerson?: PersonRecord): string {
  if (template.id === 'saudi-tga-driver-card') {
    const headers = [
      'Driver Name',
      'Card Number',
      'Driver ID',
      'Issue Date',
      'Expiration Date',
      'Card Category EN',
      'Card Category AR',
      'License Number',
      'City EN',
      'City AR',
      'License Issue Date',
      'License Expiry Date',
      'Activity Type EN',
      'Activity Type AR',
      'MOI Number',
      'Company Name EN',
      'Company Name AR',
    ];

    const sampleRow = [
      samplePerson?.name || 'احمد حسين محمد حسين مهدي',
      samplePerson?.code || '38.00057886',
      samplePerson?.customFields?.driverId || '2628113686',
      samplePerson?.date || '2026-06-07',
      samplePerson?.customFields?.expiryDate || '2027-06-09',
      samplePerson?.customFields?.cardCategoryEn || 'Yearly',
      samplePerson?.customFields?.cardCategoryAr || 'سنوية',
      samplePerson?.customFields?.licenseNumber || '38/00021153',
      samplePerson?.customFields?.cityEn || 'Tabuk',
      samplePerson?.customFields?.cityAr || 'تبوك',
      samplePerson?.customFields?.licenseIssueDate || '2025-12-08',
      samplePerson?.customFields?.licenseExpiryDate || '2028-12-08',
      samplePerson?.customFields?.activityTypeEn || 'Light cargo transport activity',
      samplePerson?.customFields?.activityTypeAr || 'نشاط النقل الخفيف للبضائع',
      samplePerson?.customFields?.moiNumber || '7037427601',
      samplePerson?.company || 'Ghada Company Commercial',
      samplePerson?.customFields?.companyAr || 'شركة غضى التجارية',
    ];

    return `${headers.join(',')}\n"${sampleRow.join('","')}"\n"سعود فهد الشمري","38.00057887","1084920184","2026-07-01","2027-07-01","Yearly","سنوية","38/00029941","Riyadh","الرياض","2026-01-10","2029-01-10","Light cargo transport activity","نشاط النقل الخفيف للبضائع","7011928472","Al-Riyadh Logistics Transport","شركة الرياض للنقل اللوجستي"`;
  }

  // Fallback for general certificates and badges
  const fieldKeys = Array.from(new Set(template.fields.filter((f) => f.key !== 'qr' && !f.key.startsWith('custom:')).map((f) => f.key)));
  const headers = fieldKeys.map((k) => k.toUpperCase());
  const row = fieldKeys.map((k) => (samplePerson ? (samplePerson as any)[k] || samplePerson.customFields?.[k] || `Sample ${k}` : `Sample ${k}`));
  return `${headers.join(',')}\n"${row.join('","')}"`;
}

export const SAMPLE_CSV_TEMPLATE = `Driver Name,Card Number,Driver ID,Issue Date,Expiration Date,Card Category EN,Card Category AR,License Number,City EN,City AR,License Issue Date,License Expiry Date,Activity Type EN,Activity Type AR,MOI Number,Company Name EN,Company Name AR
"احمد حسين محمد حسين مهدي","38.00057886","2628113686","2026-06-07","2027-06-09","Yearly","سنوية","38/00021153","Tabuk","تبوك","2025-12-08","2028-12-08","Light cargo transport activity","نشاط النقل الخفيف للبضائع","7037427601","Ghada Company Commercial","شركة غضى التجارية"
"سعود فهد الشمري","38.00057887","1084920184","2026-07-01","2027-07-01","Yearly","سنوية","38/00029941","Riyadh","الرياض","2026-01-10","2029-01-10","Light cargo transport activity","نشاط النقل الخفيف للبضائع","7011928472","Al-Riyadh Logistics Transport","شركة الرياض للنقل اللوجستي"`;
