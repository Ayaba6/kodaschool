import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, Plus, Trash2, ChevronDown, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Assignments({ school }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedClasses, setExpandedClasses] = useState({});

  useEffect(() => {
    if (school?.id) fetchData();
  }, [school?.id]);

  async function fetchData() {
    setLoading(true);
    // Récupération simultanée pour plus de rapidité
    const [clsRes, subRes, profRes, assignRes] = await Promise.all([
      supabase.from('classes').select('*').eq('school_id', school.id).order('level'),
      supabase.from('subjects').select('*').eq('school_id', school.id).order('name'),
      supabase.from('profiles').select('*').eq('school_id', school.id).eq('role', 'teacher').order('last_name'),
      supabase.from('course_assignments').select(`
        *, 
        subject:subjects(name), 
        teacher:profiles(first_name, last_name), 
        class:classes(name)
      `).eq('school_id', school.id)
    ]);

    setClasses(clsRes.data || []);
    setSubjects(subRes.data || []);
    setTeachers(profRes.data || []);
    setAssignments(assignRes.data || []);
    setLoading(false);
  }

  const toggleClass = (classId) => {
    setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const classId = formData.get('class_id');

    const newAssignment = {
      school_id: school.id,
      class_id: classId,
      subject_id: formData.get('subject_id'),
      teacher_id: formData.get('teacher_id'),
    };

    const { error } = await supabase.from('course_assignments').insert([newAssignment]);
    
    if (!error) {
      await fetchData();
      setExpandedClasses(prev => ({ ...prev, [classId]: true }));
      e.target.reset();
    } else {
      alert(error.code === '23505' ? "Cette matière est déjà assignée à cette classe !" : "Erreur: " + error.message);
    }
    setIsSaving(false);
  };

  const deleteAssignment = async (id) => {
    if (!confirm("Supprimer cette affectation ?")) return;
    const { error } = await supabase.from('course_assignments').delete().eq('id', id);
    if (!error) fetchData();
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-[#5551FF]" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Synchronisation des données...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black italic text-slate-900 tracking-tighter uppercase">Affectations</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-1 w-12 bg-[#5551FF] rounded-full"></span>
            <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-[0.2em]">Gestion du corps professoral</p>
          </div>
        </div>
        <div className="hidden md:block bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
           <p className="text-[9px] font-black text-slate-400 uppercase">Total Affectations</p>
           <p className="text-xl font-black text-slate-900">{assignments.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* FORMULAIRE D'AFFECTATION */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-[#5551FF] rounded-xl"><UserCheck size={20}/></div>
              <h3 className="font-black italic text-lg uppercase tracking-tight">Nouvelle Liaison</h3>
            </div>
            
            <form onSubmit={handleAssign} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Choisir la Classe</label>
                <select name="class_id" required className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-xs transition-all">
                  <option value="">Sélectionner une classe...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.level} - {c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Choisir la Matière</label>
                <select name="subject_id" required className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold text-xs transition-all">
                  <option value="">Quelle matière ?</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Attribuer au Professeur</label>
                <select name="teacher_id" required className="w-full px-5 py-4 bg-slate-900 text-white rounded-2xl outline-none font-black italic text-xs appearance-none cursor-pointer">
                  <option value="">Choisir l'enseignant...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name.toUpperCase()} {t.first_name}</option>)}
                </select>
              </div>

              <button 
                disabled={isSaving} 
                className="w-full py-4 bg-[#5551FF] text-white rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-indigo-200 hover:bg-[#4844ff] hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {isSaving ? "Enregistrement..." : "Confirmer l'affectation"}
              </button>
            </form>
          </div>
        </div>

        {/* LISTE DES CLASSES ET LEURS MATIÈRES */}
        <div className="lg:col-span-2 space-y-4">
          {classes.length === 0 ? (
             <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
               <AlertCircle size={40} className="text-slate-200" />
               <p className="italic text-slate-400 font-bold uppercase text-[10px]">Aucune classe configurée pour le moment</p>
             </div>
          ) : (
            classes.map(cls => {
              const isExpanded = expandedClasses[cls.id];
              const classAssignments = assignments.filter(a => a.class_id === cls.id);

              return (
                <div key={cls.id} className={`group bg-white rounded-[32px] border transition-all duration-300 ${isExpanded ? 'border-[#5551FF] shadow-2xl shadow-indigo-500/10' : 'border-slate-100 shadow-sm'}`}>
                  {/* HEADER */}
                  <div 
                    onClick={() => toggleClass(cls.id)}
                    className="flex items-center justify-between p-6 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-[#5551FF] text-white rotate-12' : 'bg-slate-50 text-slate-400'}`}>
                        <Layers size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{cls.level} <span className="text-[#5551FF] italic">{cls.name}</span></h4>
                        <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">
                          {classAssignments.length} Matières actives
                        </p>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-indigo-50 text-[#5551FF]' : 'text-slate-300'}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>

                  {/* CONTENU (GRILLE DES MATIÈRES) */}
                  {isExpanded && (
                    <div className="p-6 pt-0 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-50 pt-6">
                        {classAssignments.length === 0 ? (
                          <div className="col-span-2 py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-[9px] font-black uppercase text-slate-400 italic">Aucune affectation pour cette classe</p>
                          </div>
                        ) : (
                          classAssignments.map(as => (
                            <div key={as.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[20px] border border-transparent hover:border-indigo-100 hover:bg-white transition-all group/item">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#5551FF]">
                                  <BookOpen size={16} />
                                </div>
                                <div>
                                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{as.subject?.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 italic">M. {as.teacher?.last_name}</p>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteAssignment(as.id); }}
                                className="p-2 opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}