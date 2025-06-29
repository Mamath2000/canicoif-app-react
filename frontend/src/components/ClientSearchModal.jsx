import { useState, useEffect } from "react";
import axios from "../utils/axios";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import ClientModal from './ClientModal';
import { LiaPenSolid } from "react-icons/lia";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArchiveIcon from '@mui/icons-material/Archive';

import { useClientForSearch } from "../hooks/useClientForSearch"; 

export default function ClientSearchModal({ open, onClose }) {
  // Par défaut, on exclut les archivés (comme dans recherche animal)
  const [filters, setFilters] = useState({ nom: "", animal: "", tel: "", exclureArchives: true });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [editClient, setEditClient] = useState(null);
  // const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchClients = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.nom) params.nom = filters.nom;
        if (filters.animal) params.animal = filters.animal;
        if (filters.tel) params.tel = filters.tel;
        // On envoie le paramètre exclureArchives (comme exclureClientsArchives côté animal)
        const res = await axios.get("/api/clients", { params: { ...params, withAnimaux: true, exclureArchives: filters.exclureArchives } });
      console.log(res.data); // <--- ici

        setResults(res.data);
      } catch {
        setResults([]);
      }
      setLoading(false);
    };
    fetchClients();
  }, [filters, open]);

  const handleChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Gestion de la case à cocher pour exclure les archivés (logique inversée)
  const handleExclureArchivesChange = (e) => {
    setFilters(f => ({ ...f, exclureArchives: e.target.checked }));
  };

  // const handleEditClient = (client) => {
  //   setEditClient(client);
  //   setEditModalOpen(true);
  // };

  // const handleCloseEditModal = () => {
  //   setEditModalOpen(false);
  //   setEditClient(null);
  // };

  // const handleClientSaved = () => {
  //   setEditModalOpen(false);
  //   setEditClient(null);
  //   setFilters({ ...filters }); // force le useEffect à relancer la recherche
  // };

  const {
    editClient,
    editClientModalOpen,
    setEditClientModalOpen,
    handleEditClient,
    handleSaveClientModal,
} = useClientForSearch();


  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>Recherche client</DialogTitle>
        <DialogContent>
          <div style={{ height: 16 }} />
          <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 4,
              flexWrap: "wrap" }}>
            <TextField
              name="nom"
              label="Nom du client"
              value={filters.nom}
              onChange={handleChange}
              autoFocus
              size="small"
              fullWidth
              sx={{ maxWidth: 180 }}
            />
            <TextField
              name="animal"
              label="Nom de l'animal"
              value={filters.animal}
              onChange={handleChange}
              size="small"
              fullWidth
              sx={{ minWidth: 120, maxWidth: 160 }}
            />
            <TextField
              name="tel"
              label="Téléphone (fixe ou mobile)"
              value={filters.tel}
              onChange={handleChange}
              size="small"
              fullWidth
              sx={{ maxWidth: 180 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.exclureArchives}
                  onChange={e => setFilters(f => ({ ...f, exclureArchives: e.target.checked }))}
                  color="warning"
                  size="small"
                />
              }
              label="Exclure les clients archivés"
              sx={{ ml: 1 }}
            />
          </div>
          <div style={{ marginBottom: 12, width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <Link
              component="button"
              variant="body2"
              underline="hover"
              onClick={() => setAddModalOpen(true)}
              sx={{ pr: 0 }}
            >
              Ajouter un nouveau client
            </Link>
          </div>
          <div style={{ marginTop: 8, minHeight: 80 }}>
            {loading && <div>Recherche...</div>}
            {!loading && results.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 120 }}>Nom</TableCell>
                      <TableCell sx={{ width: 120 }}>Prénom</TableCell>
                      <TableCell sx={{ width: 110 }}>Téléphone</TableCell>
                      <TableCell sx={{ width: 110 }}>Mobile</TableCell>
                      <TableCell sx={{ width: 180 }}>Animaux</TableCell>
                      <TableCell align="center" sx={{ width: 90 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map(client => (
                      <TableRow key={client._id}>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 0.5 }}>
                          {client.nom}
                          {client.archive && (
                            <ArchiveIcon fontSize="small" sx={{ color: "#bfa100", ml: 0.5 }} titleAccess="Archivé" />
                          )}
                        </TableCell>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.prenom}</TableCell>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {client.tel || ""}
                        </TableCell>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {client.mobile || ""}
                        </TableCell>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {(client.animaux && client.animaux.length > 0)
                            ? client.animaux
                                .filter(a => !a.decede)
                                .map(a => a.nom)
                                .filter(Boolean)
                                .join(", ")
                            : ""}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="text"
                            sx={{ minWidth: 0 }}
                            onClick={() => handleEditClient(client)}
                          >
                            <LiaPenSolid size={20} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {!loading && results.length === 0 && <div>Aucun résultat</div>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
      {/* Modale de modification du client */}
      <ClientModal
        open={editClientModalOpen}
        onClose={() => setEditClientModalOpen(false)}
        onSaved={handleSaveClientModal}
        client={editClient}
      />
      {/* Modale d'ajout d'un client */}
      <ClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSaved={() => {
          setAddModalOpen(false);
          setFilters({ ...filters });
        }}
        client={null}
      />
    </>
  );
}

