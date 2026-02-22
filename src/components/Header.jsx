import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function Header({ profile }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // 1. Fermer le menu dropdown
      setIsProfileOpen(false);
      
      // 2. Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // 3. Nettoyage de sécurité (Optionnel mais recommandé)
      localStorage.clear(); 
      
      // Note: App.jsx détectera automatiquement l'événement SIGNED_OUT
      // et affichera la page de Login sans rechargement manuel.
      
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error.message);
      // En cas de bug, on force le reload pour nettoyer l'état React
      window.location.reload();
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Titre dynamique */}
      <div>
        <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-800">
          Tableau de bord <span className="text-[#5551FF] ml-1">/ {profile?.role}</span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#5551FF] rounded-full border-2 border-white"></span>
        </button>

        {/* Profil Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-100 rounded-2xl transition-all"
          >
            {/* Avatar avec Initiales */}
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm">
              {profile?.first_name?.[0]}{profile?.last_name?.[0] || 'A'}
            </div>
            
            {/* Infos texte */}
            <div className="text-left hidden md:block">
              <p className="text-[12px] font-black text-slate-900 leading-none uppercase tracking-tighter">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-[9px] text-[#5551FF] font-black mt-1 uppercase tracking-widest italic">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>

            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Déroulant (Dropdown) */}
          {isProfileOpen && (
            <>
              {/* Overlay invisible pour fermer au clic ailleurs */}
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
              
              <div className="absolute right-0 mt-3 w-60 bg-white rounded-[24px] shadow-2xl shadow-indigo-100/50 border border-slate-100 py-2.5 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-5 py-3 border-b border-slate-50 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestion de compte</p>
                </div>

                <button className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                  <User size={16} className="text-slate-400" /> Mon Profil
                </button>
                
                <button className="w-full flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                  <Settings size={16} className="text-slate-400" /> Paramètres
                </button>

                <div className="h-px bg-slate-50 my-2 mx-4"></div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-4 text-[11px] text-rose-500 hover:bg-rose-50 transition-colors font-black uppercase tracking-[0.15em] italic"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}