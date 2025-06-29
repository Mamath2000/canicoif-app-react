import { useState, useEffect } from "react";
import axios from "../utils/axios";

export function useAnimalForAppointment(initial, open) {
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animalAppointments, setAnimalAppointments] = useState([]);
  const [editAnimal, setEditAnimal] = useState(null);
  const [editAnimalModalOpen, setEditAnimalModalOpen] = useState(false);

  // Charger l'animal et son client à l'ouverture ou changement d'initial
  useEffect(() => {
    if (open && initial?.animalId) {
      axios.get(`/api/animaux/${initial.animalId}?withClient=true&withAppointments=true`)
        .then(resAnimal => setSelectedAnimal(resAnimal.data))
        .catch(() => setSelectedAnimal(null));
    } else if (!open) {
      setSelectedAnimal(null);
    }
  }, [open, initial]);

  // Charger les rendez-vous de l'animal à l'ouverture de la modal d'édition d'animal
  useEffect(() => {
    if (editAnimalModalOpen && editAnimal && editAnimal._id) {
      axios.get(`/api/animaux/${editAnimal._id}/appointments`)
        .then(res => setAnimalAppointments(res.data))
        .catch(() => setAnimalAppointments([]));
    } else if (!editAnimalModalOpen) {
      setAnimalAppointments([]);
    }
  }, [editAnimalModalOpen, editAnimal]);

  // Sélection d'un animal depuis la recherche
  const handleAnimalSelected = async (animal, setTitle, setComportement, setComment, setTarif) => {
    if (!animal || !animal._id) {
      setSelectedAnimal(animal);
      return;
    }
    try {
      
      const { data } = await axios.get(`/api/animaux/${animal._id}?withClient=true`);
      setSelectedAnimal(data);
        const clientNom = data.client?.nom || "";
        const race = data.race ? ` - ${data.race}` : "";
      setTitle && setTitle(`${data.nom}${clientNom ? " (" + clientNom + ")" : ""}${race}`);
      setComportement && setComportement(data.comportement || "");
      setComment && setComment(data.activiteDefault || "");
      setTarif && setTarif(data.tarif || "");
    } catch {
      setSelectedAnimal(animal);
    }
  };

  // Gestion de la modal d'édition d'animal
  const handleEditAnimal = (animal) => {
    setEditAnimal(animal);
    setEditAnimalModalOpen(true);
  };

  const handleCloseAnimalModal = () => {
    setEditAnimalModalOpen(false);
    setEditAnimal(null);
  };

  const handleSaveAnimalModal = async (updatedAnimal, setSelectedAnimal) => {
    try {
      let animalId;
      if (updatedAnimal._id) {
        const { data } = await axios.put(`/api/animaux/${updatedAnimal._id}`, updatedAnimal);
        animalId = data._id;
      } else {
        const { data } = await axios.post(`/api/animaux`, updatedAnimal);
        animalId = data._id;
      }
      // Recharge l'animal complet avec le client
      const resAnimal = await axios.get(`/api/animaux/${animalId}?withClient=true`);
      setSelectedAnimal && setSelectedAnimal(resAnimal.data);

      setEditAnimalModalOpen(false);
      setEditAnimal(null);
    } catch (e) {
      alert("Erreur lors de l'enregistrement de l'animal.");
    }
  };

  return {
    selectedAnimal,
    setSelectedAnimal,
    animalAppointments,
    editAnimal,
    editAnimalModalOpen,
    handleAnimalSelected,
    handleEditAnimal,
    handleCloseAnimalModal,
    handleSaveAnimalModal,
  };
}