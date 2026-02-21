import React from 'react';
import { Save, Shield, Bell, Zap, Database, Globe } from 'lucide-react';

export default function ConfigSection() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-700">
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tighter italic text-slate-900">Configuration Système</h2>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Variables d'environnement et sécurité du réseau</p>
      </div>

      <div className="grid gap-6">
        {/* Paramètres de Base */}
        <div className="koda-card p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
            <Globe className="text-indigo-600" size={20} />
            <h3 className="text-lg font-black italic tracking-tighter">Paramètres Généraux</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nom du Réseau</label>
                <input type="text" className="koda-input w-full" defaultValue="KodaSchool Network" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Domaine Principal</label>
                <input type="text" className="koda-input w-full" defaultValue="kodaschool.com" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-black text-slate-900">Mode Maintenance</p>
                <p className="text-xs text-slate-500 font-medium">Désactiver l'accès aux sites pour les mises à jour</p>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité et API */}
        <div className="koda-card p-8 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
            <Shield className="text-amber-500" size={20} />
            <h3 className="text-lg font-black italic tracking-tighter">Sécurité & API</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium italic">Clé API Réseau (Lecture seule)</p>
            <div className="flex gap-2">
              <input type="password" readonly className="koda-input flex-1 font-mono text-xs" value="ks_live_51Mzc2JKE8sWzHnZ2..." />
              <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Copier</button>
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde global */}
        <div className="flex justify-end pt-4">
          <button className="btn-primary shadow-xl shadow-indigo-200 flex items-center gap-3 px-10">
            <Save size={18} /> ENREGISTRER TOUT
          </button>
        </div>
      </div>
    </div>
  );
}