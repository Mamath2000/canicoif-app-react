import { useState } from "react";
import { useAnimaux } from "./useAnimaux";

export function useAnimalModalForApp() {
  
  const [showAnimalModal, setshowAnimalModal] = useState(false);
  // const [animalForm, setAnimalForm] = useState(null);
  const [isEditAnimal, setIsEditAnimal] = useState(false);
  
  const {
    animaux,
    animalForm,
    saveAnimal,
    animalAppointments,
    fetchRecentsAnimaux,
    fetchAnimalById,
    setAnimalAppointments,
    setAnimalForm
  } = useAnimaux();
  
  // Ouvre la modale pour ajout ou édition
  const openModal = async (animal = null) => {
    if (animal && animal._id) {
      await fetchAnimalById(animal._id)
      setIsEditAnimal(true);
      setshowAnimalModal(true);
    
    } else {
      setAnimalForm(animal);
      setIsEditAnimal(false);
      setshowAnimalModal(true);
      setAnimalAppointments([]);
    }
  };

  // Ferme la modale et réinitialise les états
  const closeModal = () => {
    setshowAnimalModal(false);
    setAnimalForm(null);
    setIsEditAnimal(false);
    setAnimalAppointments([]);
  };

  // Sauvegarde l'animal
  const handleSaveAnimalModal = async (animalData) => {
    await saveAnimal(animalData);
    fetchRecentsAnimaux();
    closeModal();
  };

  return {
    showAnimalModal,
    animalForm,
    isEditAnimal,
    animalAppointments: animalAppointments?.length ? animalAppointments : [],
    openModal,
    closeModal,
    handleSaveAnimalModal,
    animaux,
    fetchRecentsAnimaux,
    setAnimalForm,
  };
}