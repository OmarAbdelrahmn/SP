'use client';

import React, { useState } from 'react';
import { PersonRecord } from '../types/template';
import {
  Users,
  Plus,
  Upload,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Eye,
  Edit2,
  Search,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { SAMPLE_CSV_TEMPLATE } from '../utils/csvParser';

interface PeopleManagerProps {
  people: PersonRecord[];
  activePersonIndex: number;
  onSelectPersonIndex: (index: number) => void;
  onAddPerson: (person: PersonRecord) => void;
  onUpdatePerson: (id: string, updates: Partial<PersonRecord>) => void;
  onDeletePerson: (id: string) => void;
  onToggleSelectPerson: (id: string) => void;
  onToggleSelectAll: (select: boolean) => void;
  onOpenImportCsv: () => void;
  onSwitchToDesigner: () => void;
}

export const PeopleManager: React.FC<PeopleManagerProps> = ({
  people,
  activePersonIndex,
  onSelectPersonIndex,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
  onToggleSelectPerson,
  onToggleSelectAll,
  onOpenImportCsv,
  onSwitchToDesigner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<PersonRecord>>({});

  // Quick Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newPersonData, setNewPersonData] = useState({
    name: '',
    title: '',
    company: '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    code: `ID-${1000 + people.length + 1}`,
    email: '',
    photoUrl: '',
  });

  const filteredPeople = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = people.length > 0 && people.every((p) => p.isSelected);
  const selectedCount = people.filter((p) => p.isSelected).length;

  const handleStartEdit = (person: PersonRecord) => {
    setEditingPersonId(person.id);
    setEditFormData({ ...person });
  };

  const handleSaveEdit = () => {
    if (!editingPersonId) return;
    onUpdatePerson(editingPersonId, editFormData);
    setEditingPersonId(null);
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonData.name.trim()) return;

    const newPerson: PersonRecord = {
      id: `p-${Date.now()}`,
      name: newPersonData.name.trim(),
      title: newPersonData.title.trim() || 'Participant',
      company: newPersonData.company.trim() || 'Organization',
      date: newPersonData.date.trim(),
      code: newPersonData.code.trim(),
      email: newPersonData.email.trim(),
      photoUrl: newPersonData.photoUrl.trim() || undefined,
      isSelected: true,
    };

    onAddPerson(newPerson);
    setNewPersonData({
      name: '',
      title: '',
      company: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      code: `ID-${1000 + people.length + 2}`,
      email: '',
      photoUrl: '',
    });
    setIsAdding(false);
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_people_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-main)',
      }}
    >
      {/* Top Action Bar */}
      <div
        style={{
          padding: '16px 24px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Assigned People & Data</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {selectedCount} of {people.length} people selected for generation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
            <Plus size={15} /> Add Person
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onOpenImportCsv}>
            <Upload size={15} /> Import CSV
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleDownloadSampleCsv}
            title="Download example CSV structure"
          >
            <FileSpreadsheet size={15} /> Sample CSV
          </button>
        </div>
      </div>

      {/* Quick Add Form Drawer / Card */}
      {isAdding && (
        <form
          onSubmit={handleCreatePerson}
          style={{
            padding: '16px 24px',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-accent)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 160px',
            gap: '12px',
            alignItems: 'end',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Jonathan Carter"
              value={newPersonData.name}
              onChange={(e) => setNewPersonData({ ...newPersonData, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Role / Award Title
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Senior Architect"
              value={newPersonData.title}
              onChange={(e) => setNewPersonData({ ...newPersonData, title: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Company / Institution
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Apex Dynamics"
              value={newPersonData.company}
              onChange={(e) => setNewPersonData({ ...newPersonData, company: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Date
            </label>
            <input
              type="text"
              className="input"
              value={newPersonData.date}
              onChange={(e) => setNewPersonData({ ...newPersonData, date: e.target.value })}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              ID / Serial Code
            </label>
            <input
              type="text"
              className="input"
              value={newPersonData.code}
              onChange={(e) => setNewPersonData({ ...newPersonData, code: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Check size={14} /> Save
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsAdding(false)}
            >
              <X size={14} />
            </button>
          </div>
        </form>
      )}

      {/* People Table Container */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <th style={{ padding: '12px 14px', width: '40px' }}>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => onToggleSelectAll(!allSelected)}
                  title={allSelected ? 'Deselect All' : 'Select All'}
                >
                  {allSelected ? (
                    <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th style={{ padding: '12px 14px' }}>Person / Recipient</th>
              <th style={{ padding: '12px 14px' }}>Role / Title</th>
              <th style={{ padding: '12px 14px' }}>Organization</th>
              <th style={{ padding: '12px 14px' }}>Date</th>
              <th style={{ padding: '12px 14px' }}>Code / ID</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((person) => {
              const actualIdx = people.findIndex((p) => p.id === person.id);
              const isActive = actualIdx === activePersonIndex;
              const isEditing = editingPersonId === person.id;

              return (
                <tr
                  key={person.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: isActive
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Select Checkbox */}
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onToggleSelectPerson(person.id)}
                    >
                      {person.isSelected ? (
                        <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>

                  {/* Name & Avatar */}
                  <td style={{ padding: '12px 14px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#e2e8f0',
                            border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            flexShrink: 0,
                          }}
                        >
                          {person.photoUrl ? (
                            <img
                              src={person.photoUrl}
                              alt={person.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            person.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {person.name}
                          </div>
                          {person.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {person.email}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Title / Role */}
                  <td style={{ padding: '12px 14px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      />
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>{person.title}</span>
                    )}
                  </td>

                  {/* Company */}
                  <td style={{ padding: '12px 14px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        value={editFormData.company || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                      />
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>{person.company || '—'}</span>
                    )}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '12px 14px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        value={editFormData.date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      />
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>{person.date}</span>
                    )}
                  </td>

                  {/* Code */}
                  <td style={{ padding: '12px 14px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input"
                        value={editFormData.code || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {person.code}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn-primary btn-sm btn-icon"
                            onClick={handleSaveEdit}
                            title="Save"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setEditingPersonId(null)}
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className={`btn btn-sm ${
                              isActive ? 'btn-primary' : 'btn-secondary'
                            }`}
                            onClick={() => {
                              onSelectPersonIndex(actualIdx);
                              onSwitchToDesigner();
                            }}
                            title="Preview on Template Canvas"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleStartEdit(person)}
                            title="Edit Data"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-danger-ghost btn-sm btn-icon"
                            onClick={() => onDeletePerson(person.id)}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPeople.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No People Found</div>
            <p style={{ fontSize: '0.85rem' }}>
              Add a person above or import a CSV file to generate personalized images.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
