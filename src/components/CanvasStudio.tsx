'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Template, TemplateField, PersonRecord } from '../types/template';
import { renderTemplateToCanvas, resolveFieldValue } from '../utils/canvasRenderer';

interface CanvasStudioProps {
  template: Template;
  person: PersonRecord;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onUpdateField: (fieldId: string, updates: Partial<TemplateField>) => void;
  zoomLevel: number;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  template,
  person,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  zoomLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [resizingFieldId, setResizingFieldId] = useState<string | null>(null);
  const [resizeType, setResizeType] = useState<'width' | 'both'>('width');
  const [dragStartPos, setDragStartPos] = useState<{ mouseX: number; mouseY: number; fieldX: number; fieldY: number; fieldW: number; fieldH: number }>({
    mouseX: 0,
    mouseY: 0,
    fieldX: 0,
    fieldY: 0,
    fieldW: 0,
    fieldH: 0,
  });

  // Snap guidelines indicators
  const [snapX, setSnapX] = useState<boolean>(false);
  const [snapY, setSnapY] = useState<boolean>(false);

  // Render canvas whenever template, person, or fields update
  useEffect(() => {
    if (!canvasRef.current) return;
    let isCancelled = false;

    renderTemplateToCanvas(canvasRef.current, template, person, {
      highlightFieldId: selectedFieldId,
    }).catch((err) => {
      if (!isCancelled) console.error('Error rendering template to canvas:', err);
    });

    return () => {
      isCancelled = true;
    };
  }, [template, person, selectedFieldId]);

  // Handle Dragging / Resizing
  const handlePointerDown = (
    e: React.PointerEvent,
    field: TemplateField,
    action: 'drag' | 'resize-w' | 'resize-se'
  ) => {
    e.stopPropagation();
    onSelectField(field.id);

    const clientX = e.clientX;
    const clientY = e.clientY;

    setDragStartPos({
      mouseX: clientX,
      mouseY: clientY,
      fieldX: field.x,
      fieldY: field.y,
      fieldW: field.width,
      fieldH: field.height || field.width,
    });

    if (action === 'drag') {
      setDraggingFieldId(field.id);
    } else if (action === 'resize-w') {
      setResizingFieldId(field.id);
      setResizeType('width');
    } else if (action === 'resize-se') {
      setResizingFieldId(field.id);
      setResizeType('both');
    }

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const currentCanvasWidth = rect.width;
      const currentCanvasHeight = rect.height;

      const deltaX = e.clientX - dragStartPos.mouseX;
      const deltaY = e.clientY - dragStartPos.mouseY;

      // Convert delta to percentage of rendered canvas
      const deltaPercentX = (deltaX / currentCanvasWidth) * 100;
      const deltaPercentY = (deltaY / currentCanvasHeight) * 100;

      if (draggingFieldId) {
        let newX = Math.round((dragStartPos.fieldX + deltaPercentX) * 10) / 10;
        let newY = Math.round((dragStartPos.fieldY + deltaPercentY) * 10) / 10;

        // Snapping near 50% (center)
        if (Math.abs(newX - 50) < 1.2) {
          newX = 50;
          setSnapX(true);
        } else {
          setSnapX(false);
        }

        if (Math.abs(newY - 50) < 1.2) {
          newY = 50;
          setSnapY(true);
        } else {
          setSnapY(false);
        }

        // Clamp inside bounds
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(5, Math.min(95, newY));

        onUpdateField(draggingFieldId, { x: newX, y: newY });
      } else if (resizingFieldId) {
        // Resize width or both width and height
        const newWidth = Math.max(10, Math.min(90, Math.round((dragStartPos.fieldW + deltaPercentX * 2) * 10) / 10));
        const updates: Partial<TemplateField> = { width: newWidth };

        if (resizeType === 'both') {
          const newHeight = Math.max(8, Math.min(80, Math.round((dragStartPos.fieldH + deltaPercentY * 2) * 10) / 10));
          updates.height = newHeight;
        }

        onUpdateField(resizingFieldId, updates);
      }
    },
    [draggingFieldId, resizingFieldId, dragStartPos, resizeType, onUpdateField]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingFieldId(null);
    setResizingFieldId(null);
    setSnapX(false);
    setSnapY(false);
  }, []);

  // Keyboard navigation for nudge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFieldId) return;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName);
      if (isInput) return;

      const field = template.fields.find((f) => f.id === selectedFieldId);
      if (!field) return;

      const step = e.shiftKey ? 1.5 : 0.4;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateField(selectedFieldId, { x: Math.max(0, field.x - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateField(selectedFieldId, { x: Math.min(100, field.x + step) });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateField(selectedFieldId, { y: Math.max(0, field.y - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateField(selectedFieldId, { y: Math.min(100, field.y + step) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, template.fields, onUpdateField]);

  // Compute display size scaled to viewport and zoom level
  const baseDisplayWidth = 840;
  const aspect = template.naturalWidth / template.naturalHeight;
  const displayWidth = baseDisplayWidth * zoomLevel;
  const displayHeight = displayWidth / aspect;

  return (
    <div
      ref={containerRef}
      className="canvas-viewport"
      onClick={() => onSelectField(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        padding: '40px',
        cursor: draggingFieldId ? 'grabbing' : 'default',
      }}
    >
      <div
        className="canvas-wrapper"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          position: 'relative',
        }}
      >
        {/* HTML5 High-Resolution Rendering Canvas */}
        <canvas
          ref={canvasRef}
          className="canvas-element"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />

        {/* Snap guidelines */}
        {snapX && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '1px',
              backgroundColor: '#06b6d4',
              boxShadow: '0 0 6px #06b6d4',
              zIndex: 90,
              pointerEvents: 'none',
            }}
          />
        )}
        {snapY && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '1px',
              backgroundColor: '#06b6d4',
              boxShadow: '0 0 6px #06b6d4',
              zIndex: 90,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Interactive Field Overlay Targets */}
        {template.fields.map((field) => {
          const isSelected = field.id === selectedFieldId;
          const val = resolveFieldValue(field, person);

          // Scaled font size for overlay box estimation
          const scale = displayWidth / 1000;
          const boxHeightPx =
            field.type === 'text'
              ? Math.max(28, field.fontSize * scale * 1.5)
              : ((field.height || field.width) / 100) * displayHeight;

          return (
            <div
              key={field.id}
              className={`field-overlay-box ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${field.x}%`,
                top: `${field.y}%`,
                width: `${field.width}%`,
                height: `${boxHeightPx}px`,
                transform:
                  field.type === 'text'
                    ? field.textAlign === 'right'
                      ? 'translate(-100%, -50%)'
                      : field.textAlign === 'left'
                      ? 'translate(0%, -50%)'
                      : 'translate(-50%, -50%)'
                    : 'translate(-50%, -50%)',
                zIndex: isSelected ? 40 : field.zIndex,
              }}
              onPointerDown={(e) => handlePointerDown(e, field, 'drag')}
              onClick={(e) => {
                e.stopPropagation();
                onSelectField(field.id);
              }}
            >
              {/* Badge label showing field name */}
              {isSelected && (
                <>
                  <div className="field-badge-tag">
                    {field.name} ({Math.round(field.x)}%, {Math.round(field.y)}%)
                  </div>

                  {/* Resize handle for width */}
                  <div
                    className="field-resize-handle handle-e"
                    onPointerDown={(e) => handlePointerDown(e, field, 'resize-w')}
                  />

                  {/* Resize handle for width and height (images / QR) */}
                  {(field.type === 'image' || field.type === 'qr') && (
                    <div
                      className="field-resize-handle handle-se"
                      onPointerDown={(e) => handlePointerDown(e, field, 'resize-se')}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
