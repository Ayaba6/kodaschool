import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Download, Wallet, 
  CreditCard, Banknote, History, X, CheckCircle2, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Payments({ school }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // États du formulaire
  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    type: 'scolarite',
    method: 'Espèces',
    period: 'Trimestre 1',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (school?.id) {
      fetchInitialData();
    }
  }, [school?.id]);

  async function fetchInitialData() {
    setLoading(true);
    // 1. Récupérer les étudiants
    const { data: stu } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('school_id', school.id);
    setStudents(stu || []);

    // 2. Récupérer l'historique des paiements
    const { data: pay } = await supabase
      .from('payments')
      .select('*, students(first_name, last_name)')
      .eq('school_id', school.id)
      .order('created_at', { ascending: false });
    setPayments(pay || []);
    setLoading(false);
  }

  const handleSavePayment = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = await supabase
      .from('payments')
      .insert([{
        ...formData,
        amount: parseFloat(formData.amount),
        school_id: school.id
      }]);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      setIsModalOpen(false);
      fetchInitialData(); // Rafraîchir la liste et les stats
      setFormData({ ...formData, amount: '', notes: '' }); // Reset partiel
    }
    setIsSaving(false);
  };

  // Calculs des statistiques
  const stats = {
    total: payments.reduce((acc, curr) => acc + curr.amount, 0),
    inscriptions: payments.filter(p => p.type === 'inscription').reduce((acc, curr) => acc + curr.amount, 0),
    scolarites: payments.filter(p => p.type === 'scolarite').reduce((acc, curr) => acc + curr.amount, 0),
    count: payments.length
  };

  const filteredPayments = payments.filter(p => 
    `${p.students?.first_name} ${p.students?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total encaissé", value: `${stats.total.toLocaleString()} F`, color: "text-emerald-600", icon: Wallet },
          { label: "Inscriptions", value: `${stats.inscriptions.toLocaleString()} F`, color: "text-slate-900", icon: CreditCard },
          { label: "Scolarités", value: `${stats.scolarites.toLocaleString()} F`, color: "text-slate-900", icon: Banknote },
          { label: "Nombre de reçus", value: stats.count, color: "text-[#5551FF]", icon: History }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. ACTIONS & FILTRES */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-1 min-w-[300px] items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un paiement (nom élève)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs font-bold uppercase tracking-tight"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 transition-all">
            <Download size={18} /> Exporter CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5551FF] text-white rounded-2xl text-[10px] font-black uppercase italic shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} /> Nouveau paiement
          </button>
        </div>
      </div>

      {/* 3. TABLEAU DES PAIEMENTS */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-[#5551FF]" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des transactions...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Élève</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Mode</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400 italic">
                    {new Date(p.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-black uppercase text-slate-900 leading-none">
                      {p.students?.last_name} {p.students?.first_name}
                    </p>
                    <p className="text-[9px] font-bold text-[#5551FF] uppercase">{p.period}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{p.method}</td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-black text-slate-900 italic">{p.amount.toLocaleString()} F</p>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400 text-[10px] font-black uppercase italic">
                    Aucun paiement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#5551FF] text-white rounded-xl"><Plus size={18}/></div>
                <h3 className="text-sm font-black uppercase italic text-slate-900">Nouveau Paiement</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSavePayment} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Élève bénéficiaire *</label>
                <select 
                  required 
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs uppercase"
                >
                  <option value="">Sélectionner un élève</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.last_name} {s.first_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Montant (F CFA) *</label>
                  <input 
                    type="number" required 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Ex: 50000" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Date du paiement *</label>
                  <input 
                    type="date" required 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type de frais *</label>
                  <select 
                    required 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs"
                  >
                    <option value="scolarite">Scolarité</option>
                    <option value="inscription">Inscription</option>
                    <option value="tenue">Tenue / Livres</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Mode de règlement</label>
                  <select 
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs"
                  >
                    <option>Espèces</option>
                    <option>Chèque</option>
                    <option>Transfert Mobile</option>
                    <option>Virement</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-black uppercase text-[10px] text-slate-400 hover:text-slate-600 transition-colors">Annuler</button>
                <button 
                  disabled={isSaving} 
                  className="px-10 py-3 bg-[#5551FF] text-white rounded-2xl font-black uppercase italic text-[10px] shadow-xl shadow-indigo-100 hover:bg-[#4844ff] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Enregistrer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}