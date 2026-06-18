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

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmDelete = confirm(`¿Estás seguro que deseas eliminar permanentemente al usuario "${userName || 'Sin nombre'}"?\nEsta acción no se puede deshacer.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      alert("Usuario eliminado correctamente.");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert("No se pudo eliminar el usuario. Si tiene mascotas, citas o clínicas asociadas, deberás eliminarlas primero para mantener la integridad de la base de datos.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-primary">manage_accounts</span>
            Gestión de Usuarios
          </h2>
          <p className="text-on-surface-variant mt-1">Administración global de accesos y roles del sistema.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/60">
                <th className="p-4 font-bold text-on-surface text-sm uppercase tracking-wider">Usuario</th>
                <th className="p-4 font-bold text-on-surface text-sm uppercase tracking-wider">Contacto</th>
                <th className="p-4 font-bold text-on-surface text-sm uppercase tracking-wider">Fecha Registro</th>
                <th className="p-4 font-bold text-on-surface text-sm uppercase tracking-wider">Rol de Acceso</th>
                <th className="p-4 font-bold text-on-surface text-sm uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{u.full_name || 'Sin nombre'}</div>
                    <div className="text-xs text-on-surface-variant mt-1 font-mono">{u.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-4">
                    <span className="text-on-surface-variant">{u.phone || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-on-surface-variant">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                      ${u.role === 'admin' ? 'bg-error-container text-on-error-container border border-error/20' : 
                        u.role === 'vet' ? 'bg-primary-container text-on-primary-container border border-primary/20' : 
                        'bg-surface-container-high text-on-surface border border-outline-variant'}
                    `}>
                      {u.role === 'admin' && <span className="material-symbols-outlined text-[14px]">shield_person</span>}
                      {u.role === 'vet' && <span className="material-symbols-outlined text-[14px]">local_hospital</span>}
                      {u.role === 'owner' && <span className="material-symbols-outlined text-[14px]">person</span>}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-surface-container border border-outline-variant text-on-surface text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="owner">Dueño (Owner)</option>
                        <option value="vet">Veterinario/Clínica (Vet)</option>
                        <option value="admin">Super Admin (Admin)</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        className="w-9 h-9 rounded-xl hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-all border border-transparent hover:border-error/20"
                        title="Eliminar Usuario"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
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
