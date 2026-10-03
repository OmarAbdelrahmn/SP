'use client';

import React, { useRef, useState } from 'react';
import { Template, PersonRecord } from '../types/template';
import { generateCsvTemplateForTemplate, parseCsvText } from '../utils/csvParser';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Archive,
  CheckCircle2,
  Users,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

interface SheetBatchStudioProps {
  template: Template;
  people: PersonRecord[];
  activePersonIndex: number;
  onSelectPersonIndex: (idx: number) => void;
  onImportPeople: (imported: PersonRecord[], replaceExisting: boolean) => void;
  onDeletePerson: (id: string) => void;
  onToggleSelectPerson: (id: string) => void;
  onToggleSelectAll: (select: boolean) => void;
  onOpenBatchExport: () => void;
  onSwitchToForm: () => void;
}

export const SheetBatchStudio: React.FC<SheetBatchStudioProps> = ({
  template,
  people,
  activePersonIndex,
  onSelectPersonIndex,
  onImportPeople,
  onDeletePerson,
  onToggleSelectPerson,
  onToggleSelectAll,
  onOpenBatchExport,
  onSwitchToForm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteText, setPasteText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const selectedCount = people.filter((p) => p.isSelected).length;
  const allSelected = people.length > 0 && people.every((p) => p.isSelected);

  // 1. Download tailored CSV spreadsheet template
  const handleDownloadSheetTemplate = () => {
    const csvContent = generateCsvTemplateForTemplate(template, people[0]);
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTemplateName = template.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    link.setAttribute('download', `${safeTemplateName}_sheet_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Upload and parse CSV file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processCsv(content);
    };
    reader.readAsText(file);
  };

  const processCsv = (content: string) => {
    try {
      const result = parseCsvText(content);
      if (result.records.length > 0) {
        onImportPeople(result.records, true);
        setIsSuccessMessage(true);
        setTimeout(() => setIsSuccessMessage(false), 4000);
      } else {
        alert('لم يتم العثور على سجلات صالحة في الملف. يرجى التأكد من احتواء الملف على صفوف بيانات.');
      }
    } catch (err: any) {
      alert(`خطأ في قراءة ملف الجدول: ${err.message}`);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-main)',
        padding: '32px 40px',
        fontFamily: "'Almarai', 'Tajawal', sans-serif",
      }}
    >
      {/* Top Banner / Heading */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              التوليد الجماعي عبر جداول البيانات (Excel / Sheet)
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
              قم بتحميل ملف Excel مهيأ لنموذج <strong style={{ color: 'var(--text-primary)' }}>{template.name}</strong>، واملأ بيانات السائقين أو المقيمين ثم ارفعه لتوليد جميع البطاقات دفعة واحدة.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Step Workflow Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Step 1: Download Sheet */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              الخطوة 1
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
              تحميل نموذج جدول البيانات (CSV)
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              تحصل على ملف Excel مهيأ بأعمدة تطابق تماماً حقول هذا النموذج (الاسم بالعربية والإنجليزية، رقم الهوية، التواريخ، المهنة، المنشأة وغيرها) مع صفوف بيانات تجريبية.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleDownloadSheetTemplate}
            style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 700 }}
          >
            <Download size={16} style={{ color: '#10b981' }} />
            <span>تحميل ملف الجدول (.csv)</span>
          </button>
        </div>

        {/* Step 2: Upload Completed Sheet */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              الخطوة 2
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
              رفع الجدول المكتمل وتوليد البطاقات
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              ارفع ملف CSV بعد تعبئته أو الصق محتويات الجدول مباشرة. يتم تحويل كل صف تلقائياً إلى بطاقة مخصصة بدقة فائقة.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, padding: '12px', justifyContent: 'center', fontWeight: 700 }}
            >
              <Upload size={16} />
              <span>رفع ملف CSV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .tsv, .txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <button
              className="btn btn-secondary"
              onClick={() => setShowPasteBox(!showPasteBox)}
              style={{ padding: '12px', fontWeight: 600 }}
              title="لصق بيانات من الحافظة"
            >
              لصق بيانات
            </button>
          </div>
        </div>
      </div>

      {/* Paste Data Drawer */}
      {showPasteBox && (
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '32px',
          }}
        >
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            لصق صفوف الجدول (CSV أو من Excel / Google Sheets)
          </label>
          <textarea
            className="textarea"
            rows={5}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="الصق جدول البيانات المنسوخ هنا..."
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '12px', textAlign: 'right' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (pasteText.trim()) {
                  processCsv(pasteText);
                  setShowPasteBox(false);
                }
              }}
            >
              معالجة البيانات الملصوقة
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPasteBox(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isSuccessMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#10b981',
            fontSize: '0.875rem',
            marginBottom: '24px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>تم استيراد بيانات الجدول بنجاح! جاهز لتوليد وتصدير جميع البطاقات أدناه.</span>
        </div>
      )}

      {/* Step 3: Processed Cards Table & Batch Export Action */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={18} style={{ color: '#10b981' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                السجلات الجاهزة ({people.length} بطاقة)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
                تم تحديد {selectedCount} من إجمالي {people.length} للتوليد والتصدير الجماعي
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={onOpenBatchExport}
            style={{ padding: '10px 18px', fontWeight: 700 }}
          >
            <Archive size={16} />
            <span>توليد وتصدير الكل ({selectedCount} بطاقة ZIP)</span>
          </button>
        </div>

        {/* Table of records */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                }}
              >
                <th style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onToggleSelectAll(!allSelected)}
                    title="تحديد الكل"
                  >
                    {allSelected ? (
                      <CheckSquare size={16} style={{ color: '#10b981' }} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>الاسم</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>رقم الهوية / الكود</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>المنشأة / الكفيل</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>التواريخ (الإصدار - الانتهاء)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person, i) => {
                const isSelected = person.isSelected;
                const isActive = i === activePersonIndex;

                return (
                  <tr
                    key={person.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => onToggleSelectPerson(person.id)}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} style={{ color: '#10b981' }} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {person.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {person.code || person.customFields?.driverId || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {person.company || person.customFields?.companyAr || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {person.date} {person.customFields?.expiryDate ? `← ${person.customFields?.expiryDate}` : ''}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-start' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            onSelectPersonIndex(i);
                            onSwitchToForm();
                          }}
                          title="فتح في شاشة التعبئة والمعاينة"
                        >
                          <Eye size={13} />
                          <span>معاينة البطاقة</span>
                        </button>
                        <button
                          className="btn btn-danger-ghost btn-sm btn-icon"
                          onClick={() => onDeletePerson(person.id)}
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
