import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [resetInfo, setResetInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
        if (res.data && res.data.error) {
          setError(res.data.error);
          if (res.data.error.toLowerCase().includes('token')) {
            setTimeout(() => window.location.reload(), 1500);
          }
        } else {
          setError('Réponse inattendue du serveur');
        }
      }
    } catch (e) {
      setError('Erreur lors du chargement des utilisateurs');
      setUsers([]);
    }
    setLoading(false);
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/users', newUser);
      setNewUser({ username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (e) {
      setError('Erreur lors de la création');
    }
  }

  async function handleFlagReset(id) {
    setError('');
    try {
      const res = await axios.post(`/api/users/${id}/flag-reset`);
      setResetInfo({ ...resetInfo, [id]: res.data.tempPassword });
      fetchUsers();
    } catch (e) {
      setError('Erreur lors du flag');
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Gestion des utilisateurs</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleCreateUser} style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <TextField
          label="Nom d'utilisateur"
          value={newUser.username}
          onChange={e => setNewUser({ ...newUser, username: e.target.value })}
          required
          size="small"
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={newUser.password}
          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
          required
          size="small"
        />
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel id="role-label">Rôle</InputLabel>
          <Select
            labelId="role-label"
            value={newUser.role}
            label="Rôle"
            onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          >
            <MenuItem value="user">Utilisateur</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">Créer</Button>
      </form>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <TableContainer component={Paper} style={{ marginTop: 16 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Réinit. demandée</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.map(u => (
                <TableRow key={u._id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.resetFlag ? 'Oui' : 'Non'}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleFlagReset(u._id)} disabled={u.username === 'admin'} size="small" variant="outlined">
                      Réinitialiser mot de passe
                    </Button>
                    {resetInfo[u._id] && (
                      <span style={{ color: 'green', marginLeft: 8 }}>
                        Nouveau code : {resetInfo[u._id]}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
