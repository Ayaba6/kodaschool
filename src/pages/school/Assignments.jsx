import React, { useState, useEffect } from 'react';
import { Layers, BookOpen, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Assignments({ school }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // État pour gérer les classes dépliées
  const [expandedClasses, setExpandedClasses] = useState({});

  useEffect(() => {
    if (school?.id) {
      fetchData();
    }
  }, [school?.id]);

  async function fetchData() {
    const { data: cls } = await supabase.from('classes').select('*').eq('school_id', school.id);
    setClasses(cls || []);

    const { data: sub } = await supabase.from('subjects').select('*').eq('school_id', school.id);
    setSubjects(sub || []);

    const { data: profs } = await supabase.from('profiles').select('*').eq('school_id', school.id).eq('role', 'teacher');
    setTeachers(profs || []);

    const { data: assign } = await supabase
      .from('course_assignments')
      .select(`*, subject:subjects(name), teacher:profiles(first_name, last_name), class:classes(name)`)
      .eq('school_id', school.id);
    setAssignments(assign || []);
  }

  // Fonction pour basculer l'affichage d'une classe
  const toggleClass = (classId) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
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
      fetchData();
      // Déplier automatiquement la classe après l'ajout
      setExpandedClasses(prev => ({ ...prev, [classId]: true }));
      e.target.reset();
    } else {
      alert("Erreur: " + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter">Affectations</h2>
        <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-[0.2em]">Lier Matières, Classes et Professeurs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULAIRE */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-indigo-500/5 sticky top-8">
            <h3 className="font-black italic text-lg mb-6 flex items-center gap-2">
              <Plus className="text-[#5551FF]" /> Nouvelle Liaison
            </h3>
            
            <form onSubmit={handleAssign} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Choisir la Classe</label>
                <select name="class_id" required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold">
                  <option value="">Sélectionner...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.level} - {c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Choisir la Matière</label>
                <select name="subject_id" required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold">
                  <option value="">Sélectionner...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Attribuer au Professeur</label>
                <select name="teacher_id" required className="w-full px-5 py-3 bg-slate-900 text-white border-none rounded-2xl outline-none font-bold italic appearance-none">
                  <option value="">Sélectionner...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name} {t.first_name}</option>)}
                </select>
              </div>

              <button disabled={isSaving} className="w-full py-4 bg-[#5551FF] text-white rounded-2xl font-black italic shadow-lg hover:bg-[#4844ff] transition-all">
                {isSaving ? "Liaison..." : "Valider l'affectation"}
              </button>
            </form>
          </div>
        </div>

        {/* LISTE ACCORDÉON */}
        <div className="lg:col-span-2 space-y-4">
          {classes.length === 0 ? (
             <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-100 italic text-slate-400 font-bold">
                Créez d'abord des classes.
             </div>
          ) : (
            classes.map(cls => {
              const isExpanded = expandedClasses[cls.id];
              const classAssignments = assignments.filter(a => a.class_id === cls.id);

              return (
                <div key={cls.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm transition-all duration-300">
                  {/* HEADER DE LA CLASSE (CLIQUABLE) */}
                  <div 
                    onClick={() => toggleClass(cls.id)}
                    className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#5551FF] text-white' : 'bg-indigo-50 text-[#5551FF]'}`}>
                        <Layers size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase leading-none">{cls.level} - {cls.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                          {classAssignments.length} Matières affectées
                        </p>
                      </div>
                    </div>
                    
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="text-slate-300" size={24} />
                    </div>
                  </div>

                  {/* CONTENU DÉROULANT */}
                  {isExpanded && (
                    <div className="p-6 pt-0 bg-white animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-50 pt-6">
                        {classAssignments.length === 0 ? (
                          <p className="col-span-2 text-center py-4 text-[10px] font-black uppercase text-slate-300 italic tracking-widest">Aucune matière pour le moment</p>
                        ) : (
                          classAssignments.map(as => (
                            <div key={as.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group border border-transparent hover:border-slate-100 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400">
                                  <BookOpen size={14} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900 uppercase">{as.subject?.name}</p>
                                  <p className="text-[10px] font-bold text-[#5551FF] italic">{as.teacher?.last_name} {as.teacher?.first_name}</p>
                                </div>
                              </div>
                              <button 
                                onClick={async (e) => { 
                                  e.stopPropagation(); 
                                  if(confirm("Supprimer l'affectation ?")) { 
                                    await supabase.from('course_assignments').delete().eq('id', as.id); 
                                    fetchData(); 
                                  } 
                                }}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                              >
                                <Trash2 size={14} />
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