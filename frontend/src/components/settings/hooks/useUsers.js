import { useState } from "react";
import axios from "../../../utils/axios";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [resetInfo, setResetInfo] = useState({});

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
                if (response.data && response.data.error) {
                    setError(response.data.error);
                    if (response.data.error.toLowerCase().includes('token')) {
                        setTimeout(() => window.location.reload(), 1500);
                    }
                } else {
                    setError('Réponse inattendue du serveur');
                }
            }
        } catch (error) {
            setError('Erreur lors du chargement des utilisateurs');
            setUsers([]);
        }
    };

    const createUser = async (userData) => {
        try {
            const response = await axios.post('/api/users', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la création de l\'utilisateur');
        }
    };

    const resetFlag = async (userId) => {
        try {
            console.log('Resetting flag for user:', userId);
            const response = await axios.post(`/api/users/${userId}/flag-reset`);
            console.log('Response from resetFlag:', response);
            setResetInfo({ ...resetInfo, [userId]: response.data.tempPassword }); // Fixed variable name
            return response.data.tempPassword;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe');
        }
    };

    const deleteUser = async (userId) => {
        try {
            await axios.delete(`/api/users/${userId}`);
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur');
        }
    };

  return {
    users,
    resetInfo,
    createUser,
    resetFlag,
    fetchUsers,
    deleteUser,
    error,
    setError,
  };
}