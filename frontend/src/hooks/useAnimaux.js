import { useState } from "react";
import axios from "../utils/axios";

export function useAnimaux() {
  const [animaux, setAnimaux] = useState([]);
  const [animalAppointments, setAnimalAppointments] = useState([]);

  // Récupère la liste des animaux récents
  const fetchRecentsAnimaux = async () => {
    const res = await axios.get('/api/animaux?recents=true');
    // Si l'API retourne { animaux: [...] }
    const animauxArray = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.animaux)
        ? res.data.animaux
        : [];
    setAnimaux(animauxArray);
  };

  // Ajoute ou modifie un animal
  const saveAnimal = async (animalData) => {
    if (animalData._id) {
      await axios.put(`/api/animaux/${animalData._id}`, animalData);
    } else {
      await axios.post(`/api/animaux`, animalData);
    }
    await fetchRecentsAnimaux();
  };

  // Récupère les rendez-vous d'un animal
  const fetchAnimalAppointments = async (animalId) => {
    if (!animalId) {
      setAnimalAppointments([]);
      return;
    }
    try {
      const res = await axios.get(`/api/animaux/${animalId}/appointments`);
      setAnimalAppointments(res.data || []);
    } catch {
      setAnimalAppointments([]);
    }
  };


  
  return {
    animaux,
    fetchRecentsAnimaux,
    saveAnimal,
    animalAppointments,
    setAnimalAppointments,
    fetchAnimalAppointments,
  };
}