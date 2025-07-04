import axios from "../utils/axios";

export function useInternalCheck() {
    
  // Fonction pour vérifier l'état du serveur, de la session et du token
  const checkServer = async () => {
    try {
      const response = await axios.get(`/api/internal-check`);
      // console.log('Vérification du serveur et de la session...', response);

      if (!response.status || response.status !== 200 ) {
        console.error('Session invalide ou serveur indisponible.');
        return false;
      }

      if (!response.data.sessionValid) {
        console.error('Session expirée. Veuillez vous reconnecter.');
        return false;
      }

      return true; // Tout est OK
    } catch (error) {
      console.error(error.message);
      alert(error.message);
      return false; // Une erreur s'est produite
    }
  };

  return {
    checkServer,
  };
}