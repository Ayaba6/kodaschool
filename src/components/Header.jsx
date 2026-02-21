import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function Header({ profile }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Titre dynamique selon la page */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Tableau de bord</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            3
          </span>
        </button>

        {/* Profil Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-3 hover:bg-gray-50 rounded-2xl transition-all"
          >
            {/* Avatar avec Initiales */}
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0) || 'A'}
            </div>
            
            {/* Infos texte */}
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-none">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-1 italic capitalize">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>

            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menu Déroulant (Dropdown) */}
          {isProfileOpen && (
            <>
              {/* Overlay invisible pour fermer au clic ailleurs */}
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
              
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mon compte</p>
                </div>

                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={18} className="text-gray-400" /> Profil
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={18} className="text-gray-400" /> Paramètres
                </button>

                <div className="h-px bg-gray-50 my-2"></div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                >
                  <LogOut size={18} /> Déconnexion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}