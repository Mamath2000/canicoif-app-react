import { useState } from "react";
import axios from "../utils/axios";

export function useClients() {

    const [editClient, setEditClient] = useState(null);
    const [clients, setClients] = useState([]); // Pour stocker la liste des clients

  const searchClients = async (filters) => {
    try {
        const params = {};
        if (filters.nom) params.nom = filters.nom;
        if (filters.animal) params.animal = filters.animal;
        if (filters.tel) params.tel = filters.tel;
        // On envoie le paramètre exclureArchives (comme exclureClientsArchives côté animal)
        const res = await axios.get("/api/clients", { params: { ...params, withAnimaux: true, exclureArchives: filters.exclureArchives } });

        setClients(res.data);
      } catch {
        setClients([]);
      }
  }


  // Ajoute ou modifie un Client
  const saveClient = async (clientData) => {
    let res;
    if (clientData._id) {
      res = await axios.put(`/api/clients/${clientData._id}`, clientData);
    } else {
      res = await axios.post(`/api/clients`, clientData);
    }
    setEditClient(res.data);
    // await fetchClientById(res.data._id);
  };

  const fetchClientById = async (clientId, withAnimaux = false, withAppointments = false) => {
    if (!clientId) return null;
    try {
      const params = {
        withAnimaux,
        withAppointments,
      };
      const res = await axios.get(`/api/clients/${clientId}`, { params });
      setEditClient(res.data);
      return res.data;

    } catch (error) {
      console.error("Erreur lors de la récupération de l'Client :", error);
      setEditClient([]);
      return null;
    }
  };
  
  return {
    editClient,
    clients,
    setEditClient,
    saveClient,
    fetchClientById,
    searchClients,
  };
}