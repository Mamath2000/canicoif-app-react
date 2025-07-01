import { useState } from "react";
import axios from "../utils/axios";

export function useAnimaux() {

  const [editAnimal, setEditAnimal] = useState(null);
  const [animaux, setAnimaux] = useState([]);
  // const [animalAppointments, setAnimalAppointments] = useState([]);

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

const searchAnimaux = async (filters) => {
    try {
      const params = {};
      if (filters.nom) params.nom = filters.nom;
      if (filters.espece) params.espece = filters.espece;
      if (filters.race) params.race = filters.race;
      if (filters.exclureDecedes) params.exclureDecedes = true;
      if (filters.exclureClientsArchives) params.exclureClientsArchives = true;
      const res = await axios.get('/api/animaux', { params }); 
      const animauxArray = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.animaux)
        ? res.data.animaux
        : [];
      setAnimaux(animauxArray);
    } catch {
      setAnimaux([]);
    }
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

  // // Récupère les rendez-vous d'un animal
  // const fetchAnimalAppointments = async (animalId) => {
  //   if (!animalId) {
  //     setAnimalAppointments([]);
  //     return;
  //   }
  //   try {
  //     const res = await axios.get(`/api/animaux/${animalId}/appointments`);
  //     setAnimalAppointments(res.data || []);
  //   } catch {
  //     setAnimalAppointments([]);
  //   }
  // };

  const fetchAnimalById = async (animalId, withClient = false, withAppointments = false) => {
    if (!animalId) return null;
    try {
      const params = {
        withClient,
        withAppointments,
      };
      const res = await axios.get(`/api/animaux/${animalId}`, { params });
      setEditAnimal(res.data);
      // if (withAppointments) {
      //   setAnimalAppointments(res.data.appointments || []);
      // }
      return res.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'animal :", error);
      setEditAnimal(null);
      // setAnimalAppointments([]);
      return null;
    }
  };
  
  return {
    animaux,
    // animalAppointments,
    // setAnimalAppointments,
    editAnimal,
    setEditAnimal,
    saveAnimal,
    fetchRecentsAnimaux,
    fetchAnimalById,
    // fetchAnimalAppointments,
    searchAnimaux,
  };
}