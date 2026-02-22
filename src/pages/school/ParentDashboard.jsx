import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  User, FileText, Calendar, CreditCard, Bell, TrendingUp, Baby
} from 'lucide-react';

export default function ParentDashboard({ school, profile }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, [profile.id]);

  async function fetchChildren() {
    setLoading(true);
    // Récupérer les élèves liés à ce profil parent
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('parent_id', profile.id);

    if (!error && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]); // Par défaut, on sélectionne le premier enfant
    }
    setLoading(false);
  }

  if (loading) return <div className="p-20 text-center animate-pulse font-black italic text-slate-400">CHARGEMENT DES DONNÉES...</div>;

  if (children.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[40px] text-center border border-slate-100 shadow-sm">
        <Baby size={48} className="mx-auto text-slate-200 mb-4" />
        <h2 className="text-xl font-black italic uppercase text-slate-900">Aucun enfant lié</h2>
        <p className="text-slate-500 text-sm mt-2">Veuillez contacter le secrétariat pour lier votre compte à la fiche élève de votre enfant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Sélecteur d'enfant (si plusieurs) */}
      {children.length > 1 && (
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                selectedChild?.id === child.id ? 'bg-white shadow-sm text-[#5551FF]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {child.first_name}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
            {selectedChild?.first_name} {selectedChild?.last_name}
          </h1>
          <p className="text-slate-500 font-medium">Classe : <span className="text-indigo-600 font-bold">{selectedChild?.class_name || 'Non assignée'}</span></p>
        </div>
      </div>

      {/* Stats Réelles (Exemple) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <TrendingUp className="text-emerald-500 mb-3" size={24} />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Moyenne Actuelle</p>
          <p className="text-2xl font-black italic text-slate-900">{selectedChild?.average || '--'}/20</p>
        </div>
        {/* ... Ajoute d'autres cartes ici ... */}
      </div>

      {/* Le reste du design (Notes, Agenda) comme précédemment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tu peux ici mapper les notes réelles depuis une table 'grades' liée à selectedChild.id */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100">
             <h3 className="font-black italic uppercase flex items-center gap-2 mb-6"><FileText className="text-indigo-600" /> Bulletin de notes</h3>
             <p className="text-slate-400 text-xs italic">Les notes seront bientôt synchronisées...</p>
          </div>
      </div>
    </div>
  );
}