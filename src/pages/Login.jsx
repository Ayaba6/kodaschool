import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useSchool } from '../hooks/useSchool';
import { supabase } from '../lib/supabase'; // Import direct pour la vérification de profil

export default function Login() {
  const { school } = useSchool();
  const [isActivationMode, setIsActivationMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isActivationMode) {
        // --- LOGIQUE D'ACTIVATION ---
        // 1. On vérifie si le profil existe déjà (créé par le directeur)
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .single();

        if (!profile || pError) {
          throw new Error("Cet email n'est pas autorisé. Contactez votre établissement.");
        }

        // 2. On crée le compte Auth (le trigger SQL fera la liaison)
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        
        setSuccess("Compte activé avec succès ! Connexion en cours...");
        // On attend 2 sec puis on connecte l'utilisateur
        setTimeout(() => setIsActivationMode(false), 2000);

      } else {
        // --- LOGIQUE LOGIN CLASSIQUE ---
        await authService.login(email, password);
      }
      
    } catch (err) {
      setError(err.message === 'Invalid login credentials' 
        ? "Email ou mot de passe incorrect." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        
        {/* Déco subtile */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 z-0" />

        <div className="text-center relative z-10">
          {school?.logo_url ? (
            <img className="mx-auto h-20 w-auto mb-6 drop-shadow-sm" src={school.logo_url} alt="Logo" />
          ) : (
            <div 
              style={{ backgroundColor: (school?.primary_color || '#5551FF') + '15', color: school?.primary_color || '#5551FF' }}
              className="mx-auto h-20 w-20 rounded-3xl flex items-center justify-center font-black text-3xl mb-6 shadow-inner"
            >
              {school?.name?.charAt(0) || 'K'}
            </div>
          )}
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            {isActivationMode ? "Activer mon compte" : (school?.name || "KodaSchool")}
          </h2>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {isActivationMode ? "Choisissez votre mot de passe" : "Espace de gestion administrative"}
          </p>
        </div>

        <form className="mt-10 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 text-rose-700 text-xs font-bold rounded-xl animate-shake">
               ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 text-emerald-700 text-xs font-bold rounded-xl">
               ✅ {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                Email Professionnel
              </label>
              <input
                type="email"
                required
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:bg-white transition-all shadow-sm"
                placeholder="nom@ecole.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                {isActivationMode ? "Créer un mot de passe" : "Mot de passe"}
              </label>
              <input
                type="password"
                required
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5551FF]/20 focus:bg-white transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: school?.primary_color || '#5551FF' }}
              className="w-full py-4 px-6 border border-transparent text-xs font-black uppercase tracking-[0.2em] italic rounded-2xl text-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
            >
              {loading ? "Traitement..." : (isActivationMode ? "Confirmer l'activation" : "Accéder à mon espace")}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsActivationMode(!isActivationMode);
                setError(null);
              }}
              className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#5551FF] transition-colors"
            >
              {isActivationMode ? "Retour à la connexion" : "Première connexion ? Activez votre compte"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          Powered by KodaSchool Sync
        </p>
      </div>
    </div>
  );
}