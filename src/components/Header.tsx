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
      dir="rtl"
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
        fontFamily: "'Almarai', 'Tajawal', sans-serif",
      }}
    >
      {/* Brand & Active Template */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px', color: '#f8fafc' }}>
                منظومة البطاقات والرخص
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  borderRadius: '4px',
                  fontWeight: 700,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                نظام فوري
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              إصدار وطباعة رخص القيادة وهوية مقيم وبطاقات النقل
            </div>
          </div>
        </div>

        <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

        {/* Template Selector Trigger */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenTemplateSelector}
          title="تغيير أو اختيار نموذج آخر"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px' }}
        >
          <Layers size={15} style={{ color: '#10b981' }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
          >
            {activeTemplate.name}
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.08)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600,
            }}
          >
            تغيير
          </span>
        </button>
      </div>

      {/* Center Controls: Main Workflow Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => onTabChange('form')}
          >
            <CreditCard size={15} />
            <span>تعبئة فورية وتحميل</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'sheet' ? 'active' : ''}`}
            onClick={() => onTabChange('sheet')}
          >
            <FileSpreadsheet size={15} />
            <span>جدول الدفعة (Excel)</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => onTabChange('designer')}
          >
            <Layers size={15} />
            <span>المحرر البصري</span>
          </button>
        </div>

        {/* Live Person Preview Switcher */}
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
              title="الشخص السابق"
            >
              <ChevronRight size={14} />
            </button>

            <select
              value={activePersonIndex}
              onChange={(e) => onSelectPersonIndex(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '190px',
                fontFamily: 'inherit',
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
              title="الشخص التالي"
            >
              <ChevronLeft size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Zoom, Single & Batch Export */}
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
              title="تصغير"
            >
              <ZoomOut size={14} />
            </button>
            <span
              style={{
                fontSize: '0.75rem',
                minWidth: '40px',
                textAlign: 'center',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onZoomChange(Math.min(2.0, zoomLevel + 0.1))}
              title="تكبير"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onZoomChange(0.85)}
              title="إعادة ضبط الحجم"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={onDownloadSingle}
          title="تحميل البطاقة المعروضة حالياً كصورة عالية الدقة"
        >
          <Download size={14} />
          <span>تحميل البطاقة</span>
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenBatchExport}
          title="تصدير جميع السجلات المحددة في ملف ZIP واحد"
        >
          <Archive size={14} />
          <span>تصدير الكل ({selectedCount})</span>
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
              marginRight: '4px',
            }}
            title="جلسة آمنة: تنتهي الصلاحية تلقائياً كل 15 دقيقة"
          >
            <Clock size={13} style={{ color: sessionRemainingSeconds < 120 ? '#ef4444' : '#10b981' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {Math.floor(sessionRemainingSeconds / 60)}:
              {String(sessionRemainingSeconds % 60).padStart(2, '0')}
            </span>
            {onLockSession && (
              <button
                onClick={onLockSession}
                className="btn btn-ghost btn-icon btn-sm"
                title="قفل المنظومة الآن"
                style={{ marginRight: '4px', width: '22px', height: '22px', padding: 0 }}
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
