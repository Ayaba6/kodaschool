import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Trash2, Hash } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Subjects({ school }) {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (school?.id) {
      fetchSubjects();
    }
  }, [school?.id]);

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', school.id)
      .order('name', { ascending: true });
    
    if (!error) setSubjects(data || []);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);

    const newSubject = {
      school_id: school.id,
      name: formData.get('name'),
      code: formData.get('code')?.toUpperCase(), // On ajoute le code ici
      coefficient: parseFloat(formData.get('coefficient')) || 1,
    };

    const { error } = await supabase.from('subjects').insert([newSubject]);
    
    if (!error) {
      setIsModalOpen(false);
      fetchSubjects();
    } else {
      alert("Erreur: " + error.message);
    }
    setIsSaving(false);
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter">Matières</h2>
          <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-[0.2em]">Référentiel des cours</p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none w-64 shadow-sm focus:ring-2 focus:ring-indigo-50"
          />
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5551FF] text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={18}/> Nouveau
          </button>
        </div>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredSubjects.map(s => (
          <div key={s.id} className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-indigo-50 text-[#5551FF] rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={24}/>
            </div>
            
            <h3 className="font-black text-slate-900 uppercase text-sm leading-tight mb-1 truncate" title={s.name}>{s.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{s.code || '---'}</span>
              <span className="text-[10px] font-black text-[#5551FF]">COEF: {s.coefficient}</span>
            </div>

            <button 
              onClick={async () => { if(confirm("Supprimer ?")) { await supabase.from('subjects').delete().eq('id', s.id); fetchSubjects(); } }}
              className="absolute top-4 right-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL AVEC CODE ET NOM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black italic">Ajouter une matière</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Nom de la matière</label>
                <input name="name" required placeholder="ex: Mathématiques" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Code (Abrev.)</label>
                  <input name="code" placeholder="ex: MATH" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Coefficient</label>
                  <input name="coefficient" type="number" step="0.5" defaultValue="1" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>

              <button disabled={isSaving} className="w-full py-4 bg-[#5551FF] text-white rounded-2xl font-black italic shadow-xl shadow-indigo-100 hover:bg-[#4844ff] transition-all disabled:opacity-50 mt-4">
                {isSaving ? "Enregistrement..." : "Confirmer l'ajout"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}