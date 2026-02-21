import React from 'react';

const ProtectedRoute = ({ session, profile, requiredRole, children }) => {
  // Si pas de session, on ne rend rien (le parent App.jsx gère déjà le retour au Login)
  if (!session) return null;

  // Vérification du rôle si spécifié
  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <div className="h-full flex items-center justify-center p-10 text-center">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm">
          <h2 className="text-xl font-black text-red-500 italic">Accès Refusé</h2>
          <p className="text-slate-500 mt-2">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;