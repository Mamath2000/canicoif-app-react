import { useState } from "react";
import axios from "axios";

export function useAnimalForAnimalSearch(fetchAnimaux) {
  const [editAnimal, setEditAnimal] = useState(null);
  const [editAnimalModalOpen, setEditAnimalModalOpen] = useState(false);

  const handleEditAnimal = async (animal) => {
    try {
      const res = await axios.get(`/api/animaux/${animal._id}?withAppointments=true`);
      setEditAnimal(res.data);
      setEditAnimalModalOpen(true);
    } catch {
      alert("Impossible de charger l'animal.");
    }
  };

  const handleSaveAnimalModal = async (animalData) => {
    try {
      const clientId = animalData.client?._id || animalData.clientId;
      if (!clientId) {
        alert("Client introuvable pour cet animal.");
        return;
      }
      await axios.put(`/api/animaux/${animalData._id}`, animalData);
      setEditAnimalModalOpen(false);
      setEditAnimal(null);
      fetchAnimaux && fetchAnimaux();
    } catch {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  // onUpdateAppointment doit rafraîchir la liste
  const handleUpdateAppointment = () => {
    // const params = {};
    // if (filters.nom) params.nom = filters.nom;
    // if (filters.espece) params.espece = filters.espece;
    // if (filters.race) params.race = filters.race;
    // if (filters.exclureDecedes) params.exclureDecedes = true;
    // axios.get("/api/animaux", { params }).then(res => setResults(res.data));
  };

  return {
    editAnimal,
    editAnimalModalOpen,
    setEditAnimalModalOpen,
    handleEditAnimal,
    handleSaveAnimalModal,
    handleUpdateAppointment,
  };
}