import { useState } from "react";
import { useClients } from "./useClients";

export function useClientModal(refreshParents) {

    const [showClientModal, setShowClientModal] = useState(false);

    const {
    editClient,
    setEditClient,
    saveClient,
    fetchClientById,
    } = useClients();

    const openModal = async (client = null) => {
        if (!client || !client._id) {
            setEditClient(null);
            setShowClientModal(true);
        } else {
            await fetchClientById(client._id, true, true)
            setShowClientModal(true);
        }

    };

    // Ferme la modale et réinitialise les états
    const closeModal = () => {
        setShowClientModal(false);
        setEditClient(null);
    };

    const handleSaveClient = async (clientData) => {
        await saveClient(clientData);
        refreshParents && await refreshParents();
    };

    return {
        editClient,
        showClientModal,
        setShowClientModal,
        openModal,
        closeModal,
        handleSaveClient,
    };
}