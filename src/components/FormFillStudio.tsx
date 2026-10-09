'use client';

import React, { useRef, useEffect } from 'react';
import { Template, PersonRecord } from '../types/template';
import { renderTemplateToCanvas, toArabicNumerals, trimImageBorders, clearImageCache } from '../utils/canvasRenderer';
import {
  Download,
  Printer,
  Sparkles,
  CreditCard,
  Building2,
  Calendar,
  User,
  Hash,
  ShieldCheck,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Check,
  ZoomIn,
  ZoomOut,
  QrCode,
  Truck,
} from 'lucide-react';


interface FormFillStudioProps {
  template: Template;
  activePerson: PersonRecord;
  onUpdatePerson: (id: string, updates: Partial<PersonRecord>) => void;
  onDownloadCard: () => void;
  templates?: Template[];
  onSelectTemplate?: (templateId: string) => void;
}

export const FormFillStudio: React.FC<FormFillStudioProps> = ({
  template,
  activePerson,
  onUpdatePerson,
  onDownloadCard,
  templates = [],
  onSelectTemplate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update canvas on person or template change, and when fonts finish loading
  useEffect(() => {
    if (!canvasRef.current) return;
    let isMounted = true;

    const render = () => {
      if (canvasRef.current && isMounted) {
        renderTemplateToCanvas(canvasRef.current, template, activePerson).catch((err) => {
          if (isMounted) console.error('Canvas render error in form view:', err);
        });
      }
    };

    render();

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (isMounted) render();
      });
    }

    return () => {
      isMounted = false;
    };
  }, [template, activePerson]);

  const handleCustomFieldChange = (key: string, val: string) => {
    onUpdatePerson(activePerson.id, {
      customFields: {
        ...(activePerson.customFields || {}),
        [key]: val,
      },
    });
  };

  const handleBatchChange = (
    customUpdates: Record<string, string>,
    personUpdates?: Partial<PersonRecord>
  ) => {
    onUpdatePerson(activePerson.id, {
      ...personUpdates,
      customFields: {
        ...(activePerson.customFields || {}),
        ...customUpdates,
      },
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        // Automatically trim white/transparent borders so any uploaded image fits fully into the rectangle
        const img = new Image();
        img.onload = () => {
          try {
            const cleaned = trimImageBorders(img);
            const nw = 'naturalWidth' in cleaned ? (cleaned.naturalWidth || cleaned.width) : cleaned.width;
            const nh = 'naturalHeight' in cleaned ? (cleaned.naturalHeight || cleaned.height) : cleaned.height;
            const canvas = document.createElement('canvas');
            canvas.width = nw;
            canvas.height = nh;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(cleaned, 0, 0);
              const isPng = file.type === 'image/png';
              const optimizedDataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.96);
              onUpdatePerson(activePerson.id, {
                photoUrl: optimizedDataUrl,
                photoZoom: 1,
                photoOffsetX: 0,
                photoOffsetY: 0,
              });
              return;
            }
          } catch {
            // Fallback to raw base64
          }
          onUpdatePerson(activePerson.id, {
            photoUrl: base64,
            photoZoom: 1,
            photoOffsetX: 0,
            photoOffsetY: 0,
          });
        };
        img.onerror = () => {
          onUpdatePerson(activePerson.id, {
            photoUrl: base64,
            photoZoom: 1,
            photoOffsetX: 0,
            photoOffsetY: 0,
          });
        };
        img.src = base64;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetOriginalPhoto = () => {
    clearImageCache('/templates/sample-person.jpg');
    onUpdatePerson(activePerson.id, {
      photoUrl: `/templates/sample-person.jpg?v=${Date.now()}`,
      photoZoom: 1,
      photoOffsetX: 0,
      photoOffsetY: 0,
    });
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${template.name} - ${activePerson.name}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-width: 95vw; max-height: 95vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isDrivingLicense = template.id === 'saudi-driving-license';
  const isMuqeemId = template.id === 'saudi-muqeem-id';
  const isDriverCard = template.id === 'saudi-tga-driver-card';
  const isOperationCard = template.id === 'saudi-tga-operation-card';
  const hasPhoto = template.fields.some((f) => f.type === 'image');
  const custom = activePerson.customFields || {};

  return (
    <div
      dir="rtl"
      style={{
        flex: 1,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-main)',
        fontFamily: "'Almarai', 'Tajawal', sans-serif",
      }}
    >
      {/* Right/Form Pane: Comprehensive Card Data Form */}
      <div
        style={{
          width: '560px',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Form Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                تعبئة البيانات والتحميل الفوري
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                عدّل أي بيانات أو ارفع صورة ليتم تحديث البطاقة مباشرة بجودة طباعة فائقة.
              </p>
            </div>
          </div>

          {/* Quick Template Switcher */}
          {templates.length > 1 && onSelectTemplate && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => onSelectTemplate(tmpl.id)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: tmpl.id === template.id ? '1px solid #10b981' : '1px solid var(--border-subtle)',
                    background: tmpl.id === template.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: tmpl.id === template.id ? '#10b981' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                  }}
                >
                  {tmpl.name.split('-')[0].trim()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Photo Section (الصورة الشخصية في المربع الأبيض) */}
            {hasPhoto && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#10b981',
                  marginBottom: '10px',
                }}
              >
                <ImageIcon size={16} />
                <span>الصورة الشخصية (توضع في المربع الأبيض على يسار البطاقة)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '68px',
                    height: '80px',
                    borderRadius: '8px',
                    border: '2px solid rgba(16, 185, 129, 0.5)',
                    overflow: 'hidden',
                    background: '#0f172a',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    position: 'relative',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePerson.photoUrl || '/templates/sample-person.jpg'}
                    alt="Driver Photo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${activePerson.photoZoom || 1}) translate(${-(activePerson.photoOffsetX || 0)}%, ${-(activePerson.photoOffsetY || 0)}%)`,
                      transition: 'transform 0.1s ease-out',
                    }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ flex: 1, fontSize: '0.78rem' }}
                    >
                      <Upload size={14} />
                      <span>رفع صورة جديدة</span>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={handleResetOriginalPhoto}
                      title="استعادة الصورة الأصلية وضبط الحجم الافتراضي"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <RefreshCw size={13} />
                      <span>الأصلية</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    يتم ملاءمة أي صورة مرفوعة لتملأ المربع الأبيض بالكامل بنسبة 100% وإزالة أي حواف بيضاء زائدة تلقائياً.
                  </div>
                </div>
              </div>

              {/* Photo Zoom & Position Controls */}
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Zoom Control Row */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                      <ZoomIn size={14} />
                      <span>التحكم في تكبير الصورة (Zoom)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        {Math.round((activePerson.photoZoom || 1) * 100)}%
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => onUpdatePerson(activePerson.id, { photoZoom: 1, photoOffsetX: 0, photoOffsetY: 0 })}
                        title="إعادة ضبط التكبير والموضع"
                        style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                      >
                        إعادة ضبط
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon"
                      style={{ width: '28px', height: '28px', minWidth: '28px' }}
                      onClick={() =>
                        onUpdatePerson(activePerson.id, {
                          photoZoom: Math.max(0.5, Number(((activePerson.photoZoom || 1) - 0.05).toFixed(2))),
                        })
                      }
                      title="تصغير (-5%)"
                    >
                      <ZoomOut size={13} />
                    </button>

                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={activePerson.photoZoom || 1}
                      onChange={(e) =>
                        onUpdatePerson(activePerson.id, { photoZoom: Number(e.target.value) })
                      }
                      style={{ flex: 1, accentColor: '#10b981', cursor: 'pointer' }}
                    />

                    <button
                      type="button"
                      className="btn btn-secondary btn-icon"
                      style={{ width: '28px', height: '28px', minWidth: '28px' }}
                      onClick={() =>
                        onUpdatePerson(activePerson.id, {
                          photoZoom: Math.min(2.5, Number(((activePerson.photoZoom || 1) + 0.05).toFixed(2))),
                        })
                      }
                      title="تكبير (+5%)"
                    >
                      <ZoomIn size={13} />
                    </button>
                  </div>
                </div>

                {/* Fine Position Tuning (Y & X offsets) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      <span>تحريك رأسي (أعلى / أسفل)</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {activePerson.photoOffsetY || 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={activePerson.photoOffsetY || 0}
                      onChange={(e) =>
                        onUpdatePerson(activePerson.id, { photoOffsetY: Number(e.target.value) })
                      }
                      style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                      }}
                    >
                      <span>تحريك أفقي (يمين / يسار)</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {activePerson.photoOffsetX || 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={activePerson.photoOffsetX || 0}
                      onChange={(e) =>
                        onUpdatePerson(activePerson.id, { photoOffsetX: Number(e.target.value) })
                      }
                      style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* 2. Specific Template Fields */}
            {isDrivingLicense ? (
              /* رخصة سياقة (Saudi Driving License) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User size={16} />
                  <span>بيانات رخصة القيادة (وزارة الداخلية)</span>
                </div>

                {/* Name AR & Name EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الاسم بالعربية *
                    </label>
                    <input
                      type="text"
                      className="input"
                      dir="rtl"
                      value={custom.nameAr !== undefined ? custom.nameAr : (activePerson.name || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleBatchChange({ nameAr: val }, { name: val });
                      }}
                      placeholder="اسلام حماده فؤاد عبد الرحمن"
                      style={{ fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الاسم بالإنجليزية (English) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      dir="ltr"
                      value={custom.nameEn !== undefined ? custom.nameEn : ''}
                      onChange={(e) => handleCustomFieldChange('nameEn', e.target.value)}
                      placeholder="ESLAM HAMADA FOUAD ABDELRAHMAN"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                {/* ID Number AR & EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم الهوية (بالأرقام الإنجليزية) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.idNumberEn !== undefined ? custom.idNumberEn : (activePerson.code || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleBatchChange(
                          {
                            idNumberEn: val,
                            idNumberAr: toArabicNumerals(val),
                            driverId: val,
                          },
                          { code: val }
                        );
                      }}
                      placeholder="2579236403"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم الهوية (بالأرقام العربية) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.idNumberAr !== undefined ? custom.idNumberAr : ''}
                      onChange={(e) => handleCustomFieldChange('idNumberAr', e.target.value)}
                      placeholder="٢٥٧٩٢٣٦٤٠٣"
                    />
                  </div>
                </div>

                {/* License Type AR & EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      نوع الرخصة بالعربية
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.licenseTypeAr !== undefined ? custom.licenseTypeAr : ''}
                      onChange={(e) => handleCustomFieldChange('licenseTypeAr', e.target.value)}
                      placeholder="نقل خفيف"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      نوع الرخصة بالإنجليزية
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.licenseTypeEn !== undefined ? custom.licenseTypeEn : ''}
                      onChange={(e) => handleCustomFieldChange('licenseTypeEn', e.target.value)}
                      placeholder="Light Transport"
                    />
                  </div>
                </div>

                {/* Issue Date AR & EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الإصدار (عربي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.issueDateAr !== undefined ? custom.issueDateAr : ''}
                      onChange={(e) => handleCustomFieldChange('issueDateAr', e.target.value)}
                      placeholder="٢٠٢٦/٠٤/٠٢"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الإصدار (إنجليزي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.issueDateEn !== undefined ? custom.issueDateEn : (activePerson.date || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleBatchChange({ issueDateEn: val }, { date: val });
                      }}
                      placeholder="02/04/2026"
                    />
                  </div>
                </div>

                {/* Date of Birth AR & EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الميلاد (عربي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.dobAr !== undefined ? custom.dobAr : ''}
                      onChange={(e) => handleCustomFieldChange('dobAr', e.target.value)}
                      placeholder="١٩٩٩/١٢/٠١"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الميلاد (إنجليزي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.dobEn !== undefined ? custom.dobEn : ''}
                      onChange={(e) => handleCustomFieldChange('dobEn', e.target.value)}
                      placeholder="01/12/1999"
                    />
                  </div>
                </div>

                {/* Nationality AR & EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الجنسية (عربي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.nationalityAr !== undefined ? custom.nationalityAr : ''}
                      onChange={(e) => handleCustomFieldChange('nationalityAr', e.target.value)}
                      placeholder="مصر"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الجنسية (إنجليزي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.nationalityEn !== undefined ? custom.nationalityEn : ''}
                      onChange={(e) => handleCustomFieldChange('nationalityEn', e.target.value)}
                      placeholder="Egypt"
                    />
                  </div>
                </div>

                {/* Expiry Date AR & EN + Blood Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الانتهاء (عربي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.expiryDateAr !== undefined ? custom.expiryDateAr : ''}
                      onChange={(e) => handleCustomFieldChange('expiryDateAr', e.target.value)}
                      placeholder="٢٠٣١/٠٢/٠٦"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الانتهاء (إنجليزي)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.expiryDateEn !== undefined ? custom.expiryDateEn : ''}
                      onChange={(e) => handleCustomFieldChange('expiryDateEn', e.target.value)}
                      placeholder="06/02/2031"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      فصيلة الدم
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.bloodType !== undefined ? custom.bloodType : ''}
                      onChange={(e) => handleCustomFieldChange('bloodType', e.target.value)}
                      placeholder="A+"
                      style={{ textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            ) : isMuqeemId ? (
              /* هوية مقيم (Saudi Muqeem ID) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User size={16} />
                  <span>بيانات هوية مقيم (وزارة الداخلية - الجوازات)</span>
                </div>

                {/* Name AR & Name EN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الاسم بالعربية *
                    </label>
                    <input
                      type="text"
                      className="input"
                      dir="rtl"
                      value={custom.nameAr !== undefined ? custom.nameAr : (activePerson.name || '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleBatchChange({ nameAr: val }, { name: val });
                      }}
                      placeholder="اسلام حماده فؤاد عبد الرحمن"
                      style={{ fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الاسم بالإنجليزية (English) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      dir="ltr"
                      value={custom.nameEn !== undefined ? custom.nameEn : ''}
                      onChange={(e) => handleCustomFieldChange('nameEn', e.target.value)}
                      placeholder="ESLAM HAMADA FOUAD ABDELRAHMAN"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                {/* ID Number & Date of Birth */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم هوية مقيم *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.idNumberAr !== undefined ? custom.idNumberAr : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleBatchChange(
                          {
                            idNumberAr: toArabicNumerals(val),
                            idNumberEn: val,
                            driverId: val,
                          },
                          { code: val }
                        );
                      }}
                      placeholder="٢٥٧٩٢٣٦٤٠٣"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الميلاد *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.dobAr !== undefined ? custom.dobAr : ''}
                      onChange={(e) => handleCustomFieldChange('dobAr', e.target.value)}
                      placeholder="١٩٩٩/١٢/٠١"
                    />
                  </div>
                </div>

                {/* Expiry Date, POB & Religion */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الانتهاء *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.expiryDateAr !== undefined ? custom.expiryDateAr : ''}
                      onChange={(e) => handleCustomFieldChange('expiryDateAr', e.target.value)}
                      placeholder="٢٠٢٦/٠٩/٢١"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      مكان الميلاد
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.pobAr !== undefined ? custom.pobAr : ''}
                      onChange={(e) => handleCustomFieldChange('pobAr', e.target.value)}
                      placeholder="مصر"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الديانة
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.religionAr !== undefined ? custom.religionAr : ''}
                      onChange={(e) => handleCustomFieldChange('religionAr', e.target.value)}
                      placeholder="الاسلام"
                    />
                  </div>
                </div>

                {/* Nationality & Profession */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      الجنسية
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.nationalityAr !== undefined ? custom.nationalityAr : ''}
                      onChange={(e) => handleCustomFieldChange('nationalityAr', e.target.value)}
                      placeholder="مصر"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      المهنة
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.professionAr !== undefined ? custom.professionAr : ''}
                      onChange={(e) => handleCustomFieldChange('professionAr', e.target.value)}
                      placeholder="سائق شاحنة صغيرة"
                    />
                  </div>
                </div>

                {/* Employer ID & Place of Issue */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      هوية صاحب العمل
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.employerIdAr !== undefined ? custom.employerIdAr : ''}
                      onChange={(e) => handleCustomFieldChange('employerIdAr', e.target.value)}
                      placeholder="٧٠٣٧٤٢٧٦٠١"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      مكان الإصدار
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.issuePlaceAr !== undefined ? custom.issuePlaceAr : ''}
                      onChange={(e) => handleCustomFieldChange('issuePlaceAr', e.target.value)}
                      placeholder="موقع بوابة الوزارة الإلكترونية"
                    />
                  </div>
                </div>

                {/* Place of Work & Employer Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      مكان العمل
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.workPlaceAr !== undefined ? custom.workPlaceAr : ''}
                      onChange={(e) => handleCustomFieldChange('workPlaceAr', e.target.value)}
                      placeholder="منطقة تبوك"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      اسم صاحب العمل
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.employerNameAr !== undefined ? custom.employerNameAr : ''}
                      onChange={(e) => handleCustomFieldChange('employerNameAr', e.target.value)}
                      placeholder="شركة غضى التجارية"
                    />
                  </div>
                </div>
              </div>
            ) : isDriverCard ? (
              /* بطاقة سائق (Saudi TGA Driver Card) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <User size={16} />
                  <span>بيانات بطاقة السائق (الهيئة العامة للنقل)</span>
                </div>

                {/* Driver Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    اسم السائق *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={activePerson.name}
                    onChange={(e) => onUpdatePerson(activePerson.id, { name: e.target.value })}
                    placeholder="احمد حسين محمد حسين مهدي"
                    style={{ fontWeight: 700 }}
                  />
                </div>

                {/* Card Number & Driver ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم البطاقة العلوي *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={activePerson.code}
                      onChange={(e) => onUpdatePerson(activePerson.id, { code: e.target.value })}
                      placeholder="38.00057886"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم هوية السائق *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.driverId || ''}
                      onChange={(e) => handleCustomFieldChange('driverId', e.target.value)}
                      placeholder="2628113686"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الإصدار
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={activePerson.date}
                      onChange={(e) => onUpdatePerson(activePerson.id, { date: e.target.value })}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      تاريخ الانتهاء
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.expiryDate || ''}
                      onChange={(e) => handleCustomFieldChange('expiryDate', e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                </div>

                {/* License & Company */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                    بيانات المنشأة والترخيص
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        رقم الترخيص
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.licenseNumber || ''}
                        onChange={(e) => handleCustomFieldChange('licenseNumber', e.target.value)}
                        placeholder="38/00021153"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        رقم هوية المنشأة (MOI)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.moiNumber || ''}
                        onChange={(e) => handleCustomFieldChange('moiNumber', e.target.value)}
                        placeholder="7037427601"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        مدينة الترخيص بالعربية
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cityAr || 'تبوك'}
                        onChange={(e) => handleCustomFieldChange('cityAr', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        مدينة الترخيص بالإنجليزية
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cityEn || 'Tabuk'}
                        onChange={(e) => handleCustomFieldChange('cityEn', e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        اسم المنشأة بالعربية
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.companyAr || 'شركة غضى التجارية'}
                        onChange={(e) => handleCustomFieldChange('companyAr', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        اسم المنشأة بالإنجليزية
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.companyEn !== undefined ? custom.companyEn : (activePerson.company && !/[\u0600-\u06FF]/.test(activePerson.company) ? activePerson.company : '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleBatchChange({ companyEn: val }, { company: val });
                        }}
                        placeholder="Ghada Company Commercial"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : isOperationCard ? (
              /* بطاقة تشغيل (Saudi TGA Operation Card) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#f43f5e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Truck size={16} />
                  <span>بيانات بطاقة التشغيل (الهيئة العامة للنقل - نقل)</span>
                </div>

                {/* Section 1: بيانات المنشأة (Organization Info) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} />
                    <span>بيانات المنشأة (Organization Info)</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رقم هوية المنشأة (ID Number) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.moiNumber || '7037427601'}
                      onChange={(e) => handleCustomFieldChange('moiNumber', e.target.value)}
                      placeholder="7037427601"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        اسم المنشأة بالعربية *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.companyAr || 'شركة غضى لتأجير السيارات'}
                        onChange={(e) => handleCustomFieldChange('companyAr', e.target.value)}
                        placeholder="شركة غضى لتأجير السيارات"
                        style={{ fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        اسم المنشأة بالإنجليزية (Name) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.companyEn || 'Ghada Company Cars Rental'}
                        onChange={(e) => handleCustomFieldChange('companyEn', e.target.value)}
                        placeholder="Ghada Company Cars Rental"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: بيانات بطاقة التشغيل (Operation Card Info) */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CreditCard size={14} />
                    <span>بيانات بطاقة التشغيل (Operation Card Info)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        رقم البطاقة (Card Number) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.operationCardNo !== undefined ? custom.operationCardNo : (activePerson.code || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleBatchChange({ operationCardNo: val }, { code: val });
                        }}
                        placeholder="38-00075448"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        تاريخ تجديد البطاقة (Renew Date)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.operationCardRenewDate !== undefined ? custom.operationCardRenewDate : ''}
                        onChange={(e) => handleCustomFieldChange('operationCardRenewDate', e.target.value)}
                        placeholder="null"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        تاريخ إصدار البطاقة (Issue Date) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.operationCardIssueDate !== undefined ? custom.operationCardIssueDate : (activePerson.date || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleBatchChange({ operationCardIssueDate: val }, { date: val });
                        }}
                        placeholder="2026-04-27"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        تاريخ انتهاء البطاقة (Expiry Date) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.operationCardExpiryDate || custom.expiryDate || '2027-04-29'}
                        onChange={(e) => handleCustomFieldChange('operationCardExpiryDate', e.target.value)}
                        placeholder="2027-04-29"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: بيانات المركبة (Vehicle Info) */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} />
                    <span>بيانات المركبة (Vehicle Info)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        الماركة (Maker) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.vehicleMaker || 'سوزوكي'}
                        onChange={(e) => handleCustomFieldChange('vehicleMaker', e.target.value)}
                        placeholder="سوزوكي"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        الطراز (Model) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.vehicleModel || 'ديز اير'}
                        onChange={(e) => handleCustomFieldChange('vehicleModel', e.target.value)}
                        placeholder="ديز اير"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        رقم اللوحة (Plate Number) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.plateNumber || '8781 أ أ ر'}
                        onChange={(e) => handleCustomFieldChange('plateNumber', e.target.value)}
                        placeholder="8781 أ أ ر"
                        style={{ fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        لون المركبة (Color)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.vehicleColor || 'فضي'}
                        onChange={(e) => handleCustomFieldChange('vehicleColor', e.target.value)}
                        placeholder="فضي"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        سنة الصنع (Model Year)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.vehicleYear || '2024'}
                        onChange={(e) => handleCustomFieldChange('vehicleYear', e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: بيانات الترخيص (License Info) */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} />
                    <span>بيانات الترخيص (License Info)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        رقم الترخيص (License Number) *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.licenseNumber || '38/00021153'}
                        onChange={(e) => handleCustomFieldChange('licenseNumber', e.target.value)}
                        placeholder="38/00021153"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        مدينة الترخيص بالعربية *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cityAr || 'تبوك'}
                        onChange={(e) => handleCustomFieldChange('cityAr', e.target.value)}
                        placeholder="تبوك"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        مدينة الترخيص (EN)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cityEn || 'Tabuk'}
                        onChange={(e) => handleCustomFieldChange('cityEn', e.target.value)}
                        placeholder="Tabuk"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        تاريخ إصدار الترخيص
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.licenseIssueDate || '2025-12-08'}
                        onChange={(e) => handleCustomFieldChange('licenseIssueDate', e.target.value)}
                        placeholder="2025-12-08"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        تاريخ انتهاء الترخيص
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.licenseExpiryDate || '2028-12-08'}
                        onChange={(e) => handleCustomFieldChange('licenseExpiryDate', e.target.value)}
                        placeholder="2028-12-08"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: رمز الاستجابة السريعة (QR Code) */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <QrCode size={14} />
                    <span>رمز الاستجابة السريعة (Dynamic QR Code)</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      رابط التحقق في بوابة نقل (Naql Verification URL)
                    </label>
                    <input
                      type="text"
                      className="input"
                      dir="ltr"
                      value={
                        custom.operationCardQr ||
                        `https://naql.logisti.sa/validate-operation-card?token=${custom.token || '12aeed0c-87b8-4adc-8147-49b3d4d8901d'}`
                      }
                      onChange={(e) => handleCustomFieldChange('operationCardQr', e.target.value)}
                      placeholder="https://naql.logisti.sa/validate-operation-card?token=..."
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      يتم توليد الرمز تلقائياً وبأعلى دقة ومطابق لباركود الهيئة العامة للنقل أعلى يسار البطاقة.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Custom or other template generic form */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    الاسم
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={activePerson.name}
                    onChange={(e) => onUpdatePerson(activePerson.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    المسمى / الصفة
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={activePerson.title}
                    onChange={(e) => onUpdatePerson(activePerson.id, { title: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    الرمز / رقم الهوية
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={activePerson.code}
                    onChange={(e) => onUpdatePerson(activePerson.id, { code: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            gap: '10px',
          }}
        >
          <button
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
            onClick={onDownloadCard}
          >
            <Download size={18} />
            <span>تحميل هذه البطاقة (PNG)</span>
          </button>
        </div>
      </div>

      {/* Left/Canvas Pane: Interactive Live Card Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at center, #101625 0%, #060910 100%)',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(22, 28, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Sparkles size={14} style={{ color: '#10b981' }} />
          <span>معاينة حية ومطابقة للأصل بنسبة 100%</span>
        </div>

        {/* Scaled Preview Canvas Wrapper */}
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            aspectRatio: `${template.naturalWidth} / ${template.naturalHeight}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Quick Download & Print Buttons Under Preview */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onDownloadCard} style={{ padding: '10px 20px', fontWeight: 700 }}>
            <Download size={16} />
            <span>تحميل البطاقة عالية الدقة (PNG)</span>
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} style={{ padding: '10px 20px', fontWeight: 700 }}>
            <Printer size={16} />
            <span>طباعة مباشرة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
