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
  { label: 'Playfair Display (Serif Elegance)', value: 'Playfair Display' },
  { label: 'Cinzel (Classical Ornate Serif)', value: 'Cinzel' },
  { label: 'Montserrat (Modern Bold Sans)', value: 'Montserrat' },
  { label: 'Inter (Clean Technical Sans)', value: 'Inter' },
  { label: 'Outfit (Geometric Contemporary)', value: 'Outfit' },
  { label: 'Great Vibes (Calligraphy Script)', value: 'Great Vibes' },
  { label: 'JetBrains Mono (Monospace Tech)', value: 'JetBrains Mono' },
];

const COLOR_PRESETS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Obsidian Black', hex: '#0f172a' },
  { name: 'Prestige Gold', hex: '#d97706' },
  { name: 'Royal Navy', hex: '#1e3a8a' },
  { name: 'Emerald Green', hex: '#047857' },
  { name: 'Cyber Violet', hex: '#9333ea' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Silver Slate', hex: '#64748b' },
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
      style={{
        width: '360px',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
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
          <Layers size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Data Fields & Layout</span>
        </div>

        {/* Add Field Dropdown */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAddField('text')}
            title="Add Text Field"
          >
            <Type size={13} />
            <span>+ Text</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAddField('image')}
            title="Add Photo / Avatar"
          >
            <ImageIcon size={13} />
            <span>+ Photo</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onAddField('qr')}
            title="Add QR Code"
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
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-subtle)',
                background: isSel
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'var(--bg-surface-elevated)',
                color: isSel ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: isSel ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
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
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedField.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Type: {selectedField.type.toUpperCase()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onDuplicateField(selectedField.id)}
                  title="Duplicate Field"
                >
                  <Copy size={14} />
                </button>
                <button
                  className="btn btn-danger-ghost btn-icon btn-sm"
                  onClick={() => onDeleteField(selectedField.id)}
                  title="Delete Field"
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
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Data Binding Property
              </label>
              <select
                className="select"
                value={selectedField.key}
                onChange={(e) => onUpdateField(selectedField.id, { key: e.target.value })}
              >
                <option value="name">Recipient Full Name (name)</option>
                <option value="title">Role / Award Title (title)</option>
                <option value="date">Issue Date (date)</option>
                <option value="code">ID / Certificate Code (code)</option>
                <option value="company">Organization / Company (company)</option>
                <option value="email">Email Address (email)</option>
                <option value="photo">Profile Photo / Avatar (photo)</option>
                <option value="qr">QR Code Verification (qr)</option>
                <option value="custom:static">Static Text / Badge Label</option>
              </select>
            </div>

            {/* Typography Section (if text) */}
            {selectedField.type === 'text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Typography & Font
                </div>

                {/* Font Family */}
                <div>
                  <select
                    className="select"
                    value={selectedField.fontFamily}
                    onChange={(e) => onUpdateField(selectedField.id, { fontFamily: e.target.value })}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Slider & Number */}
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
                    <span>Font Size</span>
                    <span>{selectedField.fontSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={selectedField.fontSize}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, { fontSize: Number(e.target.value) })
                    }
                    style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
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
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">ExtraBold (800)</option>
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
                    title="Italic"
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
                    title="Uppercase"
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AA</span>
                  </button>
                </div>

                {/* Alignment */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      className={`btn btn-secondary btn-sm ${
                        selectedField.textAlign === align ? 'btn-primary' : ''
                      }`}
                      style={{ flex: 1 }}
                      onClick={() => onUpdateField(selectedField.id, { textAlign: align })}
                    >
                      {align === 'left' && <AlignLeft size={14} />}
                      {align === 'center' && <AlignCenter size={14} />}
                      {align === 'right' && <AlignRight size={14} />}
                      <span style={{ textTransform: 'capitalize' }}>{align}</span>
                    </button>
                  ))}
                </div>

                {/* Color Swatches & Picker */}
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    Text Color
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
                      style={{ width: '100px' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                      {COLOR_PRESETS.slice(0, 4).map((p) => (
                        <div
                          key={p.hex}
                          onClick={() => onUpdateField(selectedField.id, { color: p.hex })}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: p.hex,
                            cursor: 'pointer',
                            border:
                              selectedField.color.toLowerCase() === p.hex.toLowerCase()
                                ? '2px solid #6366f1'
                                : '1px solid rgba(255,255,255,0.2)',
                          }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prefix / Static Text */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    Prefix or Static Text
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={selectedField.prefix || ''}
                    onChange={(e) => onUpdateField(selectedField.id, { prefix: e.target.value })}
                    placeholder="e.g. 'Date: ' or 'CERT-ID: '"
                  />
                </div>
              </div>
            )}

            {/* Photo / Avatar Specific Settings */}
            {selectedField.type === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Photo Shape & Border
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['circle', 'rounded', 'rect'] as const).map((shape) => (
                    <button
                      key={shape}
                      className={`btn btn-secondary btn-sm ${
                        selectedField.imageShape === shape ? 'btn-primary' : ''
                      }`}
                      style={{ flex: 1, textTransform: 'capitalize' }}
                      onClick={() => onUpdateField(selectedField.id, { imageShape: shape })}
                    >
                      {shape}
                    </button>
                  ))}
                </div>

                {/* Border controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Border Width
                    </div>
                    <input
                      type="number"
                      className="input"
                      min="0"
                      max="10"
                      value={selectedField.borderWidth || 0}
                      onChange={(e) =>
                        onUpdateField(selectedField.id, { borderWidth: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Border Color
                    </div>
                    <input
                      type="color"
                      value={selectedField.borderColor || '#a855f7'}
                      onChange={(e) =>
                        onUpdateField(selectedField.id, { borderColor: e.target.value })
                      }
                      style={{
                        width: '100%',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Position & Dimensions */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)',
                }}
              >
                Coordinates & Boundary (%)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>X (Center %)</span>
                  <input
                    type="number"
                    className="input"
                    step="0.5"
                    min="0"
                    max="100"
                    value={Math.round(selectedField.x * 10) / 10}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, { x: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Y (Center %)</span>
                  <input
                    type="number"
                    className="input"
                    step="0.5"
                    min="0"
                    max="100"
                    value={Math.round(selectedField.y * 10) / 10}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, { y: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Width (%)</span>
                  <input
                    type="number"
                    className="input"
                    step="1"
                    min="5"
                    max="100"
                    value={Math.round(selectedField.width)}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, { width: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Height (%)</span>
                  <input
                    type="number"
                    className="input"
                    step="1"
                    min="5"
                    max="100"
                    value={Math.round(selectedField.height || selectedField.width)}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, { height: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '20px',
            }}
          >
            <Move size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              No Field Selected
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
              Click on any field on the canvas or select from the field chips above to adjust its font, color, position, and data binding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
