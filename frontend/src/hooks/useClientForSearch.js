import { useState } from "react";
import axios from "axios";

export function useClientForSearch(fetchAnimaux) {
    const [editClient, setEditClient] = useState(null);
    const [editClientModalOpen, setEditClientModalOpen] = useState(false);

    const handleEditClient = async (client) => {
        if (!client || !client._id) return;
        try {
            const res = await axios.get(`/api/clients/${client._id}`, {
                params: { withAnimaux: true, withAppointments: true }
            });
            setEditClient(res.data);
            setEditClientModalOpen(true);
        } catch {
            alert("Impossible de charger le client.");
        }
    };

    const handleSaveClientModal = async (clientData) => {
        try {
            await axios.put(`/api/clients/${clientData._id}`, clientData);
            setEditClientModalOpen(false);
            setEditClient(null);
            fetchAnimaux && fetchAnimaux();

        } catch {
            alert("Erreur lors de l'enregistrement du client.");
        }
    };

    return {
        editClient,
        editClientModalOpen,
        setEditClientModalOpen,
        handleEditClient,
        handleSaveClientModal,
    };
}