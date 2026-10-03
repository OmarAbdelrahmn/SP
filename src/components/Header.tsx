'use client';

import React from 'react';
import { Template, PersonRecord } from '../types/template';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Archive,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  CreditCard,
  FileSpreadsheet,
  Lock,
  Clock,
} from 'lucide-react';

export type AppTabMode = 'form' | 'sheet' | 'designer';

interface HeaderProps {
  activeTemplate: Template;
  onOpenTemplateSelector: () => void;
  people: PersonRecord[];
  activePersonIndex: number;
  onSelectPersonIndex: (idx: number) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onDownloadSingle: () => void;
  onOpenBatchExport: () => void;
  activeTab: AppTabMode;
  onTabChange: (tab: AppTabMode) => void;
  sessionRemainingSeconds?: number;
  onLockSession?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTemplate,
  onOpenTemplateSelector,
  people,
  activePersonIndex,
  onSelectPersonIndex,
  zoomLevel,
  onZoomChange,
  onDownloadSingle,
  onOpenBatchExport,
  activeTab,
  onTabChange,
  sessionRemainingSeconds,
  onLockSession,
}) => {
  const selectedCount = people.filter((p) => p.isSelected).length;

  const handlePrevPerson = () => {
    if (activePersonIndex > 0) {
      onSelectPersonIndex(activePersonIndex - 1);
    } else {
      onSelectPersonIndex(people.length - 1);
    }
  };

  const handleNextPerson = () => {
    if (activePersonIndex < people.length - 1) {
      onSelectPersonIndex(activePersonIndex + 1);
    } else {
      onSelectPersonIndex(0);
    }
  };

  return (
    <header
      style={{
        height: '64px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        gap: '16px',
        zIndex: 50,
      }}
    >
      {/* Brand & Active Template */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.3px' }}>
                CertiCraft
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  borderRadius: '4px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                Template Engine
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Card & Template Automation Studio
            </div>
          </div>
        </div>

        <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

        {/* Template Selector Trigger */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenTemplateSelector}
          title="Switch or Upload Template"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '280px' }}
        >
          <Layers size={15} style={{ color: 'var(--accent-primary)' }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {activeTemplate.name}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 5px',
              borderRadius: '3px',
              textTransform: 'uppercase',
            }}
          >
            Change
          </span>
        </button>
      </div>

      {/* Center Controls: The 3 Main Workflow Modes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => onTabChange('form')}
          >
            <CreditCard size={14} />
            <span>Form Fill & Download</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'sheet' ? 'active' : ''}`}
            onClick={() => onTabChange('sheet')}
          >
            <FileSpreadsheet size={14} />
            <span>Excel / Sheet Batch</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => onTabChange('designer')}
          >
            <Layers size={14} />
            <span>Visual Designer</span>
          </button>
        </div>

        {/* Live Person Preview Switcher (when not in full sheet mode) */}
        {people.length > 0 && activeTab !== 'sheet' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              gap: '6px',
            }}
          >
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={handlePrevPerson}
              title="Previous person"
            >
              <ChevronLeft size={14} />
            </button>

            <select
              value={activePersonIndex}
              onChange={(e) => onSelectPersonIndex(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '180px',
              }}
            >
              {people.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {idx + 1}. {p.name}
                </option>
              ))}
            </select>

            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={handleNextPerson}
              title="Next person"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Zoom & Quick Export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {activeTab === 'designer' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 4px',
            }}
          >
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onZoomChange(Math.max(0.3, zoomLevel - 0.1))}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span
              style={{
                fontSize: '0.75rem',
                minWidth: '40px',
                textAlign: 'center',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onZoomChange(Math.min(2.0, zoomLevel + 0.1))}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onZoomChange(0.85)}
              title="Reset Zoom"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={onDownloadSingle}
          title="Download active card as image"
        >
          <Download size={14} />
          <span>Save Card</span>
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenBatchExport}
          title="Export all selected records as a ZIP file"
        >
          <Archive size={14} />
          <span>Export All ({selectedCount})</span>
        </button>

        {typeof sessionRemainingSeconds === 'number' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              background: sessionRemainingSeconds < 120 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: sessionRemainingSeconds < 120 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: sessionRemainingSeconds < 120 ? '#fca5a5' : 'var(--text-secondary)',
              marginLeft: '4px',
            }}
            title="Session automatically expires every 15 minutes"
          >
            <Clock size={13} style={{ color: sessionRemainingSeconds < 120 ? '#ef4444' : 'var(--accent-primary)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {Math.floor(sessionRemainingSeconds / 60)}:
              {String(sessionRemainingSeconds % 60).padStart(2, '0')}
            </span>
            {onLockSession && (
              <button
                onClick={onLockSession}
                className="btn btn-ghost btn-icon btn-sm"
                title="Lock Workspace Now"
                style={{ marginLeft: '4px', width: '22px', height: '22px', padding: 0 }}
              >
                <Lock size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
