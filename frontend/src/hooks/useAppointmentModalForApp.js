import { useState } from "react";
import { useAppointments } from "./useAppointments";

export function useAppointmentModalForApp(fetchRecentsAnimaux, selectedDate) {
  const {
    appointments,
    fetchAppointments,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  const [editAppointmentModalOpen, setEditAppointmentModalOpen] = useState(false);
  const [editAppointmentData, setEditAppointmentData] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Ouvre la modale pour création ou édition
  const openModal = (appointmentData = null, animal = null) => {
    setEditAppointmentData(appointmentData);
    setSelectedAnimal(animal);
    setEditAppointmentModalOpen(true);
  };

  const closeModal = () => {
    setEditAppointmentModalOpen(false);
    setEditAppointmentData(null);
    setSelectedAnimal(null);
  };

  // Handler pour enregistrer un rendez-vous
  const handleSaveAppointment = async (data) => {
    await saveAppointment(data, editAppointmentData, selectedDate);
    closeModal();
  };

  // Handler pour supprimer un rendez-vous
  const handleDeleteAppointment = async (data) => {
    await deleteAppointment(data, selectedDate);
    // Rafraîchir les rendez-vous après suppression
    await fetchAppointments(selectedDate);
    closeModal();
  };

  // Handler pour éditer un rendez-vous (remplace handleEditAppointment)
  const handleEditAppointment = async (appointment) => {
    setEditAppointmentData({
      ...appointment,
      start: appointment.start,
      end: appointment.end,
      title: appointment.title || "",
      animalId: appointment.animalId || null,
      comment: appointment.comment || "",
      tarif: appointment.tarif || null,
    });
    if (fetchRecentsAnimaux) await fetchRecentsAnimaux();
    setEditAppointmentModalOpen(true);
  };

  // Handler pour créer un créneau
  const handleCreateSlot = (slotInfo) => {
    setEditAppointmentData({
      start: slotInfo.start,
      end: slotInfo.end,
      title: "",
      animalId: null,
    });
    setSelectedAnimal(null);
    setEditAppointmentModalOpen(true);
  };

  const handleEventDrop = async (data) => {
    await updateAppointment(data, selectedDate);
    if (fetchRecentsAnimaux) await fetchRecentsAnimaux();
  };

  return {
    appointments,
    editAppointmentModalOpen,
    editAppointmentData,
    selectedAnimal,
    setSelectedAnimal,
    openModal,
    closeModal,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleEditAppointment,
    handleCreateSlot,
    handleEventDrop,
    setEditAppointmentData,
    fetchAppointments,
  };
}