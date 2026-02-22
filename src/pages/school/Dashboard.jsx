import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, TrendingUp, 
  AlertCircle, Calendar as CalendarIcon,
  Wallet, BookOpen, ArrowUpRight, Layers,
  FileText, UserPlus
} from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { supabase } from '../../lib/supabase';

export default function SchoolDashboard({ school, profile, onNavigate }) {
  const { stats, loading: loadingStudents } = useStudents(school?.id);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (school?.id) {
      fetchQuickStats();
    }
  }, [school?.id]);

  async function fetchQuickStats() {
    setLoadingStats(true);
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school.id)
      .eq('role', 'teacher');
    
    if (!error) setTeacherCount(count || 0);
    setLoadingStats(false);
  }

  const cards = [
    { label: "Total Élèves", value: loadingStudents ? "..." : stats.total, icon: Users, color: "text-[#5551FF]", bg: "bg-indigo-50", trend: "+12% ce mois" },
    { label: "Enseignants", value: loadingStats ? "..." : teacherCount, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", trend: "Corps professoral" },
    { label: "Recouvrement", value: "0 FCFA", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Total encaissé" },
    { label: "Absences Jour", value: "0", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", trend: "À justifier" },
  ];

  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">
            Dashboard <span className="text-[#5551FF]">{school?.name}</span>
          </h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">
            Session 2025-2026 • Bienvenue, {profile?.first_name}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-100">
          <CalendarIcon size={18} className="text-[#5551FF]" />
          <span className="text-sm font-black text-slate-700 italic">{today}</span>
        </div>
      </div>

      {/* COMPTEURS HAUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.bg} ${card.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{card.trend}</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">{card.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1 italic tracking-tight">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RACCOURCIS (3 COLONNES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => onNavigate('assignments')} 
          className="flex flex-col items-center justify-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:border-[#5551FF]/30 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-indigo-50 text-[#5551FF] rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Layers size={28} />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center leading-tight">Affecter<br/>les Professeurs</span>
        </button>

        <button 
          onClick={() => onNavigate('students')}
          className="flex flex-col items-center justify-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UserPlus size={28} />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center leading-tight">Inscrire<br/>un Élève</span>
        </button>

        <button 
          onClick={() => onNavigate('subjects')}
          className="flex flex-col items-center justify-center p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:border-blue-500/30 hover:shadow-md transition-all group"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen size={28} />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center leading-tight">Catalogue des<br/>Matières</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FLUX D'ACTIVITÉ */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black italic text-xl text-slate-900 flex items-center gap-2">
              Flux d'activité <span className="w-2 h-2 bg-[#5551FF] rounded-full animate-ping"></span>
            </h3>
            <button className="text-[#5551FF] text-xs font-black uppercase hover:tracking-widest transition-all">Voir tout</button>
          </div>
          <div className="space-y-4">
            {[
              { text: "Bulletin du 1er Trimestre prêt pour impression", time: "Il y a 5 min", color: "bg-blue-500" },
              { text: "Saisie des notes de Mathématiques terminée", time: "Il y a 45 min", color: "bg-[#5551FF]" },
              { text: "Nouveau paiement scolarité enregistré", time: "Il y a 2h", color: "bg-emerald-500" },
              { text: "Absence signalée : 4 élèves en 6ème A", time: "Ce matin", color: "bg-rose-500" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer">
                <div className={`w-1.5 h-8 rounded-full ${item.color}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{item.text}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">{item.time}</p>
                </div>
                <ArrowUpRight size={16} className="text-slate-200 group-hover:text-[#5551FF] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* CARTE NOIRE : ACTIONS & OBJECTIFS */}
        <div className="bg-[#0F172A] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#5551FF] opacity-10 rounded-full"></div>
          <h3 className="font-black italic text-xl mb-6 flex items-center gap-2 relative z-10">
            <TrendingUp className="text-indigo-400" /> Objectifs Scolaires
          </h3>
          <div className="space-y-8 relative z-10">
            <div>
              <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-slate-400">
                <span>Taux de Recouvrement</span>
                <span className="text-indigo-400 italic">0%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#5551FF] w-[2%] rounded-full shadow-[0_0_10px_#5551FF]"></div>
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm">
              <p className="text-[#5551FF] text-[10px] font-black uppercase mb-3 flex items-center gap-2"><BookOpen size={12} /> Note du jour</p>
              <p className="text-sm font-medium italic text-slate-300 leading-relaxed">
                "Finaliser les affectations pour le T2."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onNavigate('assignments')} className="py-4 bg-[#5551FF] hover:bg-[#4844ff] text-white rounded-2xl font-black italic transition-all flex flex-col items-center gap-1 text-[10px]">
                <Layers size={16} /> AFFECTATIONS
              </button>
              <button className="py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black italic transition-all flex flex-col items-center gap-1 text-[10px]">
                <FileText size={16} /> BULLETINS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}