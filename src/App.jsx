import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { getSubdomain } from './utils/tenant';
import { useSchool } from './hooks/useSchool';

// Composants & Pages
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const subdomain = getSubdomain();
  const { school, loading: schoolLoading } = useSchool();
  
  // États de l'application
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  
  // État de navigation centralisé
  const [activeTab, setActiveTab] = useState('admin-dash');

  // Sécurité pour éviter les doubles exécutions au montage
  const isMounted = useRef(false);

  // Fonction pour récupérer le profil utilisateur
  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Erreur profil:", err.message);
      return null;
    }
  };

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    // 1. Vérification de la session initiale
    const checkInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        const userProfile = await fetchUserData(initialSession.user.id);
        setProfile(userProfile);
        setSession(initialSession);
      }
      setInitializing(false);
    };

    checkInitialSession();

    // 2. Écouteur des changements d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        const userProfile = await fetchUserData(newSession.user.id);
        setProfile(userProfile);
        setSession(newSession);
      } else {
        setSession(null);
        setProfile(null);
      }
      setInitializing(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Tableau vide crucial pour arrêter la boucle infinie

  // --- LOGIQUE DE RENDU DES ÉCRANS DE CHARGEMENT ---
  if (initializing || (subdomain && subdomain !== 'admin' && schoolLoading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black italic text-slate-400 animate-pulse tracking-tighter">
          KodaSchool Syncing...
        </p>
      </div>
    );
  }

  // --- SI PAS DE SESSION : ÉCRAN DE LOGIN ---
  if (!session) return <Login />;

  // --- SI CONNECTÉ : DASHBOARD PRINCIPAL ---
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* SIDEBAR UNIQUE ET COMMUNE */}
      <Sidebar 
        profile={profile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER UNIQUE */}
        <Header profile={profile} />

        {/* ZONE DE CONTENU DYNAMIQUE */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          
          <div className="max-w-[1400px] mx-auto">
            
            {/* 🛡️ CAS A : SUPER ADMIN */}
            {profile?.role === 'super_admin' && (
              <ProtectedRoute session={session} profile={profile} requiredRole="super_admin">
                <SuperAdmin activeTab={activeTab} />
              </ProtectedRoute>
            )}

            {/* 🛡️ CAS B : ÉCOLE (TENANT) */}
            {profile?.role !== 'super_admin' && subdomain && subdomain !== 'admin' && (
              <ProtectedRoute session={session} profile={profile}>
                {!school ? (
                  <div className="bg-white p-12 rounded-[40px] border border-red-50 text-center shadow-sm">
                    <h2 className="text-3xl font-black text-red-500 italic mb-2">404</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Établissement introuvable</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-700">
                    <header className="mb-8">
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">
                        Bonjour, {profile.first_name} !
                      </h2>
                      <p className="text-slate-500 font-bold mt-2">Gestion : {school.name}</p>
                    </header>
                    
                    {/* Les cards harmonisées pour le Dashboard École */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-10 bg-[#5551FF] rounded-[32px] text-white shadow-xl shadow-indigo-100">
                        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Statut</p>
                        <p className="text-3xl font-black italic">Session Active</p>
                      </div>
                      <div className="p-10 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-slate-200">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Rôle</p>
                        <p className="text-3xl font-black italic capitalize">{profile.role}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ProtectedRoute>
            )}

            {/* ⚠️ CAS C : ERREUR DE DOMAINE */}
            {profile?.role !== 'super_admin' && (!subdomain || subdomain === 'admin') && (
              <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-sm text-center border border-slate-100 mt-20">
                <h2 className="text-2xl font-black text-slate-900 mb-4 italic">Accès Restreint</h2>
                <p className="text-slate-500 mb-8 font-medium">Veuillez vous connecter via l'adresse personnalisée de votre école.</p>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="w-full bg-[#5551FF] text-white py-4 rounded-2xl font-black italic hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Déconnexion
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default App;