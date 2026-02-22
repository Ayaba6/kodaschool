import React, { useState, useEffect } from 'react';
import { 
  UserX, Search, Plus, Calendar, 
  CheckCircle2, Clock as ClockIcon, X, Filter 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Attendance({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (school?.id) fetchInitialData();
  }, [school?.id]);

  async function fetchInitialData() {
    const { data: cls } = await supabase.from('classes').select('*').eq('school_id', school.id);
    const { data: stu } = await supabase.from('profiles').select('id, first_name, last_name').eq('school_id', school.id).eq('role', 'student');
    setClasses(cls || []);
    setStudents(stu || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. STATS CARDS (Conforme à abs.PNG) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total absences", value: "0", color: "text-slate-900" },
          { label: "Total retards", value: "0", color: "text-amber-500" },
          { label: "Justifiées", value: "0", color: "text-emerald-500" },
          { label: "Non justifiées", value: "0", color: "text-red-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 2. ACTIONS BAR (Conforme à abs.PNG) */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none w-full text-sm font-bold"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none">
            <option>Toutes les classes</option>
            {classes.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5551FF] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4844ff] transition-all"
          >
            <Plus size={18} /> Enregistrer absence
          </button>
        </div>
      </div>

      {/* 3. TABLEAU / LOADING STATE (Conforme à abs.PNG) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm min-h-[350px] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold italic">Chargement des données...</p>
      </div>

      {/* 4. MODAL ENREGISTRER ABSENCE/RETARD (Conforme à abse.PNG) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Enregistrer une absence/retard</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={20}/></button>
            </div>
            
            <form className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Élève *</label>
                <select required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white font-medium">
                  <option value="">Sélectionner</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.last_name} {s.first_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Date *</label>
                  <input type="date" defaultValue="2026-02-22" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Type</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white font-medium">
                    <option>Absence</option>
                    <option>Retard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Période/Heure</label>
                <input placeholder="Ex: Matin, 08h-10h..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Motif</label>
                <input placeholder="Raison de l'absence..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input type="checkbox" id="justifie" className="w-5 h-5 rounded border-slate-300 text-[#5551FF] focus:ring-[#5551FF]" />
                <label htmlFor="justifie" className="text-sm font-bold text-slate-700">Justifiée</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-8 py-2.5 bg-[#5551FF] text-white rounded-xl font-bold hover:bg-[#4844ff] shadow-lg shadow-indigo-100 transition-all">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}