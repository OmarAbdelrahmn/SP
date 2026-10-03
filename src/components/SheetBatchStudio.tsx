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
        alert('No valid records found in the sheet. Please make sure the sheet has rows of data.');
      }
    } catch (err: any) {
      alert(`Error reading sheet: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-main)',
        padding: '32px 40px',
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Batch Generation with Spreadsheet (Sheet Mode)
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Download the tailored sheet for <strong style={{ color: 'var(--text-primary)' }}>{template.name}</strong>, fill in the rows in Excel or Google Sheets, then upload to generate all cards.
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
                textTransform: 'uppercase',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              Step 1
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px' }}>
              Download Spreadsheet Template
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Gets you a pre-formatted Excel / CSV template with exact column headers matching this template&apos;s fields (Driver Name, Card #, ID, Dates, Company, License #, etc.) with pre-filled sample rows.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleDownloadSheetTemplate}
            style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
          >
            <Download size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Download CSV Template (.csv)</span>
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
                textTransform: 'uppercase',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              Step 2
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '8px' }}>
              Upload Completed Sheet
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Upload your saved CSV file or paste the spreadsheet contents directly. Each row is automatically transformed into a full-fidelity personalized card.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
            >
              <Upload size={16} />
              <span>Upload CSV File</span>
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
              style={{ padding: '12px' }}
              title="Paste text from clipboard"
            >
              Paste Data
            </button>
          </div>
        </div>
      </div>

      {/* Paste Data Drawer (if toggled) */}
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
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
            Paste Spreadsheet Rows (CSV or TSV from Excel / Google Sheets)
          </label>
          <textarea
            className="textarea"
            rows={5}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your copied spreadsheet table here..."
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '12px' }}
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
              Process Pasted Rows
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPasteBox(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isSuccessMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-emerald)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--accent-emerald)',
            fontSize: '0.875rem',
            marginBottom: '24px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Successfully imported spreadsheet! Ready to export all cards below.</span>
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
            <Users size={18} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Loaded Records ({people.length} Cards)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedCount} of {people.length} selected for batch generation
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={onOpenBatchExport}
            style={{ padding: '10px 18px' }}
          >
            <Archive size={16} />
            <span>Generate & Download All ({selectedCount} Cards ZIP)</span>
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
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onToggleSelectAll(!allSelected)}
                  >
                    {allSelected ? (
                      <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Driver Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Card Number</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Driver ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Company</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Dates (Issue - Expiry)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
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
                      background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => onToggleSelectPerson(person.id)}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {person.name}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {person.code}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {person.customFields?.driverId || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {person.company || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {person.date} {person.customFields?.expiryDate ? `→ ${person.customFields?.expiryDate}` : ''}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            onSelectPersonIndex(i);
                            onSwitchToForm();
                          }}
                          title="Open in Form View"
                        >
                          <Eye size={13} />
                          <span>View Card</span>
                        </button>
                        <button
                          className="btn btn-danger-ghost btn-sm btn-icon"
                          onClick={() => onDeletePerson(person.id)}
                          title="Remove"
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
