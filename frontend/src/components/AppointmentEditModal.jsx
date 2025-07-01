import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { MdPets, MdClose } from "react-icons/md";
import AnimalSearchModal from "./AnimalSearchModal";
import AnimalCard from "./AnimalCard";
import ClientCard from "./ClientCard";
import ClientModal from "./ClientModal";
import AnimalModal from "./AnimalModal";
import { useClientModal } from "../hooks/useClientModal";
import { useAnimalModal } from "../hooks/useAnimalModal";
import { useAnimaux } from "../hooks/useAnimaux";

const emptyAppointment = {
  title: "",
  comportement: "",
  highlight: "",
  comment: "",
  tarif: ""
}

export default function AppointmentEditModal({
  open,
  onClose,
  onSaved,
  start,
  end,
  appointmentProp,
  onDelete
}) {
  // Champs contrôlés du formulaire
  const [form, setForm] = useState(emptyAppointment);
  const [appointment, setAppointment] = useState(appointmentProp);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const [showAnimalSearch, setShowAnimalSearch] = useState(false);

  // Remplit le formulaire si un appointment est passé en prop
  useEffect(() => {
    if (appointmentProp) {
      setSelectedAnimal(null);
      setForm({
        ...emptyAppointment,
        _id: appointmentProp._id || "",
        title: appointmentProp.title || "",
        comportement: appointmentProp.comportement || "",
        highlight: appointmentProp.highlight || "",
        comment: appointmentProp.comment || "",
        tarif: appointmentProp.tarif || "",
        start: appointmentProp.start || start,
        end: appointmentProp.end || end,
        animalId: appointmentProp.animalId || null,
      });
      setAppointment(appointmentProp);
    } else {
      setForm(emptyAppointment);
      setAppointment(null);
    }
  }, [appointmentProp, open]);

  const {
    fetchAnimalById,
  } = useAnimaux();

  const refreshSelectedAnimal = async () => {
    if (selectedAnimal && selectedAnimal._id) {
      const updated = await fetchAnimalById(selectedAnimal._id, true, false);
      setSelectedAnimal(updated);
    }
  };

  const {
    showAnimalModal,
    editAnimal,
    isEditAnimal,
    // animalAppointments,
    openModal: openAnimalModal,
    closeModal: closeAnimalModal,
    handleSaveAnimalModal,
  } = useAnimalModal(refreshSelectedAnimal);

  const {
    editClient,
    showClientModal,
    setShowClientModal,
    openModal: openClientModal,
    closeModal: closeClientModal,
    handleSaveClient,
  } = useClientModal(refreshSelectedAnimal);

  useEffect(() => {
    if (appointment?.animalId) {
      // Charger l'animal associé à l'appointment
      fetchAnimalById(appointment.animalId, true, false)
        .then(res => {
          setSelectedAnimal(res);
        })
        .catch(() => setSelectedAnimal(null));
    }
  }, [appointment]);

  const handleAnimalSelected = (animal) => {
    if (animal && animal._id && animal._id !== selectedAnimal?._id) {
      setSelectedAnimal(animal);

      const clientNom = animal.client?.nom || "";
      const race = animal.race ? ` - ${animal.race}` : "";
      const updateFields = {
        title: `${animal.nom}${clientNom ? " (" + clientNom + ")" : ""}${race}`,
        comportement: animal.comportement || "",
        comment: animal.activiteDefault || "",
        tarif: animal.tarif || "",
        animalId: animal._id,
      };

      setForm(prev => ({
        ...prev,
        ...updateFields
      }));

      setAppointment(prev => ({
        ...prev,
        ...updateFields
      }));

    }
    setShowAnimalSearch(false); // <-- Ajoute cette ligne ici

  };

  const handleDissociateAppointment = () => {
    setSelectedAnimal(null);
    setForm(prev => ({
      ...prev,
      ...emptyAppointment,
      animalId: null,
    }));
    setAppointment({
      ...appointment,
      ...emptyAppointment,
      animalId: null,
    })

  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    // Nettoyage des champs numériques et booléens
    const dataToSave = {
      ...form,
      tarif: form.tarif ? Number(form.tarif) : null,
      highlight: !!form.highlight,
    };
    if (onSaved) await onSaved(dataToSave);
    onClose();
  };



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // const handleUpdateAppointmentFromAnimalModal = (updatedAppointment) => {
  //   if (updatedAppointment._id === appointment?._id) {
  //     setCurrentAppointment(updatedAppointment);
  //     setTitle(updatedAppointment.title || "");
  //     setComportement(updatedAppointment.comportement || "");
  //     setHighlight(updatedAppointment.highlight || false);
  //     setComment(updatedAppointment.comment || "");
  //     setTarif(updatedAppointment.tarif || "");
  //   }
  // };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmitAppointment}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
            Rendez-vous
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <IconButton
                aria-label="Associer un animal"
                onClick={() => setShowAnimalSearch(true)}
                size="small"
              >
                <MdPets size={20} />
              </IconButton>
              {appointment && appointment.animalId && (
                <span style={{ position: "relative", display: "inline-block" }}>
                  <IconButton
                    aria-label="Dissocier"
                    onClick={handleDissociateAppointment}
                    size="small"
                    sx={{ p: 0.3 }}
                  >
                    <MdPets size={20} />
                    <MdClose
                      size={12}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "red",
                        borderRadius: "50%",
                      }}
                    />
                  </IconButton>
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogContent sx={{ pt: 1, pb: 1 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 16,
                alignItems: "flex-start",
                minWidth: 600,
              }}
            >
              {/* Colonne gauche */}
              <div style={{ flex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TextField
                    label="Titre du rendez-vous"
                    value={form.title}
                    name="title"
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    size="small"
                    placeholder="Titre libre"
                  />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <TextField
                    label="Activité"
                    value={form.comment}
                    name="comment"
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    size="small"
                    multiline
                    minRows={1}
                    style={{ flex: 2 }}
                  />
                  <TextField
                    label="Tarif (€)"
                    type="number"
                    value={form.tarif}
                    name="tarif"
                    onChange={handleChange}
                    fullWidth
                    margin="dense"
                    size="small"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              {/* Colonne droite : Début / Fin */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, width: "100%" }}>
                  <TextField
                    label="Début"
                    value={
                      start
                        ? new Date(form.start).toLocaleString("fr-FR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : ""
                    }
                    fullWidth
                    margin="dense"
                    size="small"
                    InputProps={{ readOnly: true }}
                    style={{ flex: 2 }}
                  />
                  <TextField
                    label="Fin"
                    value={
                      end
                        ? new Date(form.end).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : ""
                    }
                    fullWidth
                    margin="dense"
                    size="small"
                    InputProps={{ readOnly: true }}
                    style={{ flex: 1 }}
                  />
                </div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.highlight}
                      name="highlight"
                      onChange={handleChange}
                      color="secondary"
                      sx={{ transform: "scale(1.1)", p: 0.2 }}
                      size="small"
                    />
                  }
                  label="Mise en avant"
                  sx={{ mt: 0.5, mx: "auto" }}
                />
              </div>
            </div>
            {/* AnimalCard et ClientCard sur toute la largeur */}
            {selectedAnimal?.client && (
              <div
                style={{
                  margin: "10px 0 0 0",
                  width: "100%",
                  display: "flex",
                  gap: 12,
                  alignItems: "stretch"
                }}
              >
                <div style={{ flex: 1, height: "100%" }}>
                  <AnimalCard
                    animal={selectedAnimal}
                    style={{ height: "100%", minHeight: 100 }}
                    onEdit={openAnimalModal}
                  />
                </div>
                <div style={{ flex: 1, height: "100%" }}>
                  <ClientCard
                    client={selectedAnimal?.client}
                    style={{ height: "100%", minHeight: 100 }}
                    onEdit={openClientModal}
                  />
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1 }}>
            {appointmentProp?._id && (
              <Button
                color="error"
                onClick={() => onDelete && onDelete(appointment)}
                sx={{ mr: "auto" }}
                size="small"
              >
                Supprimer
              </Button>
            )}
            <Button onClick={onClose} size="small">Annuler</Button>
            <Button type="submit" variant="contained" size="small">Valider</Button>
          </DialogActions>
        </form>
        <AnimalSearchModal
          open={showAnimalSearch}
          onClose={() => setShowAnimalSearch(false)}
          onAnimalSelected={(animal) => handleAnimalSelected(animal)}
          selectionMode={true}
        />

        {editAnimal && (
          <AnimalModal
            open={showAnimalModal}
            onClose={closeAnimalModal}
            onSaved={handleSaveAnimalModal}
            editAnimal={editAnimal}
            isEditAnimal={isEditAnimal}
            // animalAppointments={editAnimal?.appointments || []}
          />)}

        {editClient && (
          <ClientModal
            open={showClientModal}
            onClose={closeClientModal}
            onSaved={handleSaveClient}
            client={editClient}
          />
        )}
      </Dialog>
    </>
  );
}