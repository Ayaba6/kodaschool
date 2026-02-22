import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Download, Wallet, 
  CreditCard, Banknote, History, X 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Payments({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (school?.id) fetchStudents();
  }, [school?.id]);

  async function fetchStudents() {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('school_id', school.id)
      .eq('role', 'student');
    setStudents(data || []);
  }

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Logique d'insertion Supabase ici
    setTimeout(() => {
      setIsSaving(false);
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. STATS CARDS (Basé sur paie.PNG) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total encaissé", value: "0 F CFA", color: "text-emerald-600" },
          { label: "Inscriptions", value: "0 F CFA", color: "text-slate-900" },
          { label: "Scolarités", value: "0 F CFA", color: "text-slate-900" },
          { label: "Paiements", value: "0", color: "text-slate-900" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 2. ACTIONS & FILTRES */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un élève..."
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none">
            <option>Tous les types</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={18} /> Exporter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5551FF] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4844ff] transition-all"
          >
            <Plus size={18} /> Nouveau paiement
          </button>
        </div>
      </div>

      {/* 3. LISTE DES PAIEMENTS (Loading state de paie.PNG) */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* 4. MODAL ENREGISTRER PAIEMENT (Basé sur paiem.PNG) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Enregistrer un paiement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Élève *</label>
                <select required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white">
                  <option value="">Sélectionner</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.last_name} {s.first_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Montant (FCFA) *</label>
                  <input type="number" required placeholder="Ex: 50000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Date *</label>
                  <input type="date" defaultValue="2026-02-22" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Type *</label>
                  <select required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white">
                    <option value="">Sélectionner</option>
                    <option value="scolarite">Scolarité</option>
                    <option value="inscription">Inscription</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Mode de paiement</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white font-medium">
                    <option>Espèces</option>
                    <option>Chèque</option>
                    <option>Transfert Mobile</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Trimestre</label>
                <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white">
                  <option value="">Sélectionner</option>
                  <option>Trimestre 1</option>
                  <option>Trimestre 2</option>
                  <option>Trimestre 3</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 ml-1">Notes</label>
                <textarea placeholder="Commentaires..." className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none min-h-[80px]" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-500">Annuler</button>
                <button disabled={isSaving} className="px-8 py-2.5 bg-[#5551FF] text-white rounded-xl font-bold hover:bg-[#4844ff] shadow-lg shadow-indigo-100 transition-all">
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}