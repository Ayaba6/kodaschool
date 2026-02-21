import React, { useState } from 'react';
import { 
  Plus, Search, Globe, ShieldCheck, 
  Settings2, ExternalLink, BarChart3, 
  MoreHorizontal, LayoutGrid, List
} from 'lucide-react';

export default function EtablissementsSection({ schools, loading, setIsModalOpen }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchools = schools?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* --- HEADER DE LA SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic text-slate-900">
            Parc Établissements
          </h1>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            {schools?.length || 0} Instances déployées sur le réseau
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary shadow-indigo-200 shadow-2xl"
          >
            <Plus size={20} strokeWidth={3} />
            NOUVEL ÉTABLISSEMENT
          </button>
        </div>
      </div>

      {/* --- BARRE DE RECHERCHE --- */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Rechercher un établissement par nom ou domaine..."
          className="koda-input w-full pl-12 shadow-sm italic font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- ETAT DE CHARGEMENT --- */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center koda-card border-dashed">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-black italic tracking-tighter">Lecture du réseau Koda...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* --- VUE GRILLE (CARDS) --- */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredSchools?.map((school) => (
                <div key={school.id} className="koda-card group overflow-hidden hover:border-indigo-300 transition-all duration-500">
                  {/* Accent de couleur du site */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: school.primary_color }}></div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                      <div 
                        className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white font-black text-3xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500"
                        style={{ backgroundColor: school.primary_color }}
                      >
                        {school.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2">
                          Propulsé
                        </span>
                        <div className="text-slate-300 hover:text-indigo-500 cursor-pointer transition-colors">
                          <Settings2 size={18} />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black tracking-tighter italic text-slate-900 mb-1">
                      {school.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs lowercase mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Globe size={14} />
                      {school.subdomain}.kodaschool.com
                    </div>

                    {/* Stats rapides du site */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                        <p className="text-xs font-black text-emerald-600 uppercase italic flex items-center justify-center gap-1">
                          <ShieldCheck size={12} /> Live
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Performance</p>
                        <p className="text-xs font-black text-slate-900 uppercase italic flex items-center justify-center gap-1">
                          <BarChart3 size={12} /> 98%
                        </p>
                      </div>
                    </div>

                    {/* Bouton d'accès direct */}
                    <button 
                      onClick={() => window.open(`http://${school.subdomain}.localhost:5173`, '_blank')}
                      className="w-full py-4 bg-slate-900 text-white rounded-[18px] text-[11px] font-black uppercase tracking-[0.15em] hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-slate-100"
                    >
                      Console Administration <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- VUE TABLEAU (LIST) --- */
            <div className="koda-card overflow-hidden border-none shadow-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Établissement</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Domaine</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de création</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSchools?.map((school) => (
                    <tr key={school.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: school.primary_color }}>
                            {school.name.charAt(0)}
                          </div>
                          <span className="font-black text-slate-900 tracking-tight italic">{school.name}</span>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-indigo-500 text-sm italic">{school.subdomain}.kodaschool.com</td>
                      <td className="p-6 text-slate-400 font-bold text-xs">{new Date(school.created_at).toLocaleDateString()}</td>
                      <td className="p-6 text-right">
                        <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}