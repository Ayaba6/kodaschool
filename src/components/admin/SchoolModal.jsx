import React, { useState } from 'react';
import { X, School, User, Globe, Mail, Lock } from 'lucide-react';

export default function SchoolModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    admin_email: '',
    admin_first_name: '',
    admin_last_name: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter text-slate-900">Déployer un établissement</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuration du nouvel environnement</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section École */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <School size={14} /> Détails Établissement
              </label>
              <input 
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold"
                placeholder="Nom de l'école"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <div className="relative">
                <input 
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold pr-32"
                  placeholder="sous-domaine"
                  onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">.kodaschool.com</span>
              </div>
            </div>

            {/* Section Admin */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                <User size={14} /> Administrateur Principal
              </label>
              <div className="flex gap-2">
                <input 
                  required
                  placeholder="Prénom"
                  className="w-1/2 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                  onChange={(e) => setFormData({...formData, admin_first_name: e.target.value})}
                />
                <input 
                  required
                  placeholder="Nom"
                  className="w-1/2 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                  onChange={(e) => setFormData({...formData, admin_last_name: e.target.value})}
                />
              </div>
              <input 
                required
                type="email"
                placeholder="Email professionnel"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#5551FF] text-white py-4 rounded-2xl font-black italic text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
          >
            Lancer le déploiement <Globe size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}