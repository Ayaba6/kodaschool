import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Import manquant corrigé
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  Settings, School, ChevronLeft, ChevronRight, LogOut,
  Bell, ShieldCheck, Palette, Zap, Menu, X,
  ClipboardList, Calendar, FileText, CreditCard, UserX, BarChart3, Briefcase
} from 'lucide-react';

// Configuration des menus dynamique par rôle
const MENU_CONFIG = {
  super_admin: [
    { icon: LayoutDashboard, label: "Vue d'ensemble", id: 'admin-dash' },
    { icon: School, label: 'Établissements', id: 'schools' },
    { icon: Users, label: 'Utilisateurs', id: 'users' },
    { icon: Settings, label: 'Configuration', id: 'config' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Tableau de bord', id: 'admin-dash' },
    { icon: Users, label: 'Élèves', id: 'students' },
    { icon: Briefcase, label: 'Personnel (Staff)', id: 'staff' },
    { icon: BookOpen, label: 'Classes', id: 'classes' },
    { icon: ClipboardList, label: 'Matières', id: 'subjects' },
    { icon: Calendar, label: 'Emploi du temps', id: 'schedule' },
    { icon: FileText, label: 'Notes', id: 'grades' },
    { icon: CreditCard, label: 'Paiements', id: 'payments' },
    { icon: UserX, label: 'Absences', id: 'attendance' },
    { icon: BarChart3, label: 'Bulletins', id: 'reports' },
    { icon: Settings, label: 'Paramètres', id: 'settings' },
  ],
  secretariat: [
    { icon: LayoutDashboard, label: 'Tableau de bord', id: 'admin-dash' },
    { icon: Users, label: 'Élèves', id: 'students' },
    { icon: UserX, label: 'Présences', id: 'attendance' },
    { icon: Calendar, label: 'Planning', id: 'schedule' },
    { icon: Briefcase, label: 'Annuaire Staff', id: 'staff' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Mes Classes', id: 'admin-dash' },
    { icon: UserX, label: 'Appel', id: 'attendance' },
    { icon: FileText, label: 'Saisir Notes', id: 'grades' },
    { icon: Calendar, label: 'Mon Agenda', id: 'schedule' },
  ],
  comptable: [
    { icon: LayoutDashboard, label: 'Finance Dashboard', id: 'admin-dash' },
    { icon: CreditCard, label: 'Encaissements', id: 'payments' },
    { icon: Briefcase, label: 'Salaires Staff', id: 'staff' },
    { icon: FileText, label: 'Rapports Financiers', id: 'reports' },
  ],
  parent: [
    { icon: LayoutDashboard, label: 'Suivi Enfant', id: 'admin-dash' },
    { icon: FileText, label: 'Notes & Bulletins', id: 'reports' },
    { icon: UserX, label: 'Absences', id: 'attendance' },
    { icon: CreditCard, label: 'Scolarité', id: 'payments' },
  ]
};

export default function Sidebar({ profile, activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const menuItems = MENU_CONFIG[profile?.role] || MENU_CONFIG.admin;

  const roleLabels = {
    super_admin: 'Network Admin',
    admin: 'Directeur',
    secretariat: 'Secrétariat',
    teacher: 'Enseignant',
    comptable: 'Comptabilité',
    parent: 'Espace Parent'
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      {!mobile && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 bg-[#5551FF] text-white rounded-full p-1.5 z-50 shadow-lg hover:scale-110 transition-transform hidden lg:block"
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>
      )}

      <div className={`p-6 mb-4 flex items-center gap-3 ${mobile ? 'justify-between' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="bg-[#5551FF] p-2.5 rounded-2xl text-white shrink-0 shadow-xl shadow-indigo-500/20">
            <Zap size={22} fill="currentColor" />
          </div>
          {(mobile || !isCollapsed) && (
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter italic leading-none">KodaSchool</span>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">
                {profile?.role === 'super_admin' ? 'Network Admin' : 'School Management'}
              </span>
            </div>
          )}
        </div>
        {mobile && (
          <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 p-2">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if(mobile) setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                ? 'bg-[#5551FF] text-white shadow-lg shadow-indigo-500/20' 
                : 'hover:bg-white/5 text-slate-400 hover:text-slate-100'
              }`}
            >
              <item.icon size={20} className={`shrink-0 ${isActive ? 'scale-110' : 'group-hover:text-white'}`} />
              {(mobile || !isCollapsed) && (
                <span className={`text-sm tracking-tight whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800/50">
        <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shrink-0 shadow-inner">
              {profile?.first_name?.charAt(0) || 'U'}
            </div>
            {(mobile || !isCollapsed) && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-black truncate leading-tight">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-tighter italic">
                  {roleLabels[profile?.role] || 'Utilisateur'}
                </p>
              </div>
            )}
            {(mobile || !isCollapsed) && (
              <button onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-3 bg-[#0F172A] text-white rounded-2xl shadow-xl border border-slate-700"
        >
          <Menu size={24} />
        </button>
      </div>

      <motion.div 
        animate={{ width: isCollapsed ? 85 : 280 }}
        className="hidden lg:flex h-screen bg-[#0F172A] text-slate-400 flex-col relative border-r border-slate-800 z-20 shrink-0 shadow-2xl"
      >
        <SidebarContent />
      </motion.div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-[280px] bg-[#0F172A] flex flex-col z-[80] lg:hidden"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}