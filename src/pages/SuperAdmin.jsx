import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  School, Users, Activity, PlusCircle, 
  ShieldCheck, Globe, Search, Filter, Download, Upload 
} from 'lucide-react';

import EtablissementsSection from '../components/admin/Etablissements';
import UsersSection from '../components/admin/UsersSection';
import ConfigSection from '../components/admin/ConfigSection';
import SchoolModal from '../components/admin/SchoolModal';

export default function SuperAdmin({ activeTab }) {
  const [schools, setSchools] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    setLoading(true);
    try {
      const [schoolsRes, profilesRes] = await Promise.all([
        supabase.from('schools').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*, schools(name)')
      ]);
      setSchools(schoolsRes.data || []);
      setProfiles(profilesRes.data || []);
    } finally {
      setLoading(false);
    }
  }

  // Configuration des stats basée sur ton image
  const stats = [
    { label: 'Total écoles', value: schools.length, color: 'text-slate-900' },
    { label: 'Utilisateurs', value: profiles.length, color: 'text-indigo-600' },
    { label: 'Système', value: 'OK', color: 'text-emerald-500' },
    { label: 'Actifs', value: schools.filter(s => s.is_active).length || 0, color: 'text-indigo-600' },
  ];

  if (loading && schools.length === 0) return <div className="p-10 text-slate-400 animate-pulse">Chargement...</div>;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* 1. BARRE D'ACTIONS (Inspirée de ton image) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un établissement..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Exporter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5551FF] text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            <PlusCircle size={16} /> Nouvelle école
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD / VUE D'ENSEMBLE */}
      {(activeTab === 'admin-dash' || !activeTab) && (
        <div className="space-y-8">
          {/* Grille de Stats (Identique à ton image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-slate-500 text-sm font-medium mb-2">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Liste d'activité récente */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Établissements récents</h3>
              <Globe size={18} className="text-slate-400" />
            </div>
            <div className="p-0">
              {schools.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.subdomain}.kodaschool.com</p>
                    </div>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTIONS DÉDIÉES */}
      {activeTab === 'schools' && (
        <EtablissementsSection schools={schools} loading={loading} setIsModalOpen={setIsModalOpen} />
      )}
      {activeTab === 'users' && <UsersSection profiles={profiles} loading={loading} />}
      {activeTab === 'config' && <ConfigSection />}

      <SchoolModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={async (data) => {
          await supabase.from('schools').insert([data]);
          setIsModalOpen(false);
          fetchAllData();
        }} 
      />
    </div>
  );
}