import React, { useState, useEffect } from 'react';
import { 
  UserX, Search, Plus, Calendar, 
  CheckCircle2, Clock as ClockIcon, X, Filter, Loader2, Trash2, AlertCircle, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Attendance({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [modalClassId, setModalClassId] = useState('');

  useEffect(() => {
    if (school?.id) fetchInitialData();
  }, [school?.id]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const [cls, stu, att] = await Promise.all([
        supabase.from('classes').select('*').eq('school_id', school.id).order('level'),
        supabase.from('students').select('id, first_name, last_name, class_id').eq('school_id', school.id),
        // On récupère l'attendance avec la jointure sur la table 'students'
        supabase.from('attendance').select(`
          *,
          student:students (
            first_name,
            last_name
          )
        `).eq('school_id', school.id).order('date', { ascending: false })
      ]);

      setClasses(cls.data || []);
      setStudents(stu.data || []);
      setAttendanceData(att.data || []);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
    setLoading(false);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    
    const newEntry = {
      school_id: school.id,
      student_id: formData.get('student_id'),
      date: formData.get('date'),
      type: formData.get('type'),
      period: formData.get('period'),
      reason: formData.get('reason'),
      is_justified: formData.get('is_justified') === 'on'
    };

    const { error } = await supabase.from('attendance').insert([newEntry]);
    
    if (!error) {
      setIsModalOpen(false);
      setModalClassId('');
      fetchInitialData();
    } else {
      alert("Erreur: " + error.message);
    }
    setIsSaving(false);
  };

  const deleteEntry = async (id) => {
    if(!confirm("Supprimer cet enregistrement ?")) return;
    await supabase.from('attendance').delete().eq('id', id);
    fetchInitialData();
  };

  // Filtrage pour le Modal
  const filteredStudentsForModal = students.filter(s => 
    modalClassId ? s.class_id === modalClassId : true
  );

  // Filtrage pour le Tableau (Recherche par nom)
  const filteredTableData = attendanceData.filter(a => {
    const fullName = `${a.student?.first_name} ${a.student?.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Stats
  const stats = {
    absences: attendanceData.filter(a => a.type === 'Absence').length,
    retards: attendanceData.filter(a => a.type === 'Retard').length,
    justified: attendanceData.filter(a => a.is_justified).length,
    unjustified: attendanceData.filter(a => !a.is_justified && a.type === 'Absence').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Absences", value: stats.absences, color: "text-slate-900", icon: UserX, bg: "bg-slate-50" },
          { label: "Retards", value: stats.retards, color: "text-amber-600", icon: ClockIcon, bg: "bg-amber-50" },
          { label: "Justifiées", value: stats.justified, color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-50" },
          { label: "Non justifiées", value: stats.unjustified, color: "text-rose-600", icon: AlertCircle, bg: "bg-rose-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 group">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 px-5 py-3 bg-slate-50 rounded-2xl">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-[11px] font-black uppercase tracking-tight"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-8 py-3.5 bg-[#5551FF] text-white rounded-2xl text-[10px] font-black uppercase italic shadow-xl shadow-indigo-100 hover:bg-[#4844ff] transition-all"
        >
          <Plus size={18} /> Enregistrer
        </button>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-[#5551FF]" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Chargement...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Date / Période</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Élève</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">Justification</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTableData.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-black text-slate-900">{new Date(a.date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-[9px] font-bold text-[#5551FF] uppercase italic">{a.period || 'Heure non précisée'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-black uppercase text-slate-700">
                      {a.student?.last_name} {a.student?.first_name}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${a.type === 'Absence' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {a.is_justified ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase"><CheckCircle2 size={12}/> Justifié</div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-300 font-black text-[9px] uppercase"><ClockIcon size={12}/> En attente</div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => deleteEntry(a.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black uppercase italic text-slate-900 tracking-tight">Signaler Absence / Retard</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#5551FF] ml-1">1. Choisir la Classe</label>
                <select 
                  value={modalClassId}
                  onChange={(e) => setModalClassId(e.target.value)}
                  className="w-full px-5 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none font-black text-xs uppercase cursor-pointer"
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.level} - {c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">2. Sélectionner l'Élève *</label>
                <select name="student_id" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs uppercase">
                  <option value="">{modalClassId ? "Choisir l'élève..." : "Veuillez filtrer par classe"}</option>
                  {filteredStudentsForModal.map(s => (
                    <option key={s.id} value={s.id}>{s.last_name} {s.first_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                  <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                  <select name="type" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs uppercase">
                    <option value="Absence">Absence</option>
                    <option value="Retard">Retard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Heure ou Période</label>
                <input name="period" placeholder="Ex: 08h-10h..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xs" />
              </div>

              <div className="flex items-center gap-3 p-5 bg-indigo-50/30 rounded-[24px] border border-indigo-100">
                <input type="checkbox" name="is_justified" id="justifie" className="w-6 h-6 rounded-lg border-slate-300 text-[#5551FF] focus:ring-[#5551FF]" />
                <label htmlFor="justifie" className="text-[10px] font-black uppercase text-indigo-900 cursor-pointer">Document justificatif fourni</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setModalClassId(''); }} className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Annuler</button>
                <button 
                  disabled={isSaving || filteredStudentsForModal.length === 0}
                  type="submit" 
                  className="px-12 py-4 bg-[#5551FF] text-white rounded-[20px] font-black uppercase italic text-[10px] shadow-xl hover:bg-[#4844ff] transition-all"
                >
                  {isSaving ? "Envoi..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}