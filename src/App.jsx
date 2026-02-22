import { useEffect, useState, useRef } from 'react';
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
import StudentsPage from './pages/school/Students';
import TeachersPage from './pages/school/Teachers';
import ClassesPage from './pages/school/Classes';
import SubjectsPage from './pages/school/Subjects';
import PaymentsPage from './pages/school/Payments';
import AttendancePage from './pages/school/Attendance';
import SettingsPage from './pages/school/Settings';
import AssignmentsPage from './pages/school/Assignments'; // <--- NOUVEAU

// Nouveaux Modules Intégrés
import SchedulePage from './pages/school/Schedule';
import GradesPage from './pages/school/Grades';
import ReportsPage from './pages/school/Reports';

function App() {
  const subdomain = getSubdomain();
  const { school, loading: schoolLoading } = useSchool();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('admin-dash');

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    const checkInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', initialSession.user.id).single();
        setProfile(userProfile);
        setSession(initialSession);
      }
      setInitializing(false);
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', newSession.user.id).single();
        setProfile(userProfile);
        setSession(newSession);
      } else {
        setSession(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing || (subdomain && subdomain !== 'admin' && schoolLoading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-[#5551FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black italic text-slate-400 animate-pulse tracking-tighter">KodaSchool Syncing...</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-900">
      <Sidebar profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header profile={profile} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto">
            
            {/* LOGIQUE DE NAVIGATION ÉCOLE */}
            {profile?.role !== 'super_admin' && school && (
              <div className="animate-in fade-in duration-500">
                {/* Dashboard avec fonction de navigation pour les raccourcis */}
                {activeTab === 'admin-dash' && (
                  <SchoolDashboard 
                    school={school} 
                    profile={profile} 
                    onNavigate={(tab) => setActiveTab(tab)} 
                  />
                )}
                
                {/* Gestion des entités */}
                {activeTab === 'students' && <StudentsPage school={school} />}
                {activeTab === 'teachers' && <TeachersPage school={school} />}
                {activeTab === 'classes' && <ClassesPage school={school} />}
                {activeTab === 'subjects' && <SubjectsPage school={school} />}
                {activeTab === 'assignments' && <AssignmentsPage school={school} />} {/* <--- AJOUTÉ */}
                
                {/* Modules Pédagogiques */}
                {activeTab === 'schedule' && <SchedulePage school={school} />}
                {activeTab === 'grades' && <GradesPage school={school} />}
                {activeTab === 'reports' && <ReportsPage school={school} />}
                
                {/* Gestion Administrative */}
                {activeTab === 'payments' && <PaymentsPage school={school} />}
                {activeTab === 'attendance' && <AttendancePage school={school} />}
                {activeTab === 'settings' && <SettingsPage school={school} />}
              </div>
            )}

            {/* PORTAIL SUPER ADMIN */}
            {profile?.role === 'super_admin' && <SuperAdmin activeTab={activeTab} />}
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;