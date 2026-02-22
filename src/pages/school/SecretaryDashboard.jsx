import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Clock, Calendar, 
  AlertCircle, Search, ChevronRight, 
  FileText, CheckCircle2, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SecretaryDashboard({ school, profile, onNavigate }) {
  const [stats, setStats] = useState({
    todayAbsences: 0,
    pendingInscriptions: 0,
    totalStudents: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (school?.id) fetchSecretaryData();
  }, [school?.id]);

  async function fetchSecretaryData() {
    setLoading(true);
    
    // 1. Récupérer les 5 derniers élèves inscrits
    const { data: students } = await supabase
      .from('students')
      .select('*, classes(name)')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // 2. Simuler ou compter les absences du jour (via la table attendance)
    const today = new Date().toISOString().split('T')[0];
    const { count: absenceCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .eq('date', today)
      .eq('status', 'absent');

    setRecentStudents(students || []);
    setStats(prev => ({ ...prev, todayAbsences: absenceCount || 0, totalStudents: students?.length || 0 }));
    setLoading(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER : SALUTATIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase">
            Espace Secrétariat
          </h2>
          <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-[0.2em] mt-1">
            Gestion des flux • {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('attendance')}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black italic text-[10px] uppercase shadow-xl hover:scale-105 transition-all"
          >
            Pointer les absences
          </button>
        </div>
      </div>

      {/* STATS OPÉRATIONNELLES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Absences ce jour", value: stats.todayAbsences, icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Dossiers à compléter", value: "14", icon: FileText, color: "text-[#5551FF]", bg: "bg-indigo-50" },
          { label: "Total Éleves", value: stats.totalStudents, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-[#5551FF]/20 transition-all">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ACTIONS RAPIDES (PANNEAU GAUCHE) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-900">Actions Prioritaires</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('students')}
              className="group p-8 bg-white border border-slate-100 rounded-[40px] text-left hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 text-[#5551FF] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <UserPlus size={24} />
              </div>
              <h4 className="font-black text-lg uppercase leading-tight text-slate-900">Nouvelle<br/>Inscription</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Ajouter un élève au système</p>
            </button>

            <button 
              onClick={() => onNavigate('staff')}
              className="group p-8 bg-slate-900 border border-slate-900 rounded-[40px] text-left hover:shadow-2xl hover:shadow-slate-500/20 transition-all"
            >
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
                <Users size={24} />
              </div>
              <h4 className="font-black text-lg uppercase leading-tight text-white">Annuaire<br/>Personnel</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Contacter un professeur</p>
            </button>
          </div>

          {/* LISTE DES DERNIERS ÉLÈVES INSCRITS */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
            <h3 className="font-black italic text-sm uppercase text-slate-400 mb-6 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" /> Inscriptions Récentes
            </h3>
            <div className="space-y-4">
              {recentStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-[10px] text-[#5551FF]">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-900">{student.first_name} {student.last_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic">{student.classes?.name || 'Sans classe'}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR : RAPPELS & ALERTES (PANNEAU DROIT) */}
        <div className="space-y-6">
          <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-900 px-2">Notifications</h3>
          
          {/* Alerte Absences */}
          <div className="bg-[#5551FF] rounded-[32px] p-6 text-white space-y-4 shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Urgences</p>
                <p className="font-bold text-sm italic">Appels Parents</p>
              </div>
            </div>
            <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
              Il y a <strong>{stats.todayAbsences}</strong> absences non justifiées aujourd'hui. Les parents n'ont pas encore été notifiés.
            </p>
            <button 
              onClick={() => onNavigate('attendance')}
              className="w-full py-3 bg-white text-[#5551FF] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Gérer les appels
            </button>
          </div>

          {/* Calendrier simplifié / Évènements */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-[#5551FF]" /> Agenda Scolaire
            </h4>
            <div className="space-y-4">
               {[
                 { date: "Demain", event: "Conseil de classe 3ème", color: "border-emerald-500" },
                 { date: "24 Fév", event: "Réunion Parents-Profs", color: "border-amber-500" },
               ].map((item, i) => (
                 <div key={i} className={`pl-4 border-l-4 ${item.color} py-1`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{item.date}</p>
                    <p className="text-xs font-bold text-slate-800 italic">{item.event}</p>
                 </div>
               ))}
            </div>
          </div>

          {/* Aide Rapide */}
          <div className="p-6 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Besoin d'aide ?</p>
            <p className="text-[11px] font-medium text-slate-600 mt-1">Guide de saisie des inscriptions</p>
          </div>
        </div>

      </div>
    </div>
  );
}