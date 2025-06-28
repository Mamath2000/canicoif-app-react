import { useState } from "react";
import axios from "axios";

export function useClientForAppointment(selectedAnimal, setSelectedAnimal) {
  const [editClientModalOpen, setEditClientModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);

  const handleEditClient = async () => {
    const client = selectedAnimal?.client;
    if (!client || !client._id) return;
    try {
      const res = await axios.get(`/api/clients/${client._id}?withAnimaux=true&withAppointments=true`);
      setEditClient(res.data);
      setEditClientModalOpen(true);
    } catch {
      alert("Impossible de charger le client.");
    }
  };

  const handleCloseClientEditModal = () => {
    setEditClientModalOpen(false);
    setEditClient(null);
  };

  const handleClientSaved = (updatedClient) => {
    setEditClientModalOpen(false);
    setEditClient(null);
    setSelectedAnimal(prev =>
      prev ? { ...prev, client: updatedClient } : prev
    );
  };

  return {
    editClientModalOpen,
    editClient,
    handleEditClient,
    handleCloseClientEditModal,
    handleClientSaved,
  };
}