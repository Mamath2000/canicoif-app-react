import { useState } from "react";
// import axios from "../utils/axios";
import { useAnimaux } from "./useAnimaux";

export function useAnimalForAnimalSearch(fetchAnimaux) {
  // const [editAnimal, setEditAnimal] = useState(null);
  const [editAnimalModalOpen, setEditAnimalModalOpen] = useState(false);


  const {
    animaux,
    animalForm,
    animalAppointments,
    saveAnimal,
    fetchAnimalAppointments,
    fetchRecentsAnimaux,
    fetchAnimalById,
    setAnimalAppointments,
    setAnimalForm
  } = useAnimaux();
  
  const handleEditAnimal = async (animal) => {
    if (animal && animal._id) {
      const res = await fetchAnimalById(animal._id)
      setAnimalForm(res.data);
      setEditAnimalModalOpen(true);
    }
  };

  const handleSaveAnimalModal = async (animalData) => {
    await saveAnimal(animalData);
    setEditAnimalModalOpen(false);
    setAnimalForm(null);
    fetchAnimaux && fetchAnimaux();
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
    animalForm,
    editAnimalModalOpen,
    setEditAnimalModalOpen,
    handleEditAnimal,
    handleSaveAnimalModal,
    handleUpdateAppointment,
  };
}