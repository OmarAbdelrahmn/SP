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
        setErrorMessage('No valid rows detected. Make sure each person is on a new line.');
        setParsedPreview([]);
      } else {
        setErrorMessage(null);
        setParsedPreview(result.records);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse CSV format');
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px' }}
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
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Import People Dataset</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Paste tabular data or upload a CSV / TSV file
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
          {/* File drop or paste input */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Paste CSV or Spreadsheet Data
              </label>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload File (.csv)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .tsv, .txt"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            <textarea
              className="textarea"
              rows={5}
              placeholder="Full Name, Role / Title, Organization, Date, ID Code&#10;Dr. Alexander Vance, Chief Scientist, Nova Labs, 2026-10-20, CERT-101&#10;Evelyn Sterling, Principal Architect, Apex Core, 2026-10-20, CERT-102"
              value={csvRawText}
              onChange={(e) => handleTextChange(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '0.8rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Preview: {parsedPreview.length} People Detected
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                  />
                  <span>Replace existing people list</span>
                </label>
              </div>

              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Title</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Company</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>ID Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.map((item, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{item.title}</td>
                        <td style={{ padding: '6px 10px', color: 'var(--text-secondary)' }}>{item.company}</td>
                        <td style={{ padding: '6px 10px' }}>{item.date}</td>
                        <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)' }}>{item.code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
          >
            <Check size={16} /> Import {parsedPreview.length} People
          </button>
        </div>
      </div>
    </div>
  );
};
