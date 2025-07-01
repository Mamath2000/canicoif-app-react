// Permet de récupérer la variable d'environnement d'affichage du label de test
// Version asynchrone qui interroge le backend pour savoir si la bannière de test doit s'afficher
export async function isTestBannerEnabled() {
  try {
    const res = await fetch('/api/banner');
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.testBanner;
  } catch {
    return false;
  }
}

// Version et ref de build (injectées au build par Vite)
export function getAppVersion() {
  return {
    version: import.meta.env.VITE_VERSION || 'dev',
    gitRef: import.meta.env.VITE_GIT_REF || '',
  };
}
