import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Download, Upload, MoreHorizontal, 
  Users, X, Edit2, Trash2, FileSpreadsheet 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

export default function Students({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (school?.id) {
      fetchStudents();
      fetchClasses();
    }
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [school?.id]);

  async function fetchClasses() {
    const { data } = await supabase.from('classes').select('id, name, level').eq('school_id', school.id);
    setClasses(data || []);
  }

  async function fetchStudents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(`*, class:classes(name, level)`)
      .eq('school_id', school.id)
      .order('last_name', { ascending: true });
    if (!error) setStudentsList(data || []);
    setLoading(false);
  }

  // --- LOGIQUE EXPORT EXCEL ---
  const handleExport = () => {
    const dataToExport = filteredStudents.map(s => ({
      Matricule: s.matricule,
      Nom: s.last_name.toUpperCase(),
      Prenom: s.first_name,
      Sexe: s.gender,
      Niveau: s.class?.level || 'N/A',
      Classe: s.class?.name || 'N/A',
      Parent: s.parent_name || '',
      Telephone: s.parent_phone || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Liste_Eleves");
    XLSX.writeFile(workbook, `Eleves_${school.name.replace(/\s/g, '_')}.xlsx`);
  };

  // --- LOGIQUE IMPORT EXCEL ---
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

      const formattedStudents = data.map(item => {
        // On essaie de trouver l'ID de la classe correspondante par le nom
        const targetClass = classes.find(c => c.name === item.Classe || c.level === item.Niveau);
        return {
          school_id: school.id,
          matricule: item.Matricule || `MAT-${Math.floor(10000 + Math.random() * 90000)}`,
          first_name: item.Prenom || item.first_name,
          last_name: item.Nom || item.last_name,
          gender: item.Sexe || item.gender,
          class_id: targetClass?.id || null,
          status: 'active'
        };
      });

      const { error } = await supabase.from('students').insert(formattedStudents);
      if (error) alert("Erreur d'import : " + error.message);
      else fetchStudents();
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const newStudent = {
      school_id: school.id,
      matricule: formData.get('matricule') || `MAT-${Math.floor(10000 + Math.random() * 90000)}`,
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      gender: formData.get('gender'),
      birth_date: formData.get('birth_date'),
      class_id: formData.get('class_id'),
      status: formData.get('status') || 'active',
      parent_name: formData.get('parent_name'),
      parent_phone: formData.get('parent_phone'),
    };

    const { error } = await supabase.from('students').insert([newStudent]);
    if (!error) { setIsModalOpen(false); fetchStudents(); }
    setIsSaving(false);
  };

  const filteredStudents = studentsList.filter(s => 
    `${s.first_name} ${s.last_name} ${s.matricule}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. BARRE D'OUTILS AMÉLIORÉE */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou matricule..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5551FF]/10 outline-none text-sm font-medium transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* IMPORT CACHÉ */}
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx, .xls, .csv" />
          
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Upload size={18} /> Import
          </button>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download size={18} /> Export
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5551FF] text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-[#4844ff] transition-all active:scale-95"
          >
            <Plus size={18} /> Nouvel élève
          </button>
        </div>
      </div>

      {/* 2. STATS (Simplifiées) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", val: studentsList.length, color: "text-slate-900" },
          { label: "Garçons", val: studentsList.filter(s=>s.gender==='M').length, color: "text-[#5551FF]" },
          { label: "Filles", val: studentsList.filter(s=>s.gender==='F').length, color: "text-pink-500" },
          { label: "Actifs", val: studentsList.filter(s=>s.status==='active').length, color: "text-emerald-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{loading ? "..." : stat.val}</p>
          </div>
        ))}
      </div>

      {/* 3. TABLEAU */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Élève</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Matricule</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Classe / Bâtiment</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-4 flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs ${student.gender === 'M' ? 'bg-indigo-50 text-[#5551FF]' : 'bg-pink-50 text-pink-500'}`}>
                        {student.last_name[0]}{student.first_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 uppercase text-sm">{student.last_name} <span className="capitalize font-medium text-slate-600">{student.first_name}</span></p>
                        <p className="text-[10px] text-slate-400 font-bold italic">Né(e) le {new Date(student.birth_date).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4"><span className="font-mono text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{student.matricule}</span></td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">{student.class?.level || 'Non assigné'}</span>
                        <span className="text-[10px] font-bold text-[#5551FF] uppercase tracking-widest">{student.class?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === student.id ? null : student.id); }} className="p-2 text-slate-300 hover:text-slate-600"><MoreHorizontal size={20}/></button>
                      {activeMenu === student.id && (
                        <div className="absolute right-8 mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 py-2">
                          <button onClick={async () => {
                            if(confirm("Supprimer ?")) {
                                await supabase.from('students').delete().eq('id', student.id);
                                fetchStudents();
                            }
                          }} className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL INSCRIPTION (Minimaliste) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black italic tracking-tighter">Inscrire un élève</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-xl text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input name="first_name" placeholder="Prénom" required className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none font-bold" />
                <input name="last_name" placeholder="Nom" required className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="gender" required className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none font-bold">
                  <option value="">Sexe...</option><option value="M">Masculin</option><option value="F">Féminin</option>
                </select>
                <input name="birth_date" type="date" required className="w-full px-5 py-3 bg-slate-50 rounded-2xl outline-none font-bold" />
              </div>
              <select name="class_id" required className="w-full px-5 py-4 bg-slate-900 text-white rounded-2xl outline-none font-black italic">
                <option value="">Sélectionner Niveau & Bâtiment...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.level} — {c.name}</option>)}
              </select>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 font-black text-slate-400">Annuler</button>
                <button disabled={isSaving} className="px-10 py-4 bg-[#5551FF] text-white rounded-2xl font-black italic shadow-lg">
                  {isSaving ? "En cours..." : "Confirmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}