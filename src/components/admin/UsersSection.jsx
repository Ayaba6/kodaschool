import React from 'react';
import { Mail, ShieldCheck, MapPin, Trash2, Search, Filter } from 'lucide-react';

export default function UsersSection({ profiles, loading }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic text-slate-900">
            Annuaire Réseau
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
            Gestion des accès et privilèges globaux
          </p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input type="text" placeholder="Rechercher un membre..." className="koda-input w-full pl-12 shadow-sm" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center koda-card border-dashed">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="koda-card overflow-hidden border-none shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilisateur</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rôle</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Établissement</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {profiles.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm group-hover:scale-110 transition-transform">
                        {user.first_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 tracking-tight">{user.first_name} {user.last_name}</div>
                        <div className="text-[10px] font-bold text-slate-400 italic lowercase">{user.email || 'id: ' + user.id.substring(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                      user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <ShieldCheck size={12} /> {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-600 font-black text-xs tracking-tight">
                      <MapPin size={14} className="text-indigo-500" />
                      {user.schools?.name || 'Koda Central'}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}