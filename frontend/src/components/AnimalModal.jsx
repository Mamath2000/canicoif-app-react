import { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import ESPECES from '../data/espece.json';
import TAILLES from '../data/taille.json';
import COMPORTEMENTS from '../data/comportement.json';

const emptyAnimal = {
  nom: "",
  espece: "",
  dateNaissance: "",
  race: "",
  taille: "",
  couleur: "",
  comportement: "",
  activiteDefault: "",
  tarif: "",
  decede: false
};

export default function AnimalModal({
  open,
  onClose,
  onSave,
  animalForm,
  isEditAnimal,
  animalAppointments = [],
  onUpdateAppointment
}) {
  const [form, setForm] = useState(emptyAnimal);

  useEffect(() => {
    // On ne met à jour le form que si open passe à true
    if (open) {
      setForm(animalForm ? { ...emptyAnimal, ...animalForm } : emptyAnimal);
    }
    // eslint-disable-next-line
  }, [open, animalForm]);

  
  useEffect(() => {
    setAppointmentEdits(
      (animalAppointments || [])
        .sort((a, b) => new Date(b.start) - new Date(a.start))
        .map(appointment => ({
          ...appointment,
          comment: appointment.comment || "",
          tarif: appointment.tarif || ""
        }))
    );
  }, [animalAppointments, open]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.espece) {
      return;
    }

    // Détecte les rendez-vous modifiés
    const appointmentToUpdate = appointmentEdits.filter((edit, idx) => {
      const original = animalAppointments[idx];
      return (
        original &&
        (edit.comment !== original.comment || String(edit.tarif) !== String(original.tarif))
      );
    });

    // Met à jour les rendez-vous modifiés
    for (const appointment of appointmentToUpdate) {
      try {
        await fetch(`/api/appointments/${appointment._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: appointment.comment, tarif: appointment.tarif }),
        });
        onUpdateAppointment && onUpdateAppointment(appointment);

      } catch (err) {
        alert("Erreur lors de la sauvegarde d'un rendez-vous.");
      }
    }

    // Enregistre l'animal (envoie le champ tarif)
    onSave && onSave({ ...form, tarif: form.tarif ? Number(form.tarif) : null });
  };

  // Pour gérer l'édition locale des rendez-vous
  const [appointmentEdits, setAppointmentEdits] = useState([]);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const APPOINTMENTS_PER_PAGE = 6;
  const [appointmentsTotal, setAppointmentsTotal] = useState(animalAppointments.length);

  useEffect(() => {
    setAppointmentsPage(1);
    setAppointmentsTotal(animalAppointments.length);
  }, [animalAppointments, open]);

  // Pagination des rendez-vous
  const paginatedAppointments = appointmentEdits.slice(
    (appointmentsPage - 1) * APPOINTMENTS_PER_PAGE,
    appointmentsPage * APPOINTMENTS_PER_PAGE
  );

  const handleAppointmentChange = (idx, field, value) => {
    setAppointmentEdits(appointmentEdits =>
      appointmentEdits.map((appointment, i) =>
        i === idx ? { ...appointment, [field]: value } : appointment
      )
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={isEditAnimal ? "lg" : "sm"}
      fullWidth
      disableEnforceFocus
    >
      <DialogTitle>{isEditAnimal ? "Modifier l'animal" : "Ajouter un animal"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex" }}>
            {/* Colonne gauche : formulaire */}
            <Box sx={{ flex: 1, pr: 2 }}>
              {/* Ligne 1 : Nom et Espèce */}
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  label="Nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  size="small"
                  required
                  sx={{ flex: 3 }}
                />
                <TextField
                  select
                  label="Espèce"
                  name="espece"
                  value={form.espece || ""}
                  onChange={handleChange}
                  size="small"
                  required
                  sx={{ width: 140 }}
                >
                  {ESPECES.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Box>
              {/* Ligne 2 : Description (simple ligne) + Tarif */}
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  label="Activité / Description"
                  name="activiteDefault"
                  value={form.activiteDefault || ""}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  sx={{ flex: 3 }}
                  inputProps={{ maxLength: 80 }}
                />
                <TextField
                  label="Tarif (€)"
                  name="tarif"
                  type="number"
                  value={form.tarif || ""}
                  onChange={handleChange}
                  size="small"
                  sx={{ width: 140 }}
                />
              </Box>
              {/* Ligne 3 : Race, Taille, Couleur */}
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  label="Race"
                  name="race"
                  value={form.race || ""}
                  onChange={handleChange}
                  size="small"
                  sx={{ flex: 2, minWidth: 100 }}
                />
                <TextField
                  select
                  label="Taille"
                  name="taille"
                  value={form.taille || ""}
                  onChange={handleChange}
                  size="small"
                  sx={{ flex: 1, minWidth: 80 }}
                >
                  {TAILLES.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Couleur"
                  name="couleur"
                  value={form.couleur || ""}
                  onChange={handleChange}
                  size="small"
                  sx={{ flex: 2, minWidth: 100 }}
                />
              </Box>
              {/* Ligne 4 : Comportement */}
              <TextField
                select
                label="Comportement"
                name="comportement"
                value={form.comportement || ""}
                onChange={handleChange}
                size="small"
                sx={{ mt: 1, minWidth: 120 }}
                fullWidth
              >
                {COMPORTEMENTS.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
              {/* Ligne 5 : Date de naissance et Décédé */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                <TextField
                  label="Date de naissance"
                  name="dateNaissance"
                  type="date"
                  value={form.dateNaissance ? form.dateNaissance.slice(0, 10) : ""}
                  onChange={handleChange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <label style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    name="decede"
                    checked={!!form.decede}
                    onChange={handleChange}
                    style={{ marginRight: 4 }}
                  />
                  Décédé
                </label>
              </Box>
            </Box>
            {/* Colonne droite : rendez-vous (affichée seulement en édition) */}
            {isEditAnimal && (
              <Box sx={{ flex: 1, pl: 2, borderLeft: "1px solid #eee", minHeight: 320, display: "flex", alignItems: "flex-start", justifyContent: "flex-start", flexDirection: "column" }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Rendez-vous de l'animal</div>
                {paginatedAppointments.length === 0 ? (
                  <span style={{ color: "#bbb" }}>Aucun rendez-vous</span>
                ) : (
                  paginatedAppointments.map((appointment, idx) => {
                    const globalIdx = (appointmentsPage - 1) * APPOINTMENTS_PER_PAGE + idx;
                    return (
                      <Box key={appointment._id || globalIdx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, width: "100%" }}>
                        <TextField
                          label="Date"
                          value={appointment.start ? new Date(appointment.start).toLocaleDateString("fr-FR") : ""}
                          size="small"
                          InputProps={{ readOnly: true }}
                          sx={{ width: 110 }}
                        />
                        <TextField
                          label="Activité"
                          value={appointment.comment || ""}
                          onChange={e => handleAppointmentChange(globalIdx, "comment", e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ flex: 3 }}
                          inputProps={{ maxLength: 80 }}
                        />
                        <TextField
                          label="Tarif (€)"
                          type="number"
                          value={appointment.tarif}
                          onChange={e => handleAppointmentChange(globalIdx, "tarif", e.target.value)}
                          size="small"
                          sx={{ width: 90 }}
                        />
                      </Box>
                    );
                  })
                )}
                {/* Pagination */}
                {appointmentEdits.length > APPOINTMENTS_PER_PAGE && (
                  <Pagination
                    count={Math.ceil(appointmentEdits.length / APPOINTMENTS_PER_PAGE)}
                    page={appointmentsPage}
                    onChange={(_, value) => setAppointmentsPage(value)}
                    size="small"
                    sx={{ mt: 1, alignSelf: "center" }}
                  />
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="submit"
            disabled={!form.nom || !form.espece}
            variant="contained"
          >
            {isEditAnimal ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}