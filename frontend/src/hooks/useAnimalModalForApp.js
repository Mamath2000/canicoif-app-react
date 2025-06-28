import { useState } from "react";
import { useAnimaux } from "./useAnimaux";

export function useAnimalModalForApp() {
  const {
    saveAnimal,
    fetchAnimalAppointments,
    animaux,
    fetchRecentsAnimaux,
    animalAppointments,
    setAnimalAppointments,
  } = useAnimaux();

  const [openAddAnimalModal, setOpenAddAnimalModal] = useState(false);
  const [animalForm, setAnimalForm] = useState(null);
  const [isEditAnimal, setIsEditAnimal] = useState(false);

  // Ouvre la modale pour ajout ou édition
  const openModal = (animal = null) => {
    setAnimalForm(animal);
    setIsEditAnimal(!!animal);
    setOpenAddAnimalModal(true);
    fetchAnimalAppointments(animal?._id);
  };

  // Ferme la modale et réinitialise les états
  const closeModal = () => {
    setOpenAddAnimalModal(false);
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
    openAddAnimalModal,
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