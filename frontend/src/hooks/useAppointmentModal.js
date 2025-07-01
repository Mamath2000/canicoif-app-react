import { useState } from "react";
import { useAppointments } from "./useAppointments";

export function useAppointmentModal(refreshParents) {
  const {
    editAppointment,
    setEditAppointment,

    saveAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // // Ouvre la modale pour création ou édition
  // const openModal = (appointmentData = null) => {
  //   setEditAppointment(appointmentData);
  //   // setSelectedAnimal(animal);
  //   setShowAppointmentModal(true);
  // };

  const closeModal = () => {
    setShowAppointmentModal(false);
    setEditAppointment(null);
    // setSelectedAnimal(null);
  };

  // Handler pour enregistrer un rendez-vous
  const handleSaveAppointment = async (data) => {
    await saveAppointment(data);
    refreshParents && await refreshParents();

    closeModal();
  };

  // Handler pour supprimer un rendez-vous
  const handleDeleteAppointment = async (data) => {
    await deleteAppointment(data);
    refreshParents && await refreshParents();
    closeModal();
  };

  // Handler pour éditer un rendez-vous (remplace handleEditAppointment)
  const handleEditAppointment = async (appointment) => {
    setEditAppointment({
      ...appointment,
      start: appointment.start,
      end: appointment.end,
      title: appointment.title || "",
      animalId: appointment.animalId || null,
      comment: appointment.comment || "",
      tarif: appointment.tarif || null,
    });
    setShowAppointmentModal(true);
  };

  // Handler pour créer un créneau
  const handleCreateSlot = async (slotInfo) => {
    setEditAppointment({
      start: slotInfo.start,
      end: slotInfo.end,
      title: "",
      animalId: null,
    });
    setShowAppointmentModal(true);
  };

  const handleEventDrop = async (data) => {
    await updateAppointment(data);
    refreshParents && await refreshParents();
  };

  return {
    showAppointmentModal,
    editAppointment,
    // openModal,
    closeModal,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleEditAppointment,
    handleCreateSlot,
    handleEventDrop,
    setEditAppointment,
  };
}