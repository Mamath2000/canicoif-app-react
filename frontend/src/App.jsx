import { useEffect, useState } from 'react';
import AgendaSemaine from "./components/AgendaSemaine";
import ClientSearchModal from "./components/ClientSearchModal";
import AnimalSearchModal from "./components/AnimalSearchModal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './App.css';
import Button from '@mui/material/Button';
import AppointmentEditModal from './components/AppointmentEditModal';
import AnimalModal from './components/AnimalModal';
import { getWeekDates } from "./utils/dateUtils";
import { useAnimalModalForApp } from "./hooks/useAnimalModalForApp";
import { useAppointmentModalForApp } from "./hooks/useAppointmentModalForApp";

function App() {

  // --- États principaux ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);

  // --- Hooks personnalisés pour la gestion des animaux et des rendez-vous ---
  const {
    openAddAnimalModal,
    animalForm,
    isEditAnimal,
    animalAppointments,
    openModal: openAnimalModal,
    closeModal: closeAnimalModal,
    handleSaveAnimalModal,
    animaux,
    fetchRecentsAnimaux,
  } = useAnimalModalForApp();

  const {
    appointments,
    editAppointmentModalOpen,
    editAppointmentData,
    selectedAnimal,
    setSelectedAnimal,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleEditAppointment,
    handleCreateSlot,
    handleEventDrop,
    fetchAppointments,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
    closeModal: handleCloseAppointment,
  } = useAppointmentModalForApp(fetchRecentsAnimaux, selectedDate);

  // --- Récupération des données ---
  useEffect(() => {
    fetchRecentsAnimaux();
  }, []);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  // --- Render principal ---
  return (
    <>
      <div style={{ padding: 0, background: "#222", width: "100%", marginBottom: "12px" }}>
        <img
          src="/bandeau_lx.png"
          alt="Bandeau Canicoif"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            border: "none"
          }}
        />
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 4rem)" }}>
        {/* Colonne gauche : calendrier et boutons */}
        <div style={{
          flex: "0 0 20%",
          background: "#f8f8f8",
          borderRight: "1px solid #ddd",
          minWidth: 180,
          maxWidth: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "2rem"
        }}>
          {/* Mini calendrier en premier */}
          <div
            style={{
              width: "95%",
              marginBottom: "1.5rem",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              padding: "1rem 0.5rem",
              border: "none"
            }}
          >
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              calendarType="iso8601"
              locale="fr-FR"
              showNeighboringMonth={false}
              minDetail="month"
              maxDetail="month"
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  const weekDates = getWeekDates(selectedDate);
                  if (weekDates.includes(new Date(date).setHours(0, 0, 0, 0))) {
                    return "selected-week";
                  }
                }
                return null;
              }}
            />
          </div>
          {/* Les boutons juste après */}
          <div style={{ width: "95%", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Button
              className="bandeau-btn"
              onClick={() => setShowClientSearch(true)}
            >
              RECHERCHE CLIENT
            </Button>
            <Button
              className="bandeau-btn"
              onClick={() => setShowAnimalSearch(true)}
            >
              RECHERCHE ANIMAL
            </Button>
          </div>
          {/* Liste des animaux triée par date de modification */}
          <div style={{ marginTop: "0.5rem", width: "90%" }}>
            <div className="animaux-recents-titre">Animaux récents</div>
            <div style={{ overflowY: "auto" }}>
              {Array.isArray(animaux) && animaux
                .slice() // pour ne pas muter le state
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map(animal => (
                  <div
                    key={animal._id}
                    onClick={() => openAnimalModal(animal)}
                    style={{
                      cursor: "pointer",
                      padding: "6px 8px",
                      borderRadius: 6,
                      marginBottom: 2,
                      background: "#fff",
                      transition: "background 0.2s",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "1px solid #eee"
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseOut={e => (e.currentTarget.style.background = "#fff")}
                  >
                    <span style={{ fontWeight: 600 }}>{animal.nom}</span>
                    <span style={{ color: "#888", fontSize: 13, marginLeft: 6 }}>
                      {animal.client?.nom ? `(${animal.client.nom})` : ""}
                    </span>
                    <span style={{ color: "#555", fontSize: 13, marginLeft: "auto" }}>
                      {animal.race}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {/* Colonne principale : agenda */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AgendaSemaine
              appointments={appointments}
              onSelectEvent={appointment => handleEditAppointment(appointment)}
              onCreateSlot={handleCreateSlot}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventDrop}
              selectedDate={selectedDate}
              onNavigate={setSelectedDate}
            />
          </div>
        </div>
        <ClientSearchModal
          open={showClientSearch}
          onClose={() => setShowClientSearch(false)}
        />
        <AppointmentEditModal
          open={editAppointmentModalOpen}
          onClose={handleCloseAppointment}
          onSave={handleSaveAppointment}
          start={editAppointmentData?.start}
          end={editAppointmentData?.end}
          initial={editAppointmentData}
          selectedAnimal={selectedAnimal}
          setSelectedAnimal={setSelectedAnimal}
          onDelete={handleDeleteAppointment}
        />
        <AnimalModal
          open={openAddAnimalModal}
          onClose={closeAnimalModal}
          onSave={handleSaveAnimalModal}
          animalForm={animalForm}
          isEditAnimal={isEditAnimal}
          animalAppointments={animalAppointments}
        />
        <AnimalSearchModal
          open={showAnimalSearch}
          onClose={() => setShowAnimalSearch(false)}
          selectionMode={false}
        />
      </div>
    </>
  );
}

export default App;