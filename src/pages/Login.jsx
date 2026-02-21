import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useSchool } from '../hooks/useSchool';

export default function Login() {
  const { school } = useSchool();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // L'appel au service d'auth
      await authService.login(email, password);
      
      // PLUS BESOIN de window.location.reload() !
      // Le onAuthStateChange dans App.jsx va détecter la connexion 
      // et changer l'interface instantanément.
      console.log("Login réussi, App.jsx va basculer...");
      
    } catch (err) {
      // On capture l'erreur de Supabase proprement
      setError(err.message === 'Invalid login credentials' 
        ? "Email ou mot de passe incorrect." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          {school?.logo_url ? (
            <img className="mx-auto h-20 w-auto mb-4" src={school.logo_url} alt="Logo" />
          ) : (
            <div 
              style={{ backgroundColor: school?.primary_color + '20', color: school?.primary_color }}
              className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl mb-4"
            >
              {school?.name?.charAt(0)}
            </div>
          )}
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {school?.name || "KodaSchool"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Espace de gestion administrative
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded flex items-center">
               <span className="mr-2">⚠️</span> {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Email Professionnel
              </label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="directeur@ecole.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: school?.primary_color || '#2563eb' }}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </span>
            ) : "Accéder à mon tableau de bord"}
          </button>
        </form>
      </div>
    </div>
  );
}