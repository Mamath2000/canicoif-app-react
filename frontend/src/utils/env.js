import axios from "./axios";

// Permet de récupérer la variable d'environnement d'affichage du label de test
// Version asynchrone qui interroge le backend pour savoir si la bannière de test doit s'afficher
export async function isTestBannerEnabled() {
  try {
    const res = await axios.get('/api/banner');
    const data = await res.data;
    return !!data.testBanner;
  } catch {
    return false;
  }
}

// Version et ref de build (injectées au build par Vite)
export function getAppVersion() {
  return {
    version: import.meta.env.VITE_VERSION || 'dev',
  };
}

// Vérifie si le bouton statistiques doit être affiché
export function isStatsButtonEnabled() {
  return import.meta.env.VITE_SHOW_STATS_BUTTON === 'true';
}
