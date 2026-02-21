import { supabase } from '../lib/supabase';

export const authService = {
  /**
   * Connecte un utilisateur
   * La validation du profil et du sous-domaine est gérée centralement par App.jsx
   */
  async login(email, password) {
    // 1. Authentification simple avec Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Traduction des erreurs courantes pour l'utilisateur
      if (error.message === 'Invalid login credentials') {
        throw new Error("Email ou mot de passe incorrect.");
      }
      throw error;
    }

    return data;
  },

  /**
   * Déconnexion
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Récupérer la session actuelle
   */
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};