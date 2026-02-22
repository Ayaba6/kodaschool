import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MoreHorizontal, 
  X, Mail, Phone, BookOpen, Trash2, Edit2, Layers
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Teachers({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]); // Pour stocker les matières de la BDD
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    if (school?.id) {
      fetchTeachers();
      fetchDbSubjects(); // On récupère les matières dynamiques
    }
    
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [school?.id]);

  // 1. Récupérer les enseignants
  async function fetchTeachers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', school.id)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false });
    
    if (error) console.error("Erreur fetch:", error.message);
    setTeachersList(data || []);
    setLoading(false);
  }

  // 2. Récupérer les matières que tu as créées dans l'autre module
  async function fetchDbSubjects() {
    const { data } = await supabase
      .from('subjects')
      .select('name')
      .eq('school_id', school.id);
    setDbSubjects(data || []);
  }

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet enseignant ?")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) fetchTeachers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    
    const newTeacher = {
      school_id: school.id,
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email') || null,
      phone: formData.get('phone'),
      role: 'teacher',
      status: 'active',
      metadata: {
        specialization: formData.get('specialization'),
        hire_date: new Date().toISOString().split('T')[0]
      }
    };

    const { error } = await supabase.from('profiles').insert([newTeacher]);
    if (!error) {
      setIsModalOpen(false);
      fetchTeachers();
    }
    setIsSaving(false);
  };

  const filteredTeachers = teachersList.filter(t => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BARRE D'OUTILS */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un enseignant..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5551FF]/10 outline-none text-sm font-medium transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#5551FF] text-white rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} /> Nouvel enseignant
        </button>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-8 h-8 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left relative">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Nom & Prénom</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Spécialité</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Contact</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{teacher.first_name} {teacher.last_name}</p>
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">● actif</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-[#5551FF] text-[10px] font-black rounded-xl uppercase w-fit shadow-sm border border-indigo-100/50">
                        <BookOpen size={12} />
                        {teacher.metadata?.specialization || 'Non définie'}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[11px] font-bold text-slate-500 space-y-1">
                        <div className="flex items-center gap-2"><Mail size={12} className="text-slate-300"/> {teacher.email || '-'}</div>
                        <div className="flex items-center gap-2"><Phone size={12} className="text-slate-300"/> {teacher.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === teacher.id ? null : teacher.id);
                        }}
                        className="p-2 text-slate-400 hover:text-[#5551FF] hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenu === teacher.id && (
                        <div className="absolute right-8 top-12 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                            <Edit2 size={14} className="text-slate-400" /> Modifier le profil
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher.id)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={14} /> Supprimer l'enseignant
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

      {/* MODAL AJOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter">Nouvel Enseignant</h3>
                <p className="text-[10px] font-bold text-[#5551FF] uppercase tracking-[0.2em] mt-1">Enregistrement administratif</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Prénom</label>
                  <input name="first_name" required placeholder="Ex: Jean" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom de famille</label>
                  <input name="last_name" required placeholder="Ex: Dupont" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#5551FF] uppercase ml-1">Spécialité (Catalogue)</label>
                  <select name="specialization" required className="w-full px-5 py-3 bg-slate-900 text-white border-none rounded-2xl outline-none font-bold italic appearance-none">
                    <option value="">Choisir...</option>
                    {dbSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    {dbSubjects.length === 0 && <option disabled>Aucune matière créée</option>}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Téléphone</label>
                  <input name="phone" required placeholder="01 02 03..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Adresse Email Professionnelle</label>
                <input name="email" type="email" placeholder="prof@ecole.com" className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-black italic text-slate-400">Annuler</button>
                <button disabled={isSaving} className="px-10 py-4 bg-[#5551FF] text-white rounded-2xl font-black italic shadow-xl shadow-indigo-100 hover:bg-[#4844ff] disabled:opacity-50 transition-all">
                  {isSaving ? "Enregistrement..." : "Confirmer le recrutement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}