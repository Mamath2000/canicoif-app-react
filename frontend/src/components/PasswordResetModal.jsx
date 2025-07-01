import React, { useState } from 'react';
import axios from '../utils/axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function PasswordResetModal({ open, userId, onReset, onLogout, skipTempPassword }) {
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/users/${userId}/reset-password`, skipTempPassword ? { tempPassword: 'SKIP', newPassword } : { tempPassword, newPassword });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onReset();
        onLogout();
      }, 1500);
    } catch (e) {
      setError('Erreur lors de la réinitialisation.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Réinitialisation du mot de passe</DialogTitle>
        <DialogContent>
          {!skipTempPassword && (
            <TextField
              label="Code temporaire reçu"
              value={tempPassword}
              onChange={e => setTempPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
              autoFocus
            />
          )}
          <TextField
            label="Nouveau mot de passe"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 8 }}>Mot de passe réinitialisé !</div>}
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
            Réinitialiser
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
