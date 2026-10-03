'use client';

import React, { useState, useRef } from 'react';
import { PersonRecord } from '../types/template';
import { parseCsvText } from '../utils/csvParser';
import { Upload, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPeople: (people: PersonRecord[], replaceExisting: boolean) => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onImportPeople,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<PersonRecord[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setCsvRawText(text);
    if (!text.trim()) {
      setParsedPreview([]);
      setErrorMessage(null);
      return;
    }

    try {
      const result = parseCsvText(text);
      if (result.records.length === 0) {
        setErrorMessage('لم يتم العثور على صفوف صالحة. تأكد من أن كل شخص في سطر جديد.');
        setParsedPreview([]);
      } else {
        setErrorMessage(null);
        setParsedPreview(result.records);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل في قراءة تنسيق CSV');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImportPeople(parsedPreview, replaceExisting);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} dir="rtl">
      <div
        className="modal-content"
        style={{ maxWidth: '800px', fontFamily: "'Almarai', 'Tajawal', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                استيراد سجلات الأشخاص (CSV)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                ارفع ملف جدول بيانات أو الصق نصوص CSV لإدراج دفعة أسماء وبيانات جديدة
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="إغلاق">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              background: 'rgba(16, 185, 129, 0.03)',
              marginBottom: '20px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .tsv, .txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Upload size={24} style={{ color: '#10b981' }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                اضغط لاختيار ملف CSV أو أسقطه هنا
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                يدعم ملفات CSV الصادرة من Microsoft Excel أو Google Sheets
              </div>
            </div>
          </div>

          {/* Paste Raw Text Box */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              أو الصق محتوى الجدول هنا مباشرة:
            </label>
            <textarea
              className="textarea"
              rows={4}
              value={csvRawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="مثال:
الاسم, رقم الهوية, المنشأة, تاريخ الإصدار
اسلام حماده فؤاد, 2579236403, شركة غضى, 2026/04/02"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'right' }}
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview of Parsed Records */}
          {parsedPreview.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  معاينة السجلات ({parsedPreview.length} سجل جاهز للاستيراد)
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                  />
                  <span>استبدال السجلات الحالية بالكامل</span>
                </label>
              </div>

              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>#</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>الاسم</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>الكود / الهوية</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>المنشأة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.slice(0, 10).map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 12px', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>{p.code}</td>
                        <td style={{ padding: '6px 12px', color: 'var(--text-secondary)' }}>{p.company}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
            <button
              className="btn btn-primary"
              disabled={parsedPreview.length === 0}
              onClick={handleConfirmImport}
              style={{ fontWeight: 700 }}
            >
              <Check size={16} />
              <span>تأكيد استيراد ({parsedPreview.length}) سجل</span>
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
