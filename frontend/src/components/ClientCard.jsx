import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FaUser } from "react-icons/fa";
import EditIcon from '@mui/icons-material/Edit';

export default function ClientCard({ 
  client, 
  onEdit, 
  style 
}) {
  
  if (!client) return null;

  return (
    <Paper sx={{ p: 2, mb: 2, background: "#f5f5f5", borderRadius: 2, boxShadow: 1 }} style={style}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <FaUser style={{ color: "#1976d2", fontSize: 22 }} />
        <span style={{ fontWeight: 600, fontSize: 18 }}>
          {client.nom} {client.prenom && <span style={{ fontWeight: 400 }}>{client.prenom}</span>}
        </span>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {onEdit && (
            <Button
              size="small"
              onClick={() => onEdit(client)}
              sx={{ minWidth: 0, p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </Button>
          )}
        </Box>
      </Box>
      {client.tel && (
        <div style={{ marginBottom: 4 }}>Téléphone : {client.tel}</div>
      )}
      {client.mobile && (
        <div style={{ marginBottom: 4 }}>Mobile : {client.mobile}</div>
      )}

      {client.commentaire && (
        <div style={{ marginBottom: 4, color: "#666" }}>Commentaire : {client.commentaire}</div>
      )}
    </Paper>
  );
}