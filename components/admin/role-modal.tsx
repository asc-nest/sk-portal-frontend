'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

interface PermissionItem {
  id: number;
  name: string;
  label: string;
}

interface RoleItem {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  user_count?: number;
}

interface RoleModalProps {
  role?: RoleItem | null;
  allPermissions: PermissionItem[];
  onClose: () => void;
  onSaved: () => void;
}

const SYSTEM_ROLES = ['super_admin', 'sk_chairperson', 'sk_secretary', 'sk_treasurer', 'sk_kagawad'];

export default function RoleModal({
  role,
  allPermissions,
  onClose,
  onSaved,
}: RoleModalProps) {
  const isEdit = Boolean(role);
  const isSystemRole = isEdit && role ? SYSTEM_ROLES.includes(role.name) : false;

  const [name, setName] = useState(role?.name || '');
  const [displayName, setDisplayName] = useState(role?.display_name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role?.permissions || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDisplayName(role.display_name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions || []);
    } else {
      setName('');
      setDisplayName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [role]);

  const togglePermission = (permName: string) => {
    if (selectedPermissions.includes(permName)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permName));
    } else {
      setSelectedPermissions([...selectedPermissions, permName]);
    }
  };

  const selectAll = () => {
    setSelectedPermissions(allPermissions.map((p) => p.name));
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Please provide a display title for this role.');
      return;
    }

    if (!isEdit && !name.trim()) {
      setError('Please provide a system identifier slug for this role.');
      return;
    }

    try {
      setLoading(true);

      if (isEdit && role) {
        const payload: Record<string, any> = {
          display_name: displayName.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        };
        await apiClient.put(`/admin/roles/${role.id}`, payload);
      } else {
        const payload = {
          name: name.trim().toLowerCase().replace(/\s+/g, '_'),
          display_name: displayName.trim(),
          description: description.trim(),
          permissions: selectedPermissions,
        };
        await apiClient.post('/admin/roles', payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save role.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-[#efedf0] overflow-hidden">
        {/* Header */}
        <div className="bg-[#242424] text-white p-5 sm:p-6 flex items-center justify-between border-b-4 border-[#ba0c00]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ba0c00] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                {isEdit ? 'admin_panel_settings' : 'add_moderator'}
              </span>
            </div>
            <div>
              <h3 className="font-['Poppins'] text-lg font-bold text-white">
                {isEdit ? 'Edit RBAC Role' : 'Create New RBAC Role'}
              </h3>
              <p className="text-xs text-neutral-300">
                {isEdit
                  ? `Update capabilities and details for ${role?.display_name || role?.name}`
                  : 'Define a new executive role and assign its Spatie capabilities.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* System Name & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                <span>System Role Slug</span>
                {isSystemRole && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold">
                    System Protected
                  </span>
                )}
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. sk_auditor"
                className={`w-full h-11 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                  isEdit
                    ? 'bg-[#f5f3f6] text-[#74777e] border border-[#e2e4ea] cursor-not-allowed select-none'
                    : 'bg-white text-[#1b1c1e] border border-[#c4c6ce] focus:outline-none focus:border-[#ba0c00]'
                }`}
              />
              <span className="text-[10px] text-[#74777e] mt-1 block">
                {isEdit ? 'System identifier slug cannot be changed.' : 'Lowercase, numbers, and underscores only.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
                Display Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. SK Auditor"
                className="w-full h-11 px-3 bg-white border border-[#c4c6ce] rounded-lg text-xs font-medium text-[#1b1c1e] focus:outline-none focus:border-[#ba0c00]"
              />
              <span className="text-[10px] text-[#74777e] mt-1 block">
                Human-readable title displayed across portals and badges.
              </span>
            </div>
          </div>

          {/* Role Description */}
          <div>
            <label className="block text-xs font-bold text-[#0e0f0f] uppercase mb-1">
              Role Description &amp; Responsibilities
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the executive duties and institutional responsibilities of this role..."
              className="w-full p-3 bg-white border border-[#c4c6ce] rounded-lg text-xs text-[#1b1c1e] focus:outline-none focus:border-[#ba0c00] outline-none"
            />
          </div>

          {/* Assigned Capabilities / Permissions */}
          <div className="pt-3 border-t border-[#efedf0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-[#0e0f0f] uppercase tracking-wider">
                  Assigned Spatie Capabilities ({selectedPermissions.length} / {allPermissions.length})
                </label>
                <p className="text-[11px] text-[#74777e]">
                  Check the functional system permissions granted to officials with this role.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#ba0c00] hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-200"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#74777e] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer border border-[#c4c6ce]"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {allPermissions.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-xs text-[#74777e] italic bg-[#faf9fb] rounded-xl border border-[#efedf0]">
                  No system permissions available.
                </div>
              ) : (
                allPermissions.map((perm) => {
                  const checked = selectedPermissions.includes(perm.name);
                  return (
                    <label
                      key={perm.id || perm.name}
                      onClick={() => togglePermission(perm.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                        checked
                          ? 'bg-red-50/60 border-[#ba0c00]/40 shadow-xs'
                          : 'bg-[#faf9fb] border-[#efedf0] hover:bg-white hover:border-[#c4c6ce]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 rounded text-[#ba0c00] focus:ring-0 cursor-pointer accent-[#ba0c00]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-xs text-[#0e0f0f] block truncate">
                          {perm.label || perm.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#74777e] block">
                          {perm.name}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#efedf0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-[#c4c6ce] text-[#43474d] text-xs font-bold hover:bg-[#faf9fb] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#ba0c00] hover:bg-[#920a00] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isEdit ? 'save' : 'add'}
              </span>
              <span>{loading ? 'Saving...' : isEdit ? 'Save Role Changes' : 'Create Role'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

