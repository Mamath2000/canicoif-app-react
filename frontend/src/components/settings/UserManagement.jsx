import { useEffect, useState } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useUsers } from "./hooks/useUsers";

const emptyUser = { username: '', password: '', role: 'user' };

export default function UserManagement() {
  const [newUser, setNewUser] = useState(emptyUser);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null });

  const {
    users,
    resetInfo,
    fetchUsers,
    createUser,
    resetFlag,
    deleteUser,
    error,
    setError,
  } = useUsers();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    await createUser(newUser);
    await fetchUsers();
  }

  async function handleFlagReset(id) {
    setError('');
    await resetFlag(id);
    await fetchUsers();
  }

  async function handleDeleteUser(id) {
    setConfirmDialog({
      open: true,
      onConfirm: async () => {
        try {
          await deleteUser(id);
          await fetchUsers();
        } catch (error) {
          setError('Erreur lors de la suppression de l\'utilisateur');
        } finally {
          setConfirmDialog({ open: false, onConfirm: null });
        }
      },
    });
  }

  return (
    <div style={{ maxWidth: 900, minWidth: 700, margin: 'auto' }}>
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
      <TableContainer component={Paper} style={{ marginTop: 16 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Réinit. demandée</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.map(u => (
              <TableRow key={u._id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.resetFlag ? 'Oui' : 'Non'}</TableCell>
                <TableCell align="right">
                  {u.username !== 'admin' && (
                    <Button
                      onClick={() => handleFlagReset(u._id)}
                      size="small"
                      variant="outlined"
                    >
                      Réinit. mot de passe
                    </Button>
                  )}
                  {u.username !== 'admin' && resetInfo[u._id] && (
                    <span style={{ color: 'green', marginLeft: 8 }}>
                      Nouveau code : {resetInfo[u._id]}
                    </span>
                  )}
                  {u.username !== 'admin' && (
                    <Button
                      onClick={() => handleDeleteUser(u._id)}
                      size="small"
                      variant="contained"
                      color="secondary"
                      style={{ marginLeft: 8 }}
                    >
                      Supprimer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
    </div>
  );
}

export function ConfirmDialog({ confirmDialog, setConfirmDialog }) {
  return (
    <Dialog
      open={confirmDialog.open}
      onClose={() => setConfirmDialog({ open: false, onConfirm: null })}
    >
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDialog({ open: false, onConfirm: null })} color="primary">
          Annuler
        </Button>
        <Button
          onClick={() => {
            if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          }}
          color="secondary"
          variant="contained"
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
}