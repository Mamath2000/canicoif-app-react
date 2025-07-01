import { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import AnimalModal from "./AnimalModal";
import AnimalCard from "./AnimalCard";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useAnimalModal } from "../hooks/useAnimalModal";
import { useClients } from "../hooks/useClients";


const emptyClient = {
  nom: "",
  prenom: "",
  adresse: { rue: "", codePostal: "", ville: "" },
  tel: "",
  mobile: "",
  email: "",
  commentaire: "",
  archive: false,
}

const emptyAnimal = {
  nom: "",
  espece: "",
  dateNaissance: "",
  race: "",
  taille: "",
  couleur: "",
  comportement: "",
  description: "",
  decede: false
};


export default function ClientModal({
  open,
  onClose,
  onSaved,
  client: clientProp,
  animalMode // Ajout de la prop animalMode
}) {

  const [form, setForm] = useState(emptyClient);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const [animalPage, setAnimalPage] = useState(1);

  const ANIMALS_PER_PAGE = 4;

  // Remplit le formulaire si un client est passé en prop
  useEffect(() => {
    if (clientProp) {
      setForm({
        _id: clientProp._id || "",
        nom: clientProp.nom || "",
        prenom: clientProp.prenom || "",
        adresse: {
          rue: clientProp.adresse?.rue || "",
          codePostal: clientProp.adresse?.codePostal || "",
          ville: clientProp.adresse?.ville || "",
        },
        tel: clientProp.tel || "",
        mobile: clientProp.mobile || "",
        email: clientProp.email || "",
        commentaire: clientProp.commentaire || "",
        archive: !!clientProp.archive,
      });
      setClient(clientProp);
    } else {
      setForm(emptyClient);
      setClient(null);
    }
  }, [clientProp, open]);

  useEffect(() => {
    setAnimalPage(1);
  }, [client && client.animaux && client.animaux.length]);

  // Validation simple pour téléphone et email
  const validatePhone = value => /^(\+?\d{1,3}[- ]?)?\d{6,15}$/.test(value) || value === "";
  const validateEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === "";

  const [errors, setErrors] = useState({ tel: "", mobile: "", email: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (["rue", "codePostal", "ville"].includes(name)) {
      setForm(f => ({ ...f, adresse: { ...f.adresse, [name]: value } }));
    } else if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    if (name === "tel" || name === "mobile") {
      setErrors(errs => ({
        ...errs,
        [name]: validatePhone(value) ? "" : "Numéro invalide"
      }));
    }
    if (name === "email") {
      setErrors(errs => ({
        ...errs,
        email: validateEmail(value) ? "" : "Email invalide"
      }));
    }
  };

  const refreshClient = async () => {
    if (client && client._id) {
      const data = await fetchClientById(client._id, true, true);
      setClient(data);
    }
  }
  const {
    showAnimalModal,
    editAnimal,
    setEditAnimal,
    isEditAnimal,
    animalAppointments,
    openModal: openAnimalModal,
    closeModal: closeAnimalModal,
    handleSaveAnimalModal,
  } = useAnimalModal(refreshClient);

  const {
    fetchClientById
  } = useClients();

  // Exemple pour charger les rendez-vous lors de l’édition
  const handleEditAnimal = async (animal) => {
    setEditAnimal(animal);
    openAnimalModal(animal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      (!validatePhone(form.tel) && form.tel) ||
      (!validatePhone(form.mobile) && form.mobile) ||
      (!validateEmail(form.email) && form.email)
    ) {
      setError("Veuillez corriger les champs invalides.");
      setLoading(false);
      return;
    }

    if (client && client._id) {
      onSaved && await onSaved(form);
      onClose();
    } else {
      const newClient = onSaved && onSaved(form);
      setClient(newClient); // Passe en mode édition
      setEditAnimal(emptyAnimal);
    }

    setLoading(false);
  };

  const animaux = client && client.animaux ? [...client.animaux] : [];
  animaux.sort((a, b) => {
    if (a.decede && !b.decede) return 1;
    if (!a.decede && b.decede) return -1;
    if (!a.dateNaissance && b.dateNaissance) return 1;
    if (a.dateNaissance && !b.dateNaissance) return -1;
    if (!a.dateNaissance && !b.dateNaissance) return 0;
    return new Date(a.dateNaissance) - new Date(b.dateNaissance);
  });

  const totalPages = Math.ceil(animaux.length / ANIMALS_PER_PAGE);
  const paginatedAnimaux = animaux.slice(
    (animalPage - 1) * ANIMALS_PER_PAGE,
    animalPage * ANIMALS_PER_PAGE
  );

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {client && client._id ? "Modifier le client" : "Nouveau client"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Infos client sur toute la largeur */}
          <Box sx={{ width: "100%", mb: 2 }}>
            {/* Ligne 1 */}
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                label="Nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                required
                sx={{ flex: 2 }}
              />
              <TextField
                label="Prénom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Téléphone"
                name="tel"
                value={form.tel}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                error={!!errors.tel}
                helperText={errors.tel}
                inputProps={{ inputMode: "tel", pattern: "[0-9 +\\-]*" }}
                sx={{ flex: 1.5 }}
              />
              <TextField
                label="Mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                error={!!errors.mobile}
                helperText={errors.mobile}
                inputProps={{ inputMode: "tel", pattern: "[0-9 +\\-]*" }}
                sx={{ flex: 1.5 }}
              />
            </Box>
            {/* Ligne 2 */}
            <Box sx={{ mb: 1, display: "flex", alignItems: "center" }}>
              <TextField
                label="Commentaire"
                name="commentaire"
                value={form.commentaire}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                multiline
                minRows={1}
                maxRows={2}
                sx={{ flex: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="archive"
                    checked={!!form.archive}
                    onChange={handleChange}
                    color="warning"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                }
                label="Archiver"
                sx={{ ml: 2, userSelect: "none" }}
              />
            </Box>
            {/* Ligne 3 */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                error={!!errors.email}
                helperText={errors.email}
                type="email"
                sx={{ flex: 3 }}
              />
              <TextField
                label="Rue"
                name="rue"
                value={form.adresse.rue}
                onChange={handleChange}
                fullWidth
                margin="dense"
                size="small"
                sx={{ flex: 3 }}
              />
              <TextField
                label="Code postal"
                name="codePostal"
                value={form.adresse.codePostal}
                onChange={handleChange}
                margin="dense"
                fullWidth
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Ville"
                name="ville"
                value={form.adresse.ville}
                onChange={handleChange}
                margin="dense"
                fullWidth
                size="small"
                sx={{ flex: 2 }}
              />
            </Box>
          </Box>

          {/* Gestion des animaux sur toute la largeur */}
          <Box sx={{ width: "100%", mt: 2 }}>
            <Box sx={{ minHeight: 120, pr: 1 }}>
              {paginatedAnimaux.length > 0 ? (
                paginatedAnimaux.map(animal => (
                  <AnimalCard
                    key={animal._id}
                    animal={animal}
                    onEdit={handleEditAnimal}
                    showLastAppointments={true}
                    appointments={animal.appointments || []}
                    style={{ marginBottom: 6, minHeight: 50 }}
                  />
                ))
              ) : (
                <div style={{ color: "#888", fontStyle: "italic", fontSize: 13 }}>Aucun animal</div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
                  <Button
                    size="small"
                    disabled={animalPage === 1}
                    onClick={() => setAnimalPage(animalPage - 1)}
                  >
                    Précédent
                  </Button>
                  <span style={{ margin: "0 8px", alignSelf: "center", fontSize: 13 }}>
                    Page {animalPage} / {totalPages}
                  </span>
                  <Button
                    size="small"
                    disabled={animalPage === totalPages}
                    onClick={() => setAnimalPage(animalPage + 1)}
                  >
                    Suivant
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
          {error && <div style={{ color: "red", fontSize: 13 }}>{error}</div>}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, justifyContent: "space-between" }}>
          {/* Ajout d'un animal à gauche */}
          {client && client._id ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => { openAnimalModal({ ...emptyAnimal, clientId: client._id }); }}
              sx={{ textTransform: "none" }}
            >
              + Ajout d'un animal
            </Button>
          ) : <span />}

          {/* Boutons classiques à droite */}
          <Box>
            <Button onClick={onClose} size="small" sx={{ mr: 1 }}>Annuler</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (animalMode && animaux.length === 0 && client && client._id)}
              size="small"
            >
              {client && client._id ? "Enregistrer" : "Créer"}
            </Button>
          </Box>
        </DialogActions>
      </form>

      {/* Dialog pour ajout/édition d'animal */}
      <AnimalModal
        open={showAnimalModal}
        onClose={closeAnimalModal}
        onSaved={handleSaveAnimalModal}
        editAnimal={editAnimal}
        isEditAnimal={isEditAnimal}
        animalAppointments={animalAppointments}
      />
    </Dialog>
  );
}