import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MoreHorizontal, Users, 
  BookOpen, X, ChevronRight, Trash2, Edit2, Building2, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const LEVELS = [
  "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"
];

export default function Classes({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  // États pour le filtrage
  const [selectedLevel, setSelectedLevel] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (school?.id) fetchClasses();
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [school?.id]);

  async function fetchClasses() {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', school.id)
      .order('name', { ascending: true });
    
    if (error) console.error("Erreur classes:", error.message);
    setClassesList(data || []);
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce bâtiment/classe ?")) return;
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (!error) fetchClasses();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    
    const newClass = {
      school_id: school.id,
      name: formData.get('name'),
      level: formData.get('level'),
      capacity: parseInt(formData.get('capacity')) || 0,
      metadata: { section: formData.get('section') },
      status: 'active'
    };

    const { error } = await supabase.from('classes').insert([newClass]);
    if (!error) {
      setIsModalOpen(false);
      fetchClasses();
    }
    setIsSaving(false);
  };

  // Logique de filtrage combinée (Recherche + Niveau)
  const filteredClasses = classesList.filter(cls => {
    const matchesLevel = selectedLevel === "Tous" || cls.level === selectedLevel;
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER & RECHERCHE */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un bâtiment..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5551FF]/10 outline-none text-sm font-medium transition-all"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#5551FF] text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-[#4844ff] transition-all"
        >
          <Plus size={18} /> Nouveau bâtiment
        </button>
      </div>

      {/* BARRE DE FILTRES PAR NIVEAU */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-slate-500 mr-2">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase">Niveaux:</span>
        </div>
        <button 
          onClick={() => setSelectedLevel("Tous")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedLevel === "Tous" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          Tous
        </button>
        {LEVELS.map(level => (
          <button 
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedLevel === level ? 'bg-[#5551FF] text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-bold italic">Aucun bâtiment trouvé pour ce filtre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-indigo-50 text-[#5551FF] rounded-2xl group-hover:bg-[#5551FF] group-hover:text-white transition-all shadow-sm">
                  <Building2 size={24} />
                </div>
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === cls.id ? null : cls.id); }}
                        className="p-2 text-slate-300 hover:text-slate-600"
                    >
                        <MoreHorizontal size={20}/>
                    </button>
                    {activeMenu === cls.id && (
                        <div className="absolute right-0 top-10 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 py-2">
                            <button onClick={() => handleDelete(cls.id)} className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 size={14} /> Supprimer
                            </button>
                        </div>
                    )}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">{cls.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-indigo-50 text-[#5551FF] text-[10px] font-black uppercase rounded-md tracking-widest">
                    {cls.level}
                </span>
                {cls.metadata?.section && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-widest">
                        Section {cls.metadata.section}
                    </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium py-4 border-t border-slate-50">
                <Users size={16} className="text-slate-400" />
                <span>Capacité : <b className="text-slate-900">{cls.capacity}</b> places</span>
              </div>

              <button className="w-full mt-2 py-3 bg-slate-50 text-slate-500 group-hover:bg-[#5551FF] group-hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                Voir les effectifs <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL (Inchangée) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900">Enregistrer un bâtiment</h3>
                <p className="text-xs text-[#5551FF] font-bold uppercase tracking-widest">Infrastructures</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-xl text-slate-400 shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom du Bâtiment / Salle *</label>
                <input name="name" required placeholder="Ex: Bâtiment A..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#5551FF]/20 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niveau assigné *</label>
                  <select name="level" required className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold">
                    <option value="">Choisir...</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                  <input name="section" placeholder="Ex: A, B..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacité</label>
                <input name="capacity" type="number" defaultValue="45" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-slate-400">Annuler</button>
                <button disabled={isSaving} className="px-10 py-3 bg-[#5551FF] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#4844ff] transition-all disabled:opacity-50">
                  {isSaving ? "Traitement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}