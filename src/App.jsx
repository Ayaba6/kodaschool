import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { getSubdomain } from './utils/tenant';
import { useSchool } from './hooks/useSchool';

// Layout & Auth
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Pages École
import SchoolDashboard from './pages/school/Dashboard';
import SecretaryDashboard from './pages/school/SecretaryDashboard';
import ParentDashboard from './pages/school/ParentDashboard';
import StudentsPage from './pages/school/Students';
import StaffPage from './pages/school/Staff';

function App() {
  const subdomain = getSubdomain();
  const { school, loading: schoolLoading } = useSchool();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('admin-dash');

  useEffect(() => {
    const forceStop = setTimeout(() => {
      setInitializing(false);
      console.log("⏱️ Safety Timeout");
    }, 2500);

    const fetchProfile = async (userId) => {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        console.log("Profil chargé:", data?.role); // Debug console
        setProfile(data);
      } catch (e) { 
        console.error("Erreur profil:", e); 
      }
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        fetchProfile(s.user.id);
      }
      setInitializing(false);
      clearTimeout(forceStop);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchProfile(s.user.id);
      else setProfile(null);
      setInitializing(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(forceStop);
    };
  }, []);

  // 1. CHARGEMENT
  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-black italic text-slate-400 animate-pulse">
        KODASCHOOL SYNC...
      </div>
    );
  }

  // 2. AUTHENTIFICATION
  if (!session) return <Login />;

  // 3. LOGIQUE DE RENDU DES DASHBOARDS (IIFE pour éviter les bugs de switch)
  const renderMainContent = () => {
    // Si on est sur un onglet spécifique (autre que le dashboard)
    if (activeTab === 'students') return <StudentsPage school={school} />;
    if (activeTab === 'staff') return <StaffPage school={school} />;

    // Si on est sur l'onglet 'admin-dash', on filtre par rôle
    if (activeTab === 'admin-dash') {
      if (profile.role === 'super_admin') return <SuperAdmin activeTab={activeTab} />;
      
      if (school) {
        if (profile.role === 'admin') return <SchoolDashboard school={school} profile={profile} onNavigate={setActiveTab} />;
        if (profile.role === 'secretariat') return <SecretaryDashboard school={school} profile={profile} onNavigate={setActiveTab} />;
        if (profile.role === 'parent') return <ParentDashboard school={school} profile={profile} />;
        
        // Rôle inconnu
        return (
          <div className="p-10 bg-white rounded-3xl text-center">
            <p className="font-black italic text-slate-400 uppercase">Espace {profile.role} en cours</p>
          </div>
        );
      }

      // École introuvable
      return (
        <div className="p-12 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-center">
          <h2 className="text-xl font-black italic text-slate-400 uppercase">École introuvable</h2>
          <p className="text-slate-400 text-sm mt-2 tracking-tight">Vérifiez le sous-domaine : {subdomain}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {profile ? (
        <Sidebar profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <div className="w-20 lg:w-[280px] bg-[#0F172A] h-full animate-pulse" />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header profile={profile} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            
            {!profile && (
              <p className="text-center py-20 font-black italic text-slate-300 animate-pulse">LIAISON COMPTE...</p>
            )}

            {profile && schoolLoading && profile.role !== 'super_admin' && (
              <p className="text-center py-20 font-black italic text-indigo-300 animate-pulse">CHARGEMENT ECOLE...</p>
            )}

            {profile && (!schoolLoading || profile.role === 'super_admin') && (
              <div className="animate-in fade-in duration-700">
                {renderMainContent()}
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;