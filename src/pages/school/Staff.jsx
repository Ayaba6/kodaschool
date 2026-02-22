import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MoreHorizontal, 
  X, Mail, Phone, BookOpen, Trash2, Edit2, ShieldCheck, UserCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Staff({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  // Ajout du rôle 'parent' dans la configuration
  const roles = [
    { id: 'teacher', label: 'Enseignant', color: 'bg-indigo-50 text-[#5551FF]' },
    { id: 'secretariat', label: 'Secrétariat', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'comptable', label: 'Comptable', color: 'bg-amber-50 text-amber-600' },
    { id: 'parent', label: 'Parent d\'élève', color: 'bg-rose-50 text-rose-600' }, // <--- NOUVEAU RÔLE
  ];

  useEffect(() => {
    if (school?.id) {
      fetchStaff();
    }
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [school?.id]);

  async function fetchStaff() {
    setLoading(true);
    // Mise à jour du filtre pour inclure 'parent'
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('school_id', school.id)
      .in('role', ['teacher', 'secretariat', 'comptable', 'parent'])
      .order('created_at', { ascending: false });
    
    if (error) console.error("Erreur fetch:", error.message);
    setStaffList(data || []);
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (!confirm("Voulez-vous vraiment révoquer l'accès de ce membre ?")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) fetchStaff();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    
    const newMember = {
      school_id: school.id,
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email').toLowerCase().trim(),
      phone: formData.get('phone'),
      role: formData.get('role'),
      status: 'pending',
      metadata: {
        specialization: formData.get('specialization') || (formData.get('role') === 'parent' ? 'Parent' : 'Administratif'),
        hire_date: new Date().toISOString().split('T')[0],
        account_activated: false 
      }
    };

    const { error } = await supabase.from('profiles').insert([newMember]);
    
    if (!error) {
      setIsModalOpen(false);
      fetchStaff();
      alert("Profil créé avec succès !");
    } else {
      alert("Erreur: " + error.message);
    }
    setIsSaving(false);
  };

  const filteredStaff = staffList.filter(s => 
    `${s.first_name} ${s.last_name} ${s.role}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BARRE D'OUTILS */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher (Nom, rôle, email...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5551FF]/10 outline-none text-sm font-medium transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#5551FF] text-white rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} /> Ajouter un utilisateur
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
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Membre</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rôle / Poste</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Gestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm ${
                          member.role === 'teacher' ? 'bg-slate-900 text-white' : 
                          member.role === 'parent' ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-[#5551FF]'
                        }`}>
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{member.first_name} {member.last_name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{member.metadata?.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border border-black/5 ${roles.find(r => r.id === member.role)?.color || 'bg-slate-100'}`}>
                        {roles.find(r => r.id === member.role)?.label || member.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {member.id.length > 30 ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-tighter">
                          <ShieldCheck size={12} /> Actif
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase tracking-tighter animate-pulse">
                          <UserCircle size={12} /> En attente
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[10px] font-bold text-slate-500 space-y-1">
                        <div className="flex items-center gap-2"><Mail size={12} className="text-slate-300"/> {member.email}</div>
                        <div className="flex items-center gap-2"><Phone size={12} className="text-slate-300"/> {member.phone}</div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === member.id ? null : member.id);
                        }}
                        className="p-2 text-slate-400 hover:text-[#5551FF] hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {activeMenu === member.id && (
                        <div className="absolute right-8 top-12 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 py-2 animate-in slide-in-from-top-2 duration-200">
                          <button className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            <Edit2 size={14} className="text-slate-400" /> Modifier Profil
                          </button>
                          <div className="h-px bg-slate-50 my-1" />
                          <button 
                            onClick={() => handleDelete(member.id)}
                            className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={14} /> Révoquer l'accès
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

      {/* MODAL AJOUT PERSONNEL / PARENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">Ajouter un Membre</h3>
                <p className="text-[10px] font-black text-[#5551FF] uppercase tracking-[0.2em] mt-1">L'accès sera créé pour l'email renseigné</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-red-500 transition-all border border-slate-100"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Prénom</label>
                  <input name="first_name" required placeholder="Ex: Jean" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nom</label>
                  <input name="last_name" required placeholder="Ex: Dupont" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#5551FF] uppercase ml-1 tracking-widest italic">Attribution du Rôle *</label>
                <select name="role" required className="w-full px-5 py-4 bg-slate-900 text-white border-none rounded-2xl outline-none font-black italic appearance-none cursor-pointer">
                  <option value="">-- Sélectionnez le rôle --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.label.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Email (Login ID)</label>
                  <input name="email" type="email" required placeholder="adresse@email.com" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Téléphone</label>
                  <input name="phone" required placeholder="0102030405" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Détails (Matière, Relation, etc.)</label>
                <input name="specialization" placeholder="Ex: Prof de Math, Parent de [Nom de l'enfant]..." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-black italic text-slate-400 uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Annuler</button>
                <button disabled={isSaving} className="px-10 py-4 bg-[#5551FF] text-white rounded-2xl font-black italic shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all uppercase text-[11px] tracking-widest">
                  {isSaving ? "Enregistrement..." : "Confirmer l'ajout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}