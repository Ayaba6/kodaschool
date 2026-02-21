import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getSubdomain } from '../utils/tenant';

export function useSchool() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSchool() {
      const subdomain = getSubdomain();

      // Si on est sur 'admin' ou localhost sans sous-domaine, on ne cherche pas d'école
      if (!subdomain || subdomain === 'admin') {
        setLoading(false);
        return;
      }

      try {
        const { data, error: sbError } = await supabase
          .from('schools')
          .select('*')
          .eq('subdomain', subdomain)
          .eq('is_active', true) // Sécurité : on ne charge que si l'école est active
          .single();

        if (sbError) throw sbError;
        setSchool(data);
      } catch (err) {
        console.error("Erreur useSchool:", err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSchool();
  }, []);

  return { school, loading, error };
}