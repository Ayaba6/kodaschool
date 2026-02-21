import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  Settings, School, ChevronLeft, ChevronRight, LogOut,
  Bell, ShieldCheck, Palette, Zap, Menu, X
} from 'lucide-react';

const MENU_CONFIG = {
  super_admin: [
    { icon: LayoutDashboard, label: 'Vue d\'ensemble', id: 'admin-dash' },
    { icon: School, label: 'Établissements', id: 'schools' },
    { icon: Users, label: 'Utilisateurs', id: 'users' },
    { icon: Settings, label: 'Configuration', id: 'config' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Tableau de bord', id: 'dash' },
    { icon: Users, label: 'Élèves', id: 'students' },
    { icon: GraduationCap, label: 'Enseignants', id: 'teachers' },
    { icon: BookOpen, label: 'Classes', id: 'classes' },
    { icon: Settings, label: 'Paramètres', id: 'settings' },
  ]
};

export default function Sidebar({ profile, activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // État pour le mobile
  
  const menuItems = MENU_CONFIG[profile?.role] || MENU_CONFIG.admin;

  // Composant interne pour le contenu de la sidebar (évite la répétition)
  const SidebarContent = ({ mobile = false }) => (
    <>
      {/* Bouton Toggle (Desktop uniquement) */}
      {!mobile && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 bg-[#5551FF] text-white rounded-full p-1.5 z-50 shadow-lg hover:scale-110 transition-transform hidden lg:block"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>
      )}

      {/* SECTION LOGO */}
      <div className={`p-6 mb-8 flex items-center gap-3 ${mobile ? 'justify-between' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#5551FF] p-2.5 rounded-2xl text-white shrink-0 shadow-xl shadow-indigo-500/20">
            <Zap size={22} fill="currentColor" />
          </div>
          {(mobile || !isCollapsed) && (
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter italic leading-none">KodaSchool</span>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Network Admin</span>
            </div>
          )}
        </div>
        {mobile && (
          <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 p-2">
            <X size={24} />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if(mobile) setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                isActive ? 'bg-[#5551FF] text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={`shrink-0 ${isActive ? 'scale-110' : ''}`} />
              {(mobile || !isCollapsed) && (
                <span className={`font-bold text-sm tracking-tight whitespace-nowrap ${isActive ? 'font-black' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* PIED DE PAGE */}
      <div className="p-4 space-y-4">
        {(mobile || !isCollapsed) && (
          <div className="px-4 py-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex justify-between">
            <Bell size={18} className="cursor-pointer hover:text-white" />
            <ShieldCheck size={18} className="cursor-pointer hover:text-white" />
            <Palette size={18} className="cursor-pointer hover:text-white" />
          </div>
        )}
        <div className="p-3 rounded-[22px] bg-slate-800/50 border border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shrink-0">
              {profile?.first_name?.charAt(0)}
            </div>
            {(mobile || !isCollapsed) && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-black truncate">{profile?.first_name}</p>
                <p className="text-[10px] text-indigo-400 uppercase italic">Admin</p>
              </div>
            )}
            {(mobile || !isCollapsed) && <LogOut size={16} className="cursor-pointer hover:text-red-400" />}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. BOUTON MOBILE (Visible uniquement sur petit écran) */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-[#0F172A] text-white rounded-2xl shadow-xl border border-slate-700"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 2. SIDEBAR DESKTOP (Comportement actuel) */}
      <motion.div 
        animate={{ width: isCollapsed ? 85 : 280 }}
        className="hidden lg:flex h-screen bg-[#0F172A] text-slate-400 flex-col relative border-r border-slate-800 z-20 shrink-0"
      >
        <SidebarContent />
      </motion.div>

      {/* 3. SIDEBAR MOBILE (Overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Background sombre cliquable */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
            />
            {/* Le tiroir coulissant */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-[280px] bg-[#0F172A] text-slate-400 flex flex-col z-[80] lg:hidden shadow-2xl"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}