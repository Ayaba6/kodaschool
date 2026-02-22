import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useStudents(schoolId) {
  const [stats, setStats] = useState({ total: 0, boys: 0, girls: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    async function fetchStudentStats() {
      try {
        setLoading(true);
        const { data, count, error: sbError } = await supabase
          .from('students')
          .select('*', { count: 'exact' })
          .eq('school_id', schoolId);

        if (sbError) throw sbError;

        if (data) {
          setStats({
            total: count || 0,
            boys: data.filter(s => s.gender === 'M').length,
            girls: data.filter(s => s.gender === 'F').length,
            active: data.filter(s => s.status === 'active').length
          });
        }
      } catch (err) {
        console.error("Erreur hook useStudents:", err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentStats();
  }, [schoolId]);

  // IMPORTANT : On retourne l'objet avec les stats
  return { stats, loading, error };
}