import { useState } from "react";
import { useAnimaux } from "./useAnimaux";

export function useAnimalModal(refreshParents) {
  
  const [showAnimalModal, setshowAnimalModal] = useState(false);
  const [isEditAnimal, setIsEditAnimal] = useState(false);
  
  const {
    editAnimal,
    saveAnimal,
    // animalAppointments,
    fetchAnimalById,
    // setAnimalAppointments,
    setEditAnimal
  } = useAnimaux();
  
  // Ouvre la modale pour ajout ou édition
  const openModal = async (animal = null) => {
    if (animal && animal._id) {
      await fetchAnimalById(animal._id, true, true)
      setIsEditAnimal(true);

      setshowAnimalModal(true);
    
    } else if (animal.clientId) {
      setEditAnimal(animal);
      // setAnimalAppointments([]);
      setIsEditAnimal(false);

      setshowAnimalModal(true);
    }
  };

  // Ferme la modale et réinitialise les états
  const closeModal = () => {
    setshowAnimalModal(false);
    setEditAnimal(null);
    // setAnimalAppointments([]);
    setIsEditAnimal(false);
  };

  // Sauvegarde l'animal
  const handleSaveAnimalModal = async (animalData) => {
    await saveAnimal(animalData);
    refreshParents && await refreshParents();
    closeModal();
  };

  return {
    editAnimal,
    showAnimalModal,
    isEditAnimal,
    // animalAppointments: animalAppointments?.length ? animalAppointments : [],
    openModal,
    closeModal,
    handleSaveAnimalModal,
    setEditAnimal,
  };
}