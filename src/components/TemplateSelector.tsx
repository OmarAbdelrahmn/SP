'use client';

import React, { useRef, useState } from 'react';
import { Template } from '../types/template';
import { Upload, Plus, Check, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface TemplateSelectorProps {
  templates: Template[];
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onAddNewTemplate: (newTemplate: Template) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onAddNewTemplate,
  isOpen,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState<'certificate' | 'badge' | 'voucher' | 'custom'>('badge');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setPreviewUrl(url);
      if (!templateName) {
        setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
      }

      const img = new Image();
      img.onload = () => {
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTemplate = () => {
    if (!previewUrl || !naturalDimensions) return;

    const newTemplate: Template = {
      id: `tmpl-custom-${Date.now()}`,
      name: templateName.trim() || 'قالب مخصص جديد',
      category: templateCategory,
      imageUrl: previewUrl,
      naturalWidth: naturalDimensions.width,
      naturalHeight: naturalDimensions.height,
      createdAt: Date.now(),
      fields: [
        {
          id: `f-name-${Date.now()}`,
          name: 'الاسم',
          key: 'name',
          type: 'text',
          x: 50,
          y: 48,
          width: 70,
          fontFamily: 'Almarai',
          fontSize: 24,
          fontWeight: '700',
          fontStyle: 'normal',
          color: '#111827',
          textAlign: 'center',
          textTransform: 'none',
          letterSpacing: 0,
          lineHeight: 1.2,
          opacity: 1,
          zIndex: 1,
        },
        {
          id: `f-code-${Date.now()}`,
          name: 'رقم الهوية / الكود',
          key: 'code',
          type: 'text',
          x: 50,
          y: 58,
          width: 50,
          fontFamily: 'Almarai',
          fontSize: 16,
          fontWeight: '500',
          fontStyle: 'normal',
          color: '#111827',
          textAlign: 'center',
          textTransform: 'none',
          letterSpacing: 0,
          lineHeight: 1.2,
          opacity: 1,
          zIndex: 2,
        },
      ],
    };

    onAddNewTemplate(newTemplate);
    onSelectTemplate(newTemplate.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} dir="rtl">
      <div
        className="modal-content"
        style={{ maxWidth: '850px', fontFamily: "'Almarai', 'Tajawal', sans-serif" }}
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
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                نماذج البطاقات والرخص
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                اختر النموذج المطلوب لطباعته أو ارفع قالب بطاقة جديد مخصص
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="إغلاق">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
          {/* Preset templates list */}
          <div style={{ marginBottom: '28px' }}>
            <h3
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '14px',
                fontWeight: 700,
              }}
            >
              النماذج الرسمية الجاهزة والمعتمدة
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {templates.map((tmpl) => {
                const isSelected = tmpl.id === activeTemplateId;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      onSelectTemplate(tmpl.id);
                      onClose();
                    }}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid #10b981'
                        : '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'var(--bg-surface-elevated)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        height: '140px',
                        background: '#090d16',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tmpl.imageUrl}
                        alt={tmpl.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: 0.95,
                          background: '#fff',
                        }}
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: '#10b981',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: isSelected ? '#10b981' : 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        {tmpl.name}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>{tmpl.fields.length} حقل بيانات مدمج</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>جاهز للطباعة</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Custom Template Section */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '14px',
                fontWeight: 700,
              }}
            >
              رفع قالب صورة مخصص جديد
            </h3>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  padding: '36px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  background: 'rgba(16, 185, 129, 0.03)',
                  transition: 'background 0.2s',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                  }}
                >
                  <Upload size={22} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
                    اضغط هنا لاختيار صورة أو اسحب القالب وأفلته
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    يدعم صور عالية الدقة بصيغة PNG أو JPG أو WebP (بطاقات، رخص، هويات)
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '180px',
                    height: '130px',
                    background: '#07090e',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '6px',
                      }}
                    >
                      اسم النموذج
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="مثال: رخصة قيادة خاصة جديدة"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '6px',
                        }}
                      >
                        أبعاد الصورة الأصلية
                      </label>
                      <div
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {naturalDimensions
                          ? `${naturalDimensions.width} × ${naturalDimensions.height} بكسل`
                          : 'جاري التحميل...'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary" onClick={handleCreateTemplate}>
                      <Plus size={16} /> اعتماد هذا القالب
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setPreviewUrl(null);
                        setNaturalDimensions(null);
                      }}
                    >
                      اختيار صورة أخرى
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
