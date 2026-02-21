/**
 * Extrait le sous-domaine de l'URL actuelle.
 * Exemple : 'lycee-avenir.kodaschool.com' -> 'lycee-avenir'
 */
export const getSubdomain = () => {
  const hostname = window.location.hostname;
  
  // 1. Gestion du développement local (localhost)
  // Tu peux changer 'lycee-test' par le sous-domaine que tu veux tester
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'lycee-test'; 
  }

  const parts = hostname.split('.');

  // 2. Si on a au moins 3 parties (sous-domaine.domaine.com)
  // Note : Ajuste le chiffre si ton domaine principal est plus complexe (ex: .com.bf)
  if (parts.length >= 3) {
    return parts[0];
  }

  // 3. Pas de sous-domaine (ex: sur kodaschool.com directement)
  return null;
};