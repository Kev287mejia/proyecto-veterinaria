"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const confirmChange = confirm(`¿Estás seguro que deseas cambiar el rol de este usuario a ${newRole}?`);
    if (!confirmChange) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert("Rol actualizado exitosamente.");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Hubo un error al actualizar el rol.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#1e293b] p-6 rounded-3xl border border-slate-700/50 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-blue-400">manage_accounts</span>
            Gestión de Usuarios
          </h2>
          <p className="text-slate-400 mt-1">Administración global de accesos y roles del sistema.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1e293b] rounded-3xl border border-slate-700/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="p-4 font-bold text-slate-300 text-sm uppercase tracking-wider">Usuario</th>
                <th className="p-4 font-bold text-slate-300 text-sm uppercase tracking-wider">Contacto</th>
                <th className="p-4 font-bold text-slate-300 text-sm uppercase tracking-wider">Fecha Registro</th>
                <th className="p-4 font-bold text-slate-300 text-sm uppercase tracking-wider">Rol de Acceso</th>
                <th className="p-4 font-bold text-slate-300 text-sm uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{u.full_name || 'Sin nombre'}</div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">{u.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-400">{u.phone || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                      ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        u.role === 'vet' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-slate-800 text-slate-300 border border-slate-700'}
                    `}>
                      {u.role === 'admin' && <span className="material-symbols-outlined text-[14px]">shield_person</span>}
                      {u.role === 'vet' && <span className="material-symbols-outlined text-[14px]">domain</span>}
                      {u.role === 'owner' && <span className="material-symbols-outlined text-[14px]">person</span>}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="owner">Dueño (Owner)</option>
                      <option value="vet">Veterinario/Clínica (Vet)</option>
                      <option value="admin">Super Admin (Admin)</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
