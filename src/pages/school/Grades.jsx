import React, { useState, useEffect } from 'react';
import { Save, GraduationCap, Search, CheckCircle2, Menu, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Grades({ school }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Trimestre 1');
  const [grades, setGrades] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { if (school?.id) fetchInitialData(); }, [school?.id]);
  
  useEffect(() => { 
    fetchStudents();
    fetchGrades();
  }, [selectedClass, selectedSubject, selectedPeriod, school?.id]);

  async function fetchInitialData() {
    // Récupération des classes et matières liées à l'école
    const { data: cls } = await supabase.from('classes').select('*').eq('school_id', school.id);
    const { data: sub } = await supabase.from('subjects').select('*').eq('school_id', school.id);
    
    setClasses(cls || []);
    setSubjects(sub || []);
    
    if (cls?.length > 0) setSelectedClass(cls[0].id);
    if (sub?.length > 0) setSelectedSubject(sub[0].id);
  }

  async function fetchStudents() {
    setLoading(true);
    try {
      // On interroge la table 'students' (et non profiles)
      let query = supabase.from('students').select('*');
      
      // Si tu as une colonne class_id, on filtre. Sinon on prend tout l'école.
      if (selectedClass) {
        query = query.eq('class_id', selectedClass);
      } else {
        query = query.eq('school_id', school.id);
      }

      const { data, error } = await query.order('last_name');

      if (error) {
        console.error("Erreur Table Students:", error.message);
        setStudents([]);
      } else {
        setStudents(data || []);
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchGrades() {
    if (!selectedSubject) return;
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('subject_id', selectedSubject)
      .eq('period', selectedPeriod);

    if (error) {
      console.error("Erreur Table Grades:", error.message);
    } else {
      const map = {};
      data?.forEach(g => {
        map[g.student_id] = { value: g.value, comment: g.comment || '' };
      });
      setGrades(map);
    }
  }

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const saveGrades = async () => {
    setLoading(true);
    const updates = students.map(s => ({
      school_id: school.id,
      student_id: s.id,
      subject_id: selectedSubject,
      period: selectedPeriod,
      class_id: selectedClass || s.class_id,
      value: grades[s.id]?.value || null,
      comment: grades[s.id]?.comment || ''
    }));

    const { error } = await supabase.from('grades').upsert(updates, { onConflict: 'student_id, subject_id, period' });
    
    setLoading(false);
    if (error) alert("Erreur lors de la sauvegarde: " + error.message);
    else alert("Notes enregistrées avec succès !");
  };

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 bg-slate-50 pt-1 px-4 lg:px-6 pb-6 rounded-[30px] lg:rounded-[40px] overflow-hidden">
      
      {/* BOUTON MOBILE */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden flex items-center justify-between w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Menu size={18} className="text-[#5551FF]"/>
          <span className="font-black uppercase text-[10px] text-slate-900">
             {selectedStudent ? `${selectedStudent.last_name}` : "Liste des élèves"}
          </span>
        </div>
        <span className="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold">{students.length}</span>
      </button>

      {/* SIDEBAR */}
      <div className={`
        fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-0 w-full lg:w-80 bg-white lg:rounded-[32px] border-r lg:border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-lg"><GraduationCap size={18}/></div>
              <h3 className="font-black italic uppercase text-slate-900 text-sm tracking-tighter">Élèves</h3>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20}/></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" placeholder="Rechercher..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 ring-indigo-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2 italic font-bold text-[10px] uppercase">
              <Loader2 className="animate-spin text-[#5551FF]" size={20} />
              Chargement...
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <AlertCircle className="mx-auto opacity-20" size={32} />
              <p className="text-[10px] font-black uppercase italic leading-tight">Aucune donnée dans la table 'students'</p>
            </div>
          ) : (
            <>
              <button onClick={() => { setSelectedStudent(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${!selectedStudent ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${!selectedStudent ? 'bg-white/20' : 'bg-slate-100'}`}>ALL</div>
                <span className="font-black uppercase text-[10px] italic">Voir tous</span>
              </button>
              {filteredStudents.map(student => (
                <button key={student.id} onClick={() => { setSelectedStudent(student); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${selectedStudent?.id === student.id ? 'bg-[#5551FF] text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <span className="font-bold uppercase text-[10px] truncate text-left flex-1">{student.last_name} {student.first_name}</span>
                  {grades[student.id]?.value && <CheckCircle2 size={12} className="text-emerald-400" />}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* TABLEAU CENTRAL */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="bg-white p-3 lg:p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-slate-100 px-3 py-2 rounded-xl font-black uppercase text-[9px] outline-none border-none cursor-pointer">
              <option value="">Toutes les classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="bg-slate-100 px-3 py-2 rounded-xl font-black uppercase text-[9px] outline-none border-none cursor-pointer">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="bg-slate-900 text-white px-3 py-2 rounded-xl font-black uppercase text-[9px] outline-none border-none cursor-pointer">
              <option>Trimestre 1</option><option>Trimestre 2</option><option>Trimestre 3</option>
            </select>
          </div>
          <button onClick={saveGrades} disabled={loading || students.length === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#5551FF] text-white rounded-xl text-[9px] font-black uppercase italic shadow-lg hover:opacity-90 disabled:opacity-30 transition-all">
            <Save size={14} /> Enregistrer
          </button>
        </div>

        <div className="flex-1 bg-white rounded-[24px] lg:rounded-[32px] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Élève</th>
                  <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest w-24 lg:w-32">Note / 20</th>
                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.filter(s => !selectedStudent || s.id === selectedStudent.id).map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 text-slate-900 border border-slate-200 items-center justify-center font-black text-[9px]">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <span className="font-black text-slate-900 uppercase text-[10px]">{student.last_name} {student.first_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" min="0" max="20" step="0.25"
                        value={grades[student.id]?.value || ''}
                        onChange={(e) => handleGradeChange(student.id, 'value', e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#5551FF] focus:bg-white rounded-xl py-2 text-center font-black text-slate-900 outline-none transition-all text-xs"
                        placeholder="--"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        value={grades[student.id]?.comment || ''}
                        onChange={(e) => handleGradeChange(student.id, 'comment', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-100 focus:border-[#5551FF] py-1 text-[10px] font-bold text-slate-500 outline-none transition-all"
                        placeholder="Note..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}