'use client';

import React from 'react';
import { Template, TemplateField, FieldType } from '../types/template';
import {
  Type,
  Image as ImageIcon,
  QrCode,
  Trash2,
  Copy,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Sliders,
  Move,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FieldInspectorProps {
  template: Template;
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<TemplateField>) => void;
  onAddField: (type: FieldType) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (id: string) => void;
}

const FONT_OPTIONS = [
  { label: 'المراعي (Almarai - خط رسمي ومعتمد)', value: 'Almarai' },
  { label: 'تجوال (Tajawal - حديث وعصري)', value: 'Tajawal' },
  { label: 'Cairo (القاهرة - واضح وجريء)', value: 'Cairo' },
  { label: 'Inter (خط إنجليزي تقني دقيق)', value: 'Inter' },
  { label: 'Montserrat (عصري بارز)', value: 'Montserrat' },
];

const COLOR_PRESETS = [
  { name: 'أسود داكن', hex: '#111827' },
  { name: 'رمادي رسمي', hex: '#33373b' },
  { name: 'أخضر سعودي', hex: '#059669' },
  { name: 'ذهبي رسمي', hex: '#d97706' },
  { name: 'أزرق داكن', hex: '#1e3a8a' },
  { name: 'أبيض ناصع', hex: '#ffffff' },
];

export const FieldInspector: React.FC<FieldInspectorProps> = ({
  template,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onAddField,
  onDeleteField,
  onDuplicateField,
}) => {
  const selectedField = template.fields.find((f) => f.id === selectedFieldId);

  return (
    <div
      dir="rtl"
      style={{
        width: '360px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        fontFamily: "'Almarai', 'Tajawal', sans-serif",
      }}
    >
      {/* Top Header: Field Layers & Add Field */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>حقول البيانات والتخطيط</span>
        </div>

        {/* Add Field Dropdown */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAddField('text')}
            title="إضافة حقل نص"
          >
            <Type size={13} />
            <span>+ نص</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAddField('image')}
            title="إضافة صورة شخصية"
          >
            <ImageIcon size={13} />
            <span>+ صورة</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAddField('qr')}
            title="إضافة رمز QR"
          >
            <QrCode size={13} />
            <span>+ QR</span>
          </button>
        </div>
      </div>

      {/* Field List Chips / Selectors */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {template.fields.map((f) => {
          const isSel = f.id === selectedFieldId;
          return (
            <button
              key={f.id}
              onClick={() => onSelectField(f.id)}
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: isSel
                  ? '1px solid #10b981'
                  : '1px solid var(--border-subtle)',
                background: isSel
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'var(--bg-surface-elevated)',
                color: isSel ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: isSel ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: 'inherit',
              }}
            >
              {f.type === 'text' && <Type size={12} />}
              {f.type === 'image' && <ImageIcon size={12} />}
              {f.type === 'qr' && <QrCode size={12} />}
              <span>{f.name}</span>
            </button>
          );
        })}
      </div>

      {/* Inspector Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
        {selectedField ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Field Meta & Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedField.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  النوع: {selectedField.type === 'text' ? 'نص' : selectedField.type === 'image' ? 'صورة' : 'رمز استجابة QR'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onDuplicateField(selectedField.id)}
                  title="تكرار الحقل"
                >
                  <Copy size={14} />
                </button>
                <button
                  className="btn btn-danger-ghost btn-icon btn-sm"
                  onClick={() => onDeleteField(selectedField.id)}
                  title="حذف الحقل"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Field Label & Person Data Mapping */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                ربط مصدر البيانات (Data Binding)
              </label>
              <select
                className="select"
                value={selectedField.key}
                onChange={(e) => onUpdateField(selectedField.id, { key: e.target.value })}
                style={{ fontFamily: 'inherit' }}
              >
                <option value="name">الاسم الأساسي (name)</option>
                <option value="nameAr">الاسم بالعربية (nameAr)</option>
                <option value="nameEn">الاسم بالإنجليزية (nameEn)</option>
                <option value="idNumberAr">رقم الهوية بالعربية (idNumberAr)</option>
                <option value="idNumberEn">رقم الهوية بالإنجليزية (idNumberEn)</option>
                <option value="licenseTypeAr">نوع الرخصة بالعربية (licenseTypeAr)</option>
                <option value="licenseTypeEn">نوع الرخصة بالإنجليزية (licenseTypeEn)</option>
                <option value="issueDateAr">تاريخ الإصدار بالعربية (issueDateAr)</option>
                <option value="issueDateEn">تاريخ الإصدار بالإنجليزية (issueDateEn)</option>
                <option value="dobAr">تاريخ الميلاد بالعربية (dobAr)</option>
                <option value="dobEn">تاريخ الميلاد بالإنجليزية (dobEn)</option>
                <option value="nationalityAr">الجنسية بالعربية (nationalityAr)</option>
                <option value="nationalityEn">الجنسية بالإنجليزية (nationalityEn)</option>
                <option value="expiryDateAr">تاريخ الانتهاء بالعربية (expiryDateAr)</option>
                <option value="expiryDateEn">تاريخ الانتهاء بالإنجليزية (expiryDateEn)</option>
                <option value="bloodType">فصيلة الدم (bloodType)</option>
                <option value="photo">الصورة الشخصية (photo)</option>
                <option value="professionAr">المهنة (professionAr)</option>
                <option value="employerIdAr">هوية صاحب العمل (employerIdAr)</option>
                <option value="employerNameAr">اسم صاحب العمل (employerNameAr)</option>
                <option value="workPlaceAr">مكان العمل (workPlaceAr)</option>
                <option value="issuePlaceAr">مكان الإصدار (issuePlaceAr)</option>
                <option value="pobAr">مكان الميلاد (pobAr)</option>
                <option value="religionAr">الديانة (religionAr)</option>
                <option value="code">الكود / رقم البطاقة (code)</option>
                <option value="qr">رمز التحقق السريع (qr)</option>
              </select>
            </div>

            {/* Typography Section (if text) */}
            {selectedField.type === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                  }}
                >
                  الخط والتنسيق
                </div>

                {/* Font Family */}
                <div>
                  <select
                    className="select"
                    value={selectedField.fontFamily}
                    onChange={(e) => onUpdateField(selectedField.id, { fontFamily: e.target.value })}
                    style={{ fontFamily: 'inherit' }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Slider */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    <span>حجم الخط</span>
                    <span>{selectedField.fontSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="60"
                    step="0.5"
                    value={selectedField.fontSize}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, { fontSize: Number(e.target.value) })
                    }
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>

                {/* Font Weight & Style Toggles */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <select
                      className="select"
                      value={selectedField.fontWeight}
                      onChange={(e) =>
                        onUpdateField(selectedField.id, { fontWeight: e.target.value as any })
                      }
                      style={{ fontFamily: 'inherit' }}
                    >
                      <option value="400">عادي (Regular 400)</option>
                      <option value="500">متوسط (Medium 500)</option>
                      <option value="600">نصف عريض (SemiBold 600)</option>
                      <option value="700">عريض (Bold 700)</option>
                      <option value="800">عريض جداً (ExtraBold 800)</option>
                    </select>
                  </div>

                  <button
                    className={`btn btn-secondary btn-icon ${
                      selectedField.fontStyle === 'italic' ? 'btn-primary' : ''
                    }`}
                    onClick={() =>
                      onUpdateField(selectedField.id, {
                        fontStyle: selectedField.fontStyle === 'italic' ? 'normal' : 'italic',
                      })
                    }
                    title="مائل"
                  >
                    <Italic size={14} />
                  </button>

                  <button
                    className={`btn btn-secondary btn-icon ${
                      selectedField.textTransform === 'uppercase' ? 'btn-primary' : ''
                    }`}
                    onClick={() =>
                      onUpdateField(selectedField.id, {
                        textTransform:
                          selectedField.textTransform === 'uppercase' ? 'none' : 'uppercase',
                      })
                    }
                    title="أحرف كبيرة (Uppercase)"
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AA</span>
                  </button>
                </div>

                {/* Alignment */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['right', 'center', 'left'] as const).map((align) => (
                    <button
                      key={align}
                      className={`btn btn-secondary btn-sm ${
                        selectedField.textAlign === align ? 'btn-primary' : ''
                      }`}
                      style={{ flex: 1 }}
                      onClick={() => onUpdateField(selectedField.id, { textAlign: align })}
                    >
                      {align === 'right' && <AlignRight size={14} />}
                      {align === 'center' && <AlignCenter size={14} />}
                      {align === 'left' && <AlignLeft size={14} />}
                      <span>{align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'يسار'}</span>
                    </button>
                  ))}
                </div>

                {/* Color Picker */}
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    لون النص
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={selectedField.color}
                      onChange={(e) => onUpdateField(selectedField.id, { color: e.target.value })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <input
                      type="text"
                      className="input"
                      value={selectedField.color}
                      onChange={(e) => onUpdateField(selectedField.id, { color: e.target.value })}
                      style={{ width: '100px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                      {COLOR_PRESETS.map((p) => (
                        <div
                          key={p.hex}
                          onClick={() => onUpdateField(selectedField.id, { color: p.hex })}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            backgroundColor: p.hex,
                            cursor: 'pointer',
                            border:
                              selectedField.color.toLowerCase() === p.hex.toLowerCase()
                                ? '2px solid #10b981'
                                : '1px solid rgba(255,255,255,0.2)',
                          }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prefix */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    بادئة أو نص ثابت يسبق القيمة
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={selectedField.prefix || ''}
                    onChange={(e) => onUpdateField(selectedField.id, { prefix: e.target.value })}
                    placeholder="مثال: 'بطاقة رقم '"
                  />
                </div>
              </div>
            )}

            {/* Position & Size */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                }}
              >
                الموضع والأبعاد على القالب (نسبة مئوية %)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    الموضع الأفقي X (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={selectedField.x}
                    onChange={(e) => onUpdateField(selectedField.id, { x: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    الموضع الرأسي Y (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    value={selectedField.y}
                    onChange={(e) => onUpdateField(selectedField.id, { y: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  عرض الحقل / المنطقة (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="input"
                  value={selectedField.width}
                  onChange={(e) => onUpdateField(selectedField.id, { width: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            اختر أي حقل من القائمة لتعديل خصائصه وموضعه.
          </div>
        )}
      </div>
    </div>
  );
};
