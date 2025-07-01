import { useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function LoginModal({ open, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || "Erreur de connexion");
      } else {
        onLogin(data.token, data.username, data.role || 'user', data.reset, data.id);
      }
    } catch (e) {
      setError("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Connexion requise</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom d'utilisateur"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            autoFocus
            margin="normal"
            required
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          {error && <div style={{ color: "#b00020", marginTop: 8 }}>{error}</div>}
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Se connecter
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
