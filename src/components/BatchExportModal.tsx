'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Template, PersonRecord, BatchExportProgress } from '../types/template';
import { exportBatchZip } from '../utils/canvasRenderer';
import confetti from 'canvas-confetti';
import { Archive, CheckCircle2, Download, Loader2, X, AlertCircle } from 'lucide-react';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  people: PersonRecord[];
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  template,
  people,
}) => {
  const selectedPeople = people.filter((p) => p.isSelected);
  const [progress, setProgress] = useState<BatchExportProgress>({
    total: selectedPeople.length,
    current: 0,
    currentPersonName: '',
    isGenerating: false,
    isCompleted: false,
  });

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const isStarted = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      isStarted.current = false;
      setDownloadUrl(null);
      setZipBlob(null);
      setProgress({
        total: selectedPeople.length,
        current: 0,
        currentPersonName: '',
        isGenerating: false,
        isCompleted: false,
      });
      return;
    }

    if (isOpen && !isStarted.current && selectedPeople.length > 0) {
      isStarted.current = true;
      runBatchExport();
    }
  }, [isOpen]);

  const runBatchExport = async () => {
    setProgress({
      total: selectedPeople.length,
      current: 0,
      currentPersonName: selectedPeople[0]?.name || '',
      isGenerating: true,
      isCompleted: false,
    });

    try {
      const blob = await exportBatchZip(template, selectedPeople, (current, total, personName) => {
        setProgress((prev) => ({
          ...prev,
          current,
          total,
          currentPersonName: personName,
        }));
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setZipBlob(blob);

      setProgress((prev) => ({
        ...prev,
        isGenerating: false,
        isCompleted: true,
      }));

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Continue
      }

      // Automatically trigger download
      triggerDownload(url, blob);
    } catch (err: any) {
      console.error('Batch export failed', err);
      setProgress((prev) => ({
        ...prev,
        isGenerating: false,
        error: err.message || 'فشل التصدير. يرجى مراجعة موارد الصور.',
      }));
    }
  };

  const triggerDownload = (url: string, blob: Blob) => {
    const link = document.createElement('a');
    link.href = url;
    const safeTemplateName = template.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    link.download = `${safeTemplateName}_دفعة_${selectedPeople.length}_بطاقات.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose} dir="rtl">
      <div
        className="modal-content"
        style={{ maxWidth: '540px', fontFamily: "'Almarai', 'Tajawal', sans-serif" }}
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
              <Archive size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                تصدير البطاقات الجماعي (ZIP)
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                توليد صور عالية الدقة لجميع السجلات وتنزيلها في ملف مضغوط واحد
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="إغلاق">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '28px 24px' }}>
          {selectedPeople.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <AlertCircle size={36} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                لا توجد سجلات محددة للتصدير
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                يرجى تحديد شخص واحد على الأقل في الجدول للبدء في توليد البطاقات.
              </p>
            </div>
          ) : progress.isGenerating ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="spin" style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    جاري توليد بطاقة: {progress.currentPersonName}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {progress.current} من {progress.total} ({percent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                تتم معالجة الصور بدقة فائقة جاهزة للطباعة، يرجى الانتظار ثوانٍ معدودة...
              </div>
            </div>
          ) : progress.isCompleted ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={30} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
                تم التوليد بنجاح!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                تم حفظ {progress.total} بطاقة بدقة كاملة داخل ملف ZIP مضغوط.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                {downloadUrl && zipBlob && (
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '12px', fontWeight: 700 }}
                    onClick={() => triggerDownload(downloadUrl, zipBlob)}
                  >
                    <Download size={16} />
                    <span>إعادة تنزيل ملف ZIP ({progress.total} بطاقة)</span>
                  </button>
                )}
                <button className="btn btn-secondary" onClick={onClose} style={{ padding: '12px 20px' }}>
                  إغلاق
                </button>
              </div>
            </div>
          ) : progress.error ? (
            <div style={{ textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', color: '#ef4444' }}>
                حدث خطأ أثناء التصدير
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {progress.error}
              </p>
              <button className="btn btn-primary" onClick={runBatchExport}>
                إعادة المحاولة
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
