'use client';

import React, { useRef, useEffect } from 'react';
import { Template, PersonRecord } from '../types/template';
import { renderTemplateToCanvas, exportSingleImage } from '../utils/canvasRenderer';
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
  RotateCcw,
  Check,
} from 'lucide-react';

interface FormFillStudioProps {
  template: Template;
  activePerson: PersonRecord;
  onUpdatePerson: (id: string, updates: Partial<PersonRecord>) => void;
  onDownloadCard: () => void;
}

export const FormFillStudio: React.FC<FormFillStudioProps> = ({
  template,
  activePerson,
  onUpdatePerson,
  onDownloadCard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update canvas on person or template change
  useEffect(() => {
    if (!canvasRef.current) return;
    let isMounted = true;
    renderTemplateToCanvas(canvasRef.current, template, activePerson).catch((err) => {
      if (isMounted) console.error('Canvas render error in form view:', err);
    });
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

  const handlePrint = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
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

  const isDriverCard = template.id === 'saudi-tga-driver-card';
  const custom = activePerson.customFields || {};

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-main)',
      }}
    >
      {/* Left Pane: Interactive Live Card Preview */}
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
            left: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(22, 28, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Live Instant Preview</span>
        </div>

        {/* Scaled Preview Canvas Wrapper */}
        <div
          style={{
            maxWidth: '500px',
            width: '100%',
            aspectRatio: `${template.naturalWidth} / ${template.naturalHeight}`,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            position: 'relative',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Quick Download Buttons Under Preview */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onDownloadCard}>
            <Download size={16} />
            <span>Download Card (PNG)</span>
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Card</span>
          </button>
        </div>
      </div>

      {/* Right Pane: Comprehensive Card Data Form */}
      <div
        style={{
          width: '520px',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Form Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <CreditCard size={18} />
            </div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Fill Data & Download</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Edit any field below to update the card in real-time, then click download.
          </p>
        </div>

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {isDriverCard ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* SECTION 1: Driver Information */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#818cf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '14px',
                  }}
                >
                  <User size={16} />
                  <span>Driver Card Info (بيانات بطاقة السائق)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Driver Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Driver Name (اسم السائق) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={activePerson.name}
                      onChange={(e) => onUpdatePerson(activePerson.id, { name: e.target.value })}
                      placeholder="e.g. احمد حسين محمد حسين مهدي"
                      style={{ fontSize: '0.9rem', fontWeight: 600 }}
                    />
                  </div>

                  {/* Card Number & Driver ID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Driver Card Number (رقم البطاقة) *
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
                        Driver ID (رقم هوية السائق) *
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

                  {/* Issue Date & Expiry Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Issue Date (تاريخ الإصدار)
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
                        Expiration Date (تاريخ الانتهاء)
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

                  {/* Card Category EN / AR */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Category EN
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cardCategoryEn || 'Yearly'}
                        onChange={(e) => handleCustomFieldChange('cardCategoryEn', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        تصنيف البطاقة (AR)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cardCategoryAr || 'سنوية'}
                        onChange={(e) => handleCustomFieldChange('cardCategoryAr', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: License and Company Info */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '14px',
                  }}
                >
                  <Building2 size={16} />
                  <span>License & Facility Info (بيانات المنشأة والترخيص)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* License Number & MOI Number */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        License Number (رقم الترخيص)
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
                        MOI Number (رقم هوية المنشأة)
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

                  {/* License City EN & AR */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        License City (EN)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cityEn || 'Tabuk'}
                        onChange={(e) => handleCustomFieldChange('cityEn', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        مدينة الترخيص (AR)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.cityAr || 'تبوك'}
                        onChange={(e) => handleCustomFieldChange('cityAr', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* License Issue & Expiry Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        License Issue Date
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.licenseIssueDate || ''}
                        onChange={(e) => handleCustomFieldChange('licenseIssueDate', e.target.value)}
                        placeholder="2025-12-08"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        License Expiry Date
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.licenseExpiryDate || ''}
                        onChange={(e) => handleCustomFieldChange('licenseExpiryDate', e.target.value)}
                        placeholder="2028-12-08"
                      />
                    </div>
                  </div>

                  {/* Activity Type EN & AR */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Activity Type (EN)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.activityTypeEn || 'Light cargo transport activity'}
                        onChange={(e) => handleCustomFieldChange('activityTypeEn', e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        نوع النشاط (AR)
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={custom.activityTypeAr || 'نشاط النقل الخفيف للبضائع'}
                        onChange={(e) => handleCustomFieldChange('activityTypeAr', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Company Name EN & AR */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Company Name EN (اسم المنشأة بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={activePerson.company}
                      onChange={(e) => onUpdatePerson(activePerson.id, { company: e.target.value })}
                      placeholder="e.g. Ghada Company Commercial"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Company Name AR (اسم المنشأة بالعربية)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={custom.companyAr || ''}
                      onChange={(e) => handleCustomFieldChange('companyAr', e.target.value)}
                      placeholder="e.g. شركة غضى التجارية"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* General Form for Other Templates (Certificates, Badges, etc.) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Recipient Name
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
                  Role / Title
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
                  Organization / Company
                </label>
                <input
                  type="text"
                  className="input"
                  value={activePerson.company}
                  onChange={(e) => onUpdatePerson(activePerson.id, { company: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Date
                </label>
                <input
                  type="text"
                  className="input"
                  value={activePerson.date}
                  onChange={(e) => onUpdatePerson(activePerson.id, { date: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ID / Code
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
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onDownloadCard}>
            <Download size={16} /> Download This Card
          </button>
        </div>
      </div>
    </div>
  );
};
