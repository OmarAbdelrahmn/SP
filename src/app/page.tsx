'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Template, TemplateField, PersonRecord, FieldType } from '../types/template';
import { DEFAULT_TEMPLATES } from '../utils/defaultTemplates';
import { INITIAL_PEOPLE } from '../utils/samplePeople';
import { Header, AppTabMode } from '../components/Header';
import { FormFillStudio } from '../components/FormFillStudio';
import { SheetBatchStudio } from '../components/SheetBatchStudio';
import { CanvasStudio } from '../components/CanvasStudio';
import { FieldInspector } from '../components/FieldInspector';
import { TemplateSelector } from '../components/TemplateSelector';
import { ImportCsvModal } from '../components/ImportCsvModal';
import { BatchExportModal } from '../components/BatchExportModal';
import { AuthGate } from '../components/AuthGate';
import { exportSingleImage } from '../utils/canvasRenderer';

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_STORAGE_KEY = 'certicraft_session_expires_at';

export default function Home() {
  // Authentication & 15-Minute Expiry State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(15 * 60);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);

  const [people, setPeople] = useState<PersonRecord[]>(INITIAL_PEOPLE);
  const [activePersonIndex, setActivePersonIndex] = useState<number>(0);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    DEFAULT_TEMPLATES[0].fields[0]?.id || null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);

  // Default active tab is 'form' for quick fill & download
  const [activeTab, setActiveTab] = useState<AppTabMode>('form');

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isBatchExportModalOpen, setIsBatchExportModalOpen] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const expiresAt = Number(stored);
        const now = Date.now();
        if (now < expiresAt) {
          setIsAuthenticated(true);
          setSessionRemainingSeconds(Math.max(0, Math.floor((expiresAt - now) / 1000)));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsAuthenticated(false);
          setSessionExpiredMessage('انتهت صلاحية الجلسة السابقة (15 دقيقة). يرجى إدخال كلمة المرور مجدداً.');
        }
      }
    } catch {
      // Storage unavailable
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  // 15-Minute Countdown & Auto-Timeout Timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) {
          setIsAuthenticated(false);
          setSessionExpiredMessage('انتهت صلاحية الجلسة. يرجى إدخال كلمة المرور مجدداً.');
          return;
        }

        const expiresAt = Number(stored);
        const remaining = Math.floor((expiresAt - Date.now()) / 1000);

        if (remaining <= 0) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setIsAuthenticated(false);
          setSessionExpiredMessage('انتهت صلاحية الجلسة (15 دقيقة). يرجى فتح المنظومة مجدداً.');
        } else {
          setSessionRemainingSeconds(remaining);
        }
      } catch {
        // Fallback decrement
        setSessionRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsAuthenticated(false);
            setSessionExpiredMessage('انتهت صلاحية الجلسة (15 دقيقة).');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleUnlock = () => {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, String(expiresAt));
    } catch {
      // ignore
    }
    setIsAuthenticated(true);
    setSessionRemainingSeconds(15 * 60);
    setSessionExpiredMessage(null);
  };

  const handleLockSession = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setSessionExpiredMessage('تم قفل المنظومة بنجاح.');
  };

  // Active items
  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];
  const activePerson = people[activePersonIndex] || people[0];

  // Field manipulation handlers
  const handleUpdateField = useCallback(
    (fieldId: string, updates: Partial<TemplateField>) => {
      setTemplates((prevTemplates) =>
        prevTemplates.map((tmpl) => {
          if (tmpl.id !== activeTemplateId) return tmpl;
          return {
            ...tmpl,
            fields: tmpl.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
          };
        })
      );
    },
    [activeTemplateId]
  );

  const handleAddField = useCallback(
    (type: FieldType) => {
      const newFieldId = `field-${Date.now()}`;
      let newField: TemplateField;

      if (type === 'text') {
        newField = {
          id: newFieldId,
          name: 'Custom Text',
          key: 'custom:text',
          type: 'text',
          x: 50,
          y: 50,
          width: 50,
          fontFamily: 'Cairo',
          fontSize: 18,
          fontWeight: '600',
          fontStyle: 'normal',
          color: '#1e293b',
          textAlign: 'center',
          textTransform: 'none',
          letterSpacing: 0,
          lineHeight: 1.2,
          opacity: 1,
          prefix: 'New Text',
          zIndex: activeTemplate.fields.length + 1,
        };
      } else if (type === 'image') {
        newField = {
          id: newFieldId,
          name: 'Profile Photo',
          key: 'photo',
          type: 'image',
          x: 50,
          y: 35,
          width: 20,
          height: 20,
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: '400',
          fontStyle: 'normal',
          color: '#ffffff',
          textAlign: 'center',
          textTransform: 'none',
          letterSpacing: 0,
          lineHeight: 1,
          opacity: 1,
          imageShape: 'circle',
          borderWidth: 2,
          borderColor: '#6366f1',
          zIndex: activeTemplate.fields.length + 1,
        };
      } else {
        newField = {
          id: newFieldId,
          name: 'QR Code',
          key: 'qr',
          type: 'qr',
          x: 50,
          y: 75,
          width: 15,
          height: 15,
          fontFamily: 'Cairo',
          fontSize: 12,
          fontWeight: '400',
          fontStyle: 'normal',
          color: '#000000',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          textTransform: 'none',
          letterSpacing: 0,
          lineHeight: 1,
          opacity: 1,
          zIndex: activeTemplate.fields.length + 1,
        };
      }

      setTemplates((prevTemplates) =>
        prevTemplates.map((tmpl) => {
          if (tmpl.id !== activeTemplateId) return tmpl;
          return {
            ...tmpl,
            fields: [...tmpl.fields, newField],
          };
        })
      );
      setSelectedFieldId(newFieldId);
    },
    [activeTemplateId, activeTemplate.fields.length]
  );

  const handleDeleteField = useCallback(
    (fieldId: string) => {
      setTemplates((prevTemplates) =>
        prevTemplates.map((tmpl) => {
          if (tmpl.id !== activeTemplateId) return tmpl;
          return {
            ...tmpl,
            fields: tmpl.fields.filter((f) => f.id !== fieldId),
          };
        })
      );
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    },
    [activeTemplateId, selectedFieldId]
  );

  const handleDuplicateField = useCallback(
    (fieldId: string) => {
      const field = activeTemplate.fields.find((f) => f.id === fieldId);
      if (!field) return;

      const duplicated: TemplateField = {
        ...field,
        id: `field-${Date.now()}`,
        name: `${field.name} (Copy)`,
        x: Math.min(95, field.x + 3),
        y: Math.min(95, field.y + 3),
        zIndex: activeTemplate.fields.length + 1,
      };

      setTemplates((prevTemplates) =>
        prevTemplates.map((tmpl) => {
          if (tmpl.id !== activeTemplateId) return tmpl;
          return {
            ...tmpl,
            fields: [...tmpl.fields, duplicated],
          };
        })
      );
      setSelectedFieldId(duplicated.id);
    },
    [activeTemplate, activeTemplateId]
  );

  // People manipulation handlers
  const handleAddPerson = (newPerson: PersonRecord) => {
    setPeople((prev) => [newPerson, ...prev]);
    setActivePersonIndex(0);
  };

  const handleUpdatePerson = (id: string, updates: Partial<PersonRecord>) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleDeletePerson = (id: string) => {
    setPeople((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (activePersonIndex >= updated.length) {
        setActivePersonIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleToggleSelectPerson = (id: string) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  };

  const handleToggleSelectAll = (select: boolean) => {
    setPeople((prev) => prev.map((p) => ({ ...p, isSelected: select })));
  };

  const handleImportPeople = (imported: PersonRecord[], replaceExisting: boolean) => {
    if (replaceExisting) {
      setPeople(imported);
      setActivePersonIndex(0);
    } else {
      setPeople((prev) => [...imported, ...prev]);
      setActivePersonIndex(0);
    }
  };

  // Single Image Download
  const handleDownloadSingle = async () => {
    if (!activePerson) return;
    try {
      const blob = await exportSingleImage(activeTemplate, activePerson, 'image/png');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = activePerson.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
      link.download = `${activeTemplate.id}_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Could not export image. Please ensure image assets are accessible.');
    }
  };

  // Prevent flash while checking local session
  if (isAuthChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  // Authentication gate: requires P@ssword1234, auto-expires every 15 minutes
  if (!isAuthenticated) {
    return (
      <AuthGate
        onUnlock={handleUnlock}
        expiredReason={sessionExpiredMessage}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <Header
        activeTemplate={activeTemplate}
        onOpenTemplateSelector={() => setIsTemplateModalOpen(true)}
        people={people}
        activePersonIndex={activePersonIndex}
        onSelectPersonIndex={setActivePersonIndex}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onDownloadSingle={handleDownloadSingle}
        onOpenBatchExport={() => setIsBatchExportModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sessionRemainingSeconds={sessionRemainingSeconds}
        onLockSession={handleLockSession}
      />

      {/* Main Workspace based on Active Workflow Tab */}
      <main className="app-main">
        {activeTab === 'form' && (
          <FormFillStudio
            template={activeTemplate}
            activePerson={activePerson}
            onUpdatePerson={handleUpdatePerson}
            onDownloadCard={handleDownloadSingle}
            templates={templates}
            onSelectTemplate={(id) => {
              setActiveTemplateId(id);
              const tmpl = templates.find((t) => t.id === id);
              if (tmpl && tmpl.fields.length > 0) {
                setSelectedFieldId(tmpl.fields[0].id);
              }
            }}
          />
        )}

        {activeTab === 'sheet' && (
          <SheetBatchStudio
            template={activeTemplate}
            people={people}
            activePersonIndex={activePersonIndex}
            onSelectPersonIndex={setActivePersonIndex}
            onImportPeople={handleImportPeople}
            onDeletePerson={handleDeletePerson}
            onToggleSelectPerson={handleToggleSelectPerson}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenBatchExport={() => setIsBatchExportModalOpen(true)}
            onSwitchToForm={() => setActiveTab('form')}
          />
        )}

        {activeTab === 'designer' && (
          <>
            <CanvasStudio
              template={activeTemplate}
              person={activePerson}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onUpdateField={handleUpdateField}
              zoomLevel={zoomLevel}
            />
            <FieldInspector
              template={activeTemplate}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onUpdateField={handleUpdateField}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              onDuplicateField={handleDuplicateField}
            />
          </>
        )}
      </main>

      {/* Modals */}
      <TemplateSelector
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        activeTemplateId={activeTemplateId}
        onSelectTemplate={(id) => {
          setActiveTemplateId(id);
          const tmpl = templates.find((t) => t.id === id);
          if (tmpl && tmpl.fields.length > 0) {
            setSelectedFieldId(tmpl.fields[0].id);
          } else {
            setSelectedFieldId(null);
          }
        }}
        onAddNewTemplate={(newTmpl) => {
          setTemplates((prev) => [newTmpl, ...prev]);
        }}
      />

      <ImportCsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportPeople={handleImportPeople}
      />

      <BatchExportModal
        isOpen={isBatchExportModalOpen}
        onClose={() => setIsBatchExportModalOpen(false)}
        template={activeTemplate}
        people={people}
      />
    </div>
  );
}
