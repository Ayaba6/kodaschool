import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Calendar, Clock, 
  ChevronRight, Star, AlertCircle, Loader2,
  TrendingUp, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TeacherDashboard({ user, school }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ classes: 0, students: 0, subjects: 0 });
  const [myClasses, setMyClasses] = useState([]);
  const [upcomingLessons, setUpcomingLessons] = useState([]);

  useEffect(() => {
    if (user?.id) fetchTeacherData();
  }, [user?.id]);

  async function fetchTeacherData() {
    setLoading(true);
    
    // 1. Récupérer les affectations du prof (Matières + Classes)
    const { data: assignments } = await supabase
      .from('course_assignments')
      .select(`
        id,
        class:classes(id, name, level),
        subject:subjects(name)
      `)
      .eq('teacher_id', user.id);

    // 2. Extraire les classes uniques et compter les élèves
    const uniqueClasses = [...new Map(assignments?.map(item => [item.class.id, item.class])).values()];
    
    setStats({
      classes: uniqueClasses.length,
      subjects: new Set(assignments?.map(a => a.subject.name)).size,
      students: 0 // Nécessite une requête supplémentaire si on veut le total exact
    });

    setMyClasses(uniqueClasses);
    setLoading(false);
  }

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#5551FF]" size={40} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initialisation de votre espace...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DE BIENVENUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase">
            Hello, Prof. {user?.last_name}
          </h2>
          <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-[0.2em] mt-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black italic text-[10px] uppercase shadow-xl hover:scale-105 transition-all">
            Faire l'appel
          </button>
        </div>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Mes Classes", value: stats.classes, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Mes Matières", value: stats.subjects, icon: BookOpen, color: "text-[#5551FF]", bg: "bg-indigo-50" },
          { label: "Prochain Cours", value: "14:00", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center group-hover:rotate-12 transition-all duration-500`}>
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
        
        {/* LISTE DES CLASSES ACTIVES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-900">Mes Classes</h3>
            <button className="text-[10px] font-black text-[#5551FF] uppercase border-b-2 border-[#5551FF]">Voir tout</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myClasses.map((cls) => (
              <div key={cls.id} className="bg-white p-6 rounded-[32px] border border-slate-100 hover:border-[#5551FF]/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#5551FF] group-hover:text-white transition-colors">
                    <Users size={20} />
                  </div>
                  <span className="text-[9px] font-black bg-indigo-50 text-[#5551FF] px-3 py-1 rounded-full uppercase italic">Actif</span>
                </div>
                <h4 className="font-black text-xl text-slate-900 uppercase leading-none">{cls.level}</h4>
                <p className="text-lg font-black text-[#5551FF] italic mb-4">{cls.name}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saisir Notes</span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR : RAPPELS / ALERTES */}
        <div className="space-y-6">
          <h3 className="font-black italic text-lg uppercase tracking-tight text-slate-900 px-2">Notifications</h3>
          
          <div className="bg-slate-900 rounded-[32px] p-6 text-white space-y-4 shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-amber-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">À faire</p>
                <p className="font-bold text-sm italic">Notes non saisies</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Il vous reste 3 évaluations à saisir pour la classe de 6ème A (Mathématiques).
            </p>
            <button className="w-full py-3 bg-[#5551FF] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#4844ff] transition-all">
              Saisir maintenant
            </button>
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Performance Moyenne
            </h4>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span>6ème A</span>
                    <span className="text-[#5551FF]">14.5/20</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5551FF] w-[72%] rounded-full"></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                    <span>3ème B</span>
                    <span className="text-rose-500">09.2/20</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[46%] rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}