import { useEffect, useState } from 'react';
import AgendaSemaine from "./components/AgendaSemaine";
import SettingsDialog from "./components/SettingsDialog";
import PasswordResetModal from "./components/PasswordResetModal";
import StatsDialog from "./components/StatsDialog";
import ClientSearchModal from "./components/ClientSearchModal";
import AnimalSearchModal from "./components/AnimalSearchModal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './App.css';
import Button from '@mui/material/Button';
import AppointmentEditModal from './components/AppointmentEditModal';
import AnimalModal from './components/AnimalModal';
import { getWeekDates } from "./utils/dateUtils";
import { isTestBannerEnabled, getAppVersion, isStatsButtonEnabled } from "./utils/env";
import LoginModal from "./components/LoginModal";

import { useAnimalModal } from "./hooks/useAnimalModal";
import { useAppointmentModal } from "./hooks/useAppointmentModal";
import { useAppointments } from './hooks/useAppointments';
import { useAnimaux } from "./hooks/useAnimaux";
import { useSettings } from "./components/settings/hooks/useSettings";

import { useInternalCheck } from "./hooks/useInternalCheck";

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Une erreur s'est produite. Veuillez réessayer plus tard.</h2>;
    }

    return this.props.children;
  }
}

function App() {
  // Version affichée dans le bandeau
  const { version, gitRef } = getAppVersion();
  const [showTestBanner, setShowTestBanner] = useState(false);

  // Authentification
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token') || "");
  const [username, setUsername] = useState(() => localStorage.getItem('jwt_user') || "");


  const [role, setRole] = useState(() => localStorage.getItem('jwt_role') || "user");
  const [reset, setReset] = useState(false);
  const [userId, setUserId] = useState(() => localStorage.getItem('jwt_id') || "");

  // Affichage asynchrone de la bannière de test (optionnel)
  useEffect(() => {
    if (!token) return;
    (async () => {
      const enabled = await isTestBannerEnabled();
      setShowTestBanner(enabled);
    })();
  }, [token]);

  // Vérification de l'état du serveur et de la session
  const {
    checkServer,
  } = useInternalCheck();

  const {
    getSettings,
  } = useSettings();

  // --- États principaux ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);

  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  // Setting ===============================================================
  const [showStatsFlag, setShowStatsFlag] = useState(false);

  const {
    animaux,
    fetchRecentsAnimaux,
  } = useAnimaux();

  const {
    appointments,
    fetchAppointments,
  } = useAppointments();

  const refreshApp = async () => {
    if (token && selectedDate) {
      await fetchAppointments(selectedDate);
      await fetchRecentsAnimaux();
    }
  };

  // --- Hooks personnalisés pour la gestion des animaux et des rendez-vous ---
  const {
    showAnimalModal,
    editAnimal,
    isEditAnimal,
    openModal: openAnimalModal,
    closeModal: closeAnimalModal,
    handleSaveAnimalModal,
  } = useAnimalModal(refreshApp);

  const {
    editAppointment,
    showAppointmentModal,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleEditAppointment,
    handleCreateSlot,
    handleEventDrop,
    closeModal: handleCloseAppointment,
  } = useAppointmentModal(refreshApp);

  const fetchSettings = async () => {
    const showStats = await getSettings('showStatsFlag'); // Attendez que la promesse soit résolue
    setShowStatsFlag(!!showStats); // Mettez à jour l'état avec un booléen
  };

  // --- Récupération des données ---
  useEffect(() => {
    if (token) fetchSettings();
  }, [token]);

  useEffect(() => {
    if (token && selectedDate) {
      const weekDates = getWeekDates(selectedDate);
      const monday = new Date(weekDates[0]);
      fetchAppointments(monday);
      refreshApp();
    }
  }, [selectedDate, token]);

  const handleMiniCalendarChange = (date) => {
    if (!selectedDate || date.getTime() !== selectedDate.getTime()) {
      setSelectedDate(date);
    }
  };

  const handleCloseSettingsDialog = () => {
    fetchSettings();
    setShowSettingsDialog(false);
  }

  // --- Gestion login/logout ---
  const handleLogin = (jwt, user, userRole, resetFlag, id) => {
    setToken(jwt);
    setUsername(user);
    setRole(userRole);
    setReset(!!resetFlag);
    setUserId(id);
    localStorage.setItem('jwt_token', jwt);
    localStorage.setItem('jwt_user', user);
    localStorage.setItem('jwt_role', userRole);
    localStorage.setItem('jwt_id', id);
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
    setRole("user");
    setReset(false);
    setUserId("");
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
    localStorage.removeItem('jwt_role');
    localStorage.removeItem('jwt_id');
    window.location.reload();
  };

  useEffect(() => {
    const handleLogout = () => {
      setToken("");
      setUsername("");
      setRole("user");
      setReset(false);
      setUserId("");
    };

    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const isServerOk = await checkServer();
      if (!isServerOk) {
        handleLogout();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval); // Nettoyage à la désactivation du composant
  }, [checkServer, handleLogout]);


  // // --- Intercepteur fetch pour ajouter le token JWT ---
  // window._fetch = window._fetch || window.fetch;
  // window.fetch = function (url, options = {}) {
  //   const jwt = localStorage.getItem('jwt_token');
  //   if (jwt && url.startsWith('/api/')) {
  //     options.headers = options.headers || {};
  //     options.headers['Authorization'] = 'Bearer ' + jwt;
  //   }
  //   return window._fetch(url, options);
  // };

  // --- Render principal ---
  let content;
  // Affichage de la page de gestion des utilisateurs pour les admins : bouton d'accès

  if (!token) {
    content = <LoginModal open={true} onLogin={handleLogin} />;
  } else if (reset) {
    content = <PasswordResetModal open={true} userId={userId} onReset={() => setReset(false)} onLogout={handleLogout} skipTempPassword />;
  } else {
    content = (
      <>
        <div style={{ position: "relative", padding: 0, background: "#222", width: "100%", marginBottom: "12px", minHeight: 56 }}>
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
          {/* Version en haut à droite */}
          <div style={{
            position: "absolute",
            top: 8,
            right: 24,
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 8,
            padding: "4px 12px",
            letterSpacing: 1.2,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
            v{version}
            {gitRef && (
              <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8, opacity: 0.7 }}>#{gitRef}</span>
            )}
            {username && (
              <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 16, opacity: 0.8 }}>
                {username}
                <span style={{ cursor: 'pointer', marginLeft: 10, color: '#fff', fontWeight: 700 }} title="Déconnexion" onClick={handleLogout}>
                  ⎋
                </span>
              </span>
            )}
            {/* Bouton statistiques pour tous */}
            {showStatsFlag && (
              <Button
                variant="contained"
                size="small"
                style={{ marginLeft: 16, background: '#43a047', color: '#fff', fontWeight: 600 }}
                onClick={() => setShowStatsDialog(true)}
              >
                Statistiques
              </Button>
            )}
            {/* Bouton gestion users pour admin */}
            {role === 'admin' && (
              <Button
                variant="contained"
                size="small"
                style={{ marginLeft: 16, background: '#1976d2', color: '#fff', fontWeight: 600 }}
                onClick={() => setShowSettingsDialog(true)}
              >
                Paramètres
              </Button>
            )}
          </div>
        </div>

        <StatsDialog
          open={showStatsDialog}
          onClose={() => setShowStatsDialog(false)}
        />
        <SettingsDialog
          open={showSettingsDialog && role === 'admin'}
          onClose={handleCloseSettingsDialog}
        />
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
            {/* Label version de test si activé */}
            {showTestBanner && (
              <div style={{
                width: "95%",
                marginBottom: "1rem",
                background: "#ffe7a0",
                color: "#bfa100",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                textAlign: "center",
                padding: "8px 0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                border: "1px solid #ffe7a0",
                letterSpacing: 1
              }}>
                VERSION DE TEST
              </div>
            )}
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
                onChange={handleMiniCalendarChange}
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
            open={showAppointmentModal}
            onClose={handleCloseAppointment}
            onSaved={handleSaveAppointment}
            start={editAppointment?.start}
            end={editAppointment?.end}
            appointmentProp={editAppointment}
            // selectedAnimal={selectedAnimal}
            // setSelectedAnimal={setSelectedAnimal}
            onDelete={handleDeleteAppointment}
          />
          <AnimalModal
            open={showAnimalModal}
            onClose={closeAnimalModal}
            onSaved={handleSaveAnimalModal}
            editAnimal={editAnimal}
            isEditAnimal={isEditAnimal}
          // animalAppointments={editAnimal?.appointments || []}
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

  return <ErrorBoundary>{content}</ErrorBoundary>;
}

export default App;