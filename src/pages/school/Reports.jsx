import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Printer, 
  Download, ChevronRight, User,
  Filter, BookOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Reports({ school }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Trimestre 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (school?.id) fetchClasses();
  }, [school?.id]);

  async function fetchClasses() {
    const { data } = await supabase.from('classes').select('*').eq('school_id', school.id);
    setClasses(data || []);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. BARRE DE FILTRES (Conforme à bul.PNG) */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">Classe</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 appearance-none"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">Trimestre</label>
            <select 
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900"
            >
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 ml-1">Rechercher</label>
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
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-lg font-black italic text-slate-900">Élèves (0)</h3>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* APERÇU DU BULLETIN (Droite) */}
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black italic text-slate-900">Bulletin scolaire</h3>
            {selectedStudent && (
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-[#5551FF] transition-colors"><Printer size={20}/></button>
                <button className="p-2 text-slate-400 hover:text-[#5551FF] transition-colors"><Download size={20}/></button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            {!selectedStudent ? (
              <div className="space-y-4 max-w-xs">
                <div className="w-20 h-20 bg-slate-50 rounded-[30%] flex items-center justify-center mx-auto">
                  <FileText size={32} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold italic">Sélectionnez un élève pour voir son bulletin</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Structure du bulletin généré ici */}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}