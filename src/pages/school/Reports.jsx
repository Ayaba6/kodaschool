import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Printer, 
  Download, ChevronRight, User,
  Filter, BookOpen, GraduationCap, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Reports({ school }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Trimestre 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportData, setReportData] = useState([]); // Notes du bulletin
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (school?.id) fetchClasses();
  }, [school?.id]);

  useEffect(() => {
    if (selectedClass) fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (selectedStudent) fetchStudentGrades();
  }, [selectedStudent, selectedTerm]);

  async function fetchClasses() {
    const { data } = await supabase.from('classes').select('*').eq('school_id', school.id);
    setClasses(data || []);
    if (data?.length > 0) setSelectedClass(data[0].id);
  }

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClass)
      .order('last_name');
    setStudents(data || []);
    setLoading(false);
  }

  async function fetchStudentGrades() {
    // On récupère les notes de l'élève + les noms des matières (via inner join si possible ou simple select)
    const { data, error } = await supabase
      .from('grades')
      .select(`
        value,
        comment,
        subject_id,
        subjects (name)
      `)
      .eq('student_id', selectedStudent.id)
      .eq('period', selectedTerm);

    if (!error) setReportData(data || []);
  }

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcul de la moyenne générale du bulletin
  const average = reportData.length > 0 
    ? (reportData.reduce((acc, curr) => acc + (curr.value || 0), 0) / reportData.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. BARRE DE FILTRES */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classe</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 appearance-none focus:ring-2 ring-indigo-500/10"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trimestre</label>
            <select 
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 text-white rounded-2xl outline-none font-bold italic"
            >
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Nom de l'élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ZONE PRINCIPALE (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LISTE DES ÉLÈVES (Gauche) */}
        <div className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black italic text-slate-900">Élèves</h3>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-500">{filteredStudents.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {loading ? (
              <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div></div>
            ) : filteredStudents.map(student => (
              <button 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedStudent?.id === student.id ? 'bg-[#5551FF] text-white shadow-lg translate-x-1' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {student.first_name[0]}{student.last_name[0]}
                </div>
                <div className="text-left flex-1">
                  <p className="font-black uppercase text-[11px] leading-none mb-1">{student.last_name}</p>
                  <p className={`text-[10px] font-bold ${selectedStudent?.id === student.id ? 'text-white/70' : 'text-slate-400'}`}>{student.first_name}</p>
                </div>
                <ChevronRight size={16} className={selectedStudent?.id === student.id ? 'text-white' : 'text-slate-300'} />
              </button>
            ))}
          </div>
        </div>

        {/* APERÇU DU BULLETIN (Droite) */}
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <FileText className="text-[#5551FF]" size={24} />
              <h3 className="text-lg font-black italic text-slate-900 uppercase tracking-tighter">Bulletin scolaire</h3>
            </div>
            {selectedStudent && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-md">
                  <Printer size={16}/> Imprimer
                </button>
                <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-[#5551FF] transition-all">
                  <Download size={18}/>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-8">
            {!selectedStudent ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 rounded-[40%] flex items-center justify-center animate-bounce">
                  <User size={40} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold italic uppercase text-[10px] tracking-widest">Aucun élève sélectionné</p>
              </div>
            ) : (
              <div className="w-full space-y-8 animate-in slide-in-from-bottom-4">
                {/* Header Bulletin */}
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase text-slate-900 leading-tight">{selectedStudent.last_name} {selectedStudent.first_name}</h2>
                    <p className="text-[#5551FF] font-black italic tracking-widest uppercase text-xs">{selectedTerm} — {school.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moyenne Générale</p>
                    <p className="text-4xl font-black italic text-[#5551FF] leading-none">{average}<span className="text-lg text-slate-300">/20</span></p>
                  </div>
                </div>

                {/* Tableau des notes */}
                <div className="rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-6 py-4 text-[10px] font-black uppercase italic tracking-widest">Matières</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase italic tracking-widest text-center">Moyenne</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase italic tracking-widest">Appréciation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.length > 0 ? reportData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-black text-slate-900 uppercase text-xs">
                            {row.subjects?.name || "Matière Inconnue"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg font-black text-sm ${row.value >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {row.value}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-bold italic text-xs">
                            {row.comment || "Pas d'appréciation"}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic font-bold">
                            Aucune note enregistrée pour ce trimestre
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer Bulletin / Visa */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 italic">Décision du conseil</p>
                    <p className="text-sm font-black text-slate-900 uppercase">
                      {average >= 10 ? "Admis — Félicitations" : "Doit redoubler d'efforts"}
                    </p>
                  </div>
                  <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase text-slate-300 italic">Signature de la direction</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}