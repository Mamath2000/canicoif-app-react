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
import AnimalModal from "./AnimalModal";
import ClientModal from "./ClientModal";
import { LiaPenSolid } from "react-icons/lia";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FaDog, FaCat, FaBookDead } from "react-icons/fa";
import { GiPig } from "react-icons/gi";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import especeOptions from "../data/espece.json";
import { MdPets } from "react-icons/md";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { getComportementColors } from "../utils/comportementColors";
import { useAnimalForAnimalSearch } from "../hooks/useAnimalForAnimalSearch";
import { useClientForSearch } from "../hooks/useClientForSearch"; 
import ArchiveIcon from '@mui/icons-material/Archive';

export default function AnimalSearchModal({ open, onClose, onAnimalSelected, selectionMode }) {
  const [filters, setFilters] = useState({ nom: "", espece: "", race: "", exclureDecedes: true, exclureClientsArchives: true });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchAnimaux();
  }, [filters, open]);

  const fetchAnimaux = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.nom) params.nom = filters.nom;
      if (filters.espece) params.espece = filters.espece;
      if (filters.race) params.race = filters.race;
      if (filters.exclureDecedes) params.exclureDecedes = true;
      if (filters.exclureClientsArchives) params.exclureClientsArchives = true;
      const res = await axios.get("/api/animaux", { params });
      setResults(res.data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (e) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.checked }));
  };

  const {
    editAnimal,
    editAnimalModalOpen,
    setEditAnimalModalOpen,
    handleEditAnimal,
    handleSaveAnimalModal,
    handleUpdateAppointment,
  } = useAnimalForAnimalSearch(fetchAnimaux);

  const {
    editClient,
    editClientModalOpen,
    setEditClientModalOpen,
    handleEditClient,
    handleSaveClientModal,
} = useClientForSearch(fetchAnimaux);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>Recherche animal</DialogTitle>
        <DialogContent>
          <div style={{ height: 16 }} />
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            flexWrap: "wrap"
          }}>
            <TextField
              name="nom"
              label="Nom"
              value={filters.nom}
              onChange={handleChange}
              size="small"
              fullWidth
              sx={{ maxWidth: 180 }}
            />
            <Select
              name="espece"
              value={filters.espece}
              onChange={handleChange}
              size="small"
              displayEmpty
              sx={{ minWidth: 120, maxWidth: 160 }}
            >
              <MenuItem value="">Toutes espèces</MenuItem>
              {especeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
            <TextField
              name="race"
              label="Race"
              value={filters.race}
              onChange={handleChange}
              size="small"
              fullWidth
              sx={{ maxWidth: 180 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.exclureDecedes}
                  onChange={handleCheckboxChange}
                  name="exclureDecedes"
                  color="primary"
                />
              }
              label="Exclure les animaux décédés"
              sx={{ marginLeft: 1, marginRight: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.exclureClientsArchives}
                  onChange={handleCheckboxChange}
                  name="exclureClientsArchives"
                  color="primary"
                />
              }
              label="Exclure les clients archivés"
              sx={{ marginLeft: 1, marginRight: 0 }}
            />
          </div>
          <div style={{ marginTop: 8, minHeight: 80 }}>
            {loading && <div>Recherche...</div>}
            {!loading && results.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Icône</TableCell>
                      <TableCell>Nom</TableCell>
                      <TableCell>Caractéristiques</TableCell>
                      <TableCell>Comportement</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results
                      .slice() // pour ne pas muter l'état
                      .sort((a, b) => (a.nom || "").localeCompare(b.nom || ""))
                      .map(animal => (
                        <TableRow key={animal._id}>
                          <TableCell align="center">
                            {animal.espece === "chien" ? (
                              <FaDog style={{ color: "#795548", fontSize: 22 }} />
                            ) : animal.espece === "chat" ? (
                              <FaCat style={{ color: "#616161", fontSize: 22 }} />
                            ) : animal.espece === "nac" ? (
                              <GiPig style={{ color: "#8d6e63", fontSize: 22 }} />
                            ) : (
                              <HelpOutlineIcon fontSize="small" sx={{ color: "#aaa" }} />
                            )}
                            {animal.decede && (
                              <FaBookDead style={{ color: "red", marginLeft: 8, fontSize: 18 }} title="Décédé" />
                            )}
                          </TableCell>
                          <TableCell>
                            <span style={{ fontWeight: "bold" }}>{animal.nom}</span>
                          </TableCell>
                          <TableCell>
                            {[animal.race, animal.taille, animal.couleur].filter(Boolean).join(", ")}
                          </TableCell>
                          <TableCell>
                            {animal.comportement && (
                              <span
                                style={{
                                  ...getComportementColors(animal.comportement),
                                  borderRadius: 12,
                                  padding: "2px 10px",
                                  fontWeight: 600,
                                  fontSize: "0.95em",
                                  marginLeft: 8,
                                  display: "inline-block",
                                }}
                              >
                                {animal.comportement}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {animal.client
                              ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {animal.client.nom} {animal.client.prenom || ""}
                                  {animal.client.archive && (
                                    <ArchiveIcon fontSize="small" sx={{ color: "#bfa100", ml: 0.5 }} titleAccess="Archivé" />
                                  )}
                                </span>
                              : ""}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="text"
                              sx={{ minWidth: 0, mr: 1 }}
                              onClick={() => handleEditAnimal(animal)}
                            >
                              <MdPets size={20} />
                            </Button>
                            <Button
                              size="small"
                              variant="text"
                              sx={{ minWidth: 0 }}
                              onClick={() => handleEditClient(animal.client)}
                              disabled={!animal.client}
                            >
                              <LiaPenSolid size={20} />
                            </Button>
                            {selectionMode && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => onAnimalSelected && onAnimalSelected(animal) && onClose()}
                              >
                                Sélectionner
                              </Button>
                            )}
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

      {editAnimal && (
        <AnimalModal
          open={editAnimalModalOpen}
          onClose={() => setEditAnimalModalOpen(false)}
          animalForm={editAnimal}
          animalAppointments={editAnimal.appointments || []}
          onSave={handleSaveAnimalModal}
          isEditAnimal={true}
          onUpdateAppointment={handleUpdateAppointment}
        />
      )}

      {editClient && (
        <ClientModal
          open={editClientModalOpen}
          onClose={() => setEditClientModalOpen(false)}
          client={editClient}
          onSaved={handleSaveClientModal}
        />
      )}
    </>
  );
}