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
        error: err.message || 'Export failed. Please check image resources.',
      }));
    }
  };

  const triggerDownload = (url: string, blob: Blob) => {
    const link = document.createElement('a');
    link.href = url;
    const safeTemplateName = template.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeTemplateName}_batch_${selectedPeople.length}_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '540px' }}
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
              <Archive size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Batch Image Export</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                High-resolution generation for {selectedPeople.length} recipients
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
          {progress.isGenerating && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Loader2 size={32} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                Generating Image {progress.current} of {progress.total}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Rendering: <strong style={{ color: 'var(--text-primary)' }}>{progress.currentPersonName}</strong>
              </p>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {percent}% Completed
              </div>
            </div>
          )}

          {progress.isCompleted && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-emerald)',
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                Batch Export Complete!
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Successfully generated and packaged {selectedPeople.length} full-resolution images into a ZIP archive.
              </p>

              {zipBlob && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '20px',
                  }}
                >
                  Archive size: {(zipBlob.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {downloadUrl && zipBlob && (
                  <button
                    className="btn btn-primary"
                    onClick={() => triggerDownload(downloadUrl, zipBlob)}
                  >
                    <Download size={16} /> Download ZIP Again
                  </button>
                )}
                <button className="btn btn-secondary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}

          {progress.error && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                  }}
                >
                  <AlertCircle size={32} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>
                Batch Generation Failed
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {progress.error}
              </p>
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
