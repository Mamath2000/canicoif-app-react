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
import { useAnimalForAppointment } from "../hooks/useAnimalForAppointment";
import { useClientForAppointment } from "../hooks/useClientForAppointment";

export default function AppointmentEditModal({
  open,
  onClose,
  onSave,
  start,
  end,
  initial,
  onDelete
}) {
  // Champs contrôlés du formulaire
  const [title, setTitle] = useState(initial?.title || "");
  const [comportement, setComportement] = useState(initial?.comportement || "");
  const [highlight, setHighlight] = useState(initial?.highlight || false);
  const [comment, setComment] = useState(initial?.comment || "");
  const [tarif, setTarif] = useState(initial?.tarif || "");
  
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(initial);

  // Hooks animaux et clients
  const {
    selectedAnimal,
    setSelectedAnimal,
    animalAppointments,
    editAnimal,
    editAnimalModalOpen,
    handleAnimalSelected,
    handleEditAnimal,
    handleCloseAnimalModal,
    handleSaveAnimalModal,
  } = useAnimalForAppointment(initial, open);

  const {
    editClientModalOpen,
    editClient,
    handleEditClient,
    handleCloseClientEditModal,
    handleClientSaved,
  } = useClientForAppointment(selectedAnimal, setSelectedAnimal);

  // Remplir les champs si initial change (édition d'un RDV existant)
  useEffect(() => {
    setTitle(currentAppointment?.title || "");
    setComportement(currentAppointment?.comportement || "");
    setHighlight(currentAppointment?.highlight || false);
    setComment(currentAppointment?.comment || "");
    setTarif(currentAppointment?.tarif || "");
  }, [currentAppointment, open]);

  useEffect(() => {
    setCurrentAppointment(initial);
  }, [initial]);

  // Enregistrement du rendez-vous
  const handleSaveAppointment = () => {
    onSave({
      title,
      comportement,
      highlight,
      comment,
      tarif: tarif ? Number(tarif) : null,
      start,
      end,
      animalId: selectedAnimal?._id || null,
    });
  };

  const handleDissociateAppointment = () => {
    setSelectedAnimal(null);
    setTitle("");
    setComportement("");
  };

  const handleSubmitAppointment = (e) => {
    e.preventDefault();
    handleSaveAppointment();
  };

  const handleUpdateAppointmentFromAnimalModal = (updatedAppointment) => {
    if (updatedAppointment._id === currentAppointment?._id) {
      setCurrentAppointment(updatedAppointment);
      setTitle(updatedAppointment.title || "");
      setComportement(updatedAppointment.comportement || "");
      setHighlight(updatedAppointment.highlight || false);
      setComment(updatedAppointment.comment || "");
      setTarif(updatedAppointment.tarif || "");
    }
  };

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
              {selectedAnimal && (
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
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    placeholder="Titre libre"
                  />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <TextField
                    label="Activité"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
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
                    value={tarif}
                    onChange={e => setTarif(e.target.value)}
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
                        ? new Date(start).toLocaleString("fr-FR", {
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
                        ? new Date(end).toLocaleTimeString("fr-FR", {
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
                      checked={highlight}
                      onChange={e => setHighlight(e.target.checked)}
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
                    onEdit={() => handleEditAnimal(selectedAnimal)}
                  />
                </div>
                <div style={{ flex: 1, height: "100%" }}>
                  <ClientCard
                    client={selectedAnimal?.client}
                    style={{ height: "100%", minHeight: 100 }}
                    onEdit={handleEditClient}
                  />
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1 }}>
            {initial?._id && (
              <Button
                color="error"
                onClick={() => onDelete && onDelete(initial)}
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
          onAnimalSelected={(animal) =>
            handleAnimalSelected(animal, setTitle, setComportement, setComment, setTarif)
          }
          selectionMode={true}
        />
        <ClientModal
          open={editClientModalOpen}
          onClose={handleCloseClientEditModal}
          onSaved={handleClientSaved}
          client={editClient}
        />
        <AnimalModal
          open={editAnimalModalOpen}
          onClose={handleCloseAnimalModal}
          onSave={(updatedAnimal) => handleSaveAnimalModal(updatedAnimal, setSelectedAnimal)}
          animalForm={editAnimal}
          isEditAnimal={true}
          animalAppointments={animalAppointments}
          onUpdateAppointment={handleUpdateAppointmentFromAnimalModal}
        />
      </Dialog>
    </>
  );
}