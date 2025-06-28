import { Calendar as RBCalendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fr } from "date-fns/locale";
import { parse, startOfWeek, getDay, format } from "date-fns";
import axios from "axios";
import { getComportementColors } from "../utils/comportementColors";
import { holidays } from "../utils/holidays"; // <-- import des jours fériés

// import Calendar from "react-calendar"; // <-- ce Calendar est maintenant unique

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(RBCalendar); // <-- utilise le bon Calendar

function AgendaSemaine({
  appointments,
  onSelectEvent,
  onCreateSlot,
  onEventResize,
  onEventDrop, // <-- récupère la prop
  selectedDate,
  onNavigate, // <-- ajoute cette prop
  onEditAppointment, // <-- ajoute cette prop
}) {
  // console.log("appointments reçus :", appointments);
  // console.log("onSelectEvent :", onSelectEvent);
  // console.log("onCreateSlot :", onCreateSlot);

  const events = (appointments || []).map((a) => ({
    ...a,
    id: a.id || a._id,
    title: a.title || "", // <-- champ title
    start: new Date(a.start),
    end: new Date(a.end),
    allDay: false,
  }));
  return (
    <div
      style={{
        height: "96%",
        width: "100%",
        overflow: "hidden", // pas de scroll interne
        background: "#fff",
      }}
    >
      <DnDCalendar
        localizer={localizer}
        events={events}
        defaultView="work_week" // <-- affiche uniquement lundi à vendredi
        views={["work_week"]} // <-- n'affiche que la vue semaine ouvrée
        messages={{ week: "Semaine", work_week: "Semaine (hors week-end)" }}
        culture="fr"
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        onSelectEvent={onSelectEvent}
        selectable
        onSelectSlot={onCreateSlot}
        resizable
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        min={new Date(1970, 1, 1, 8, 0)} // 8h00
        max={new Date(1970, 1, 1, 19, 0)} // 19h00
        date={selectedDate}
        onNavigate={onNavigate} // <-- utilise la prop onNavigate
        eventPropGetter={eventPropGetter}
        components={{ event: AgendaEvent }} // <-- AJOUTE CETTE LIGNE
        dayPropGetter={dayPropGetter} // <-- AJOUTE CETTE LIGNE
        step={15} // <-- Ajoute cette ligne pour des créneaux de 15 minutes
        timeslots={2} // <-- (optionnel) 2 créneaux de 15min = 30min par ligne
      />
    </div>
  );
}

export default AgendaSemaine;

function App() {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ padding: "2rem", background: "#f0f0f0" }}>
        <h1>Gestion des rendez-vous</h1>
      </div>
      <AgendaSemaine
        appointments={appointments}
        onSelectEvent={handleEditAppointment}
        onEventDrop={onEventDrop} // <-- IMPORTANT !
      />
    </div>
  );
}

async function deleteAppointment(appointment) {
  await axios.delete(
    `/api/appointments/${appointment.id}`
  );
}

const eventPropGetter = (event) => {
  // 1. Fond selon le type d'event
  let background;
  if (event.highlight) {
    background = "linear-gradient(90deg, #ede7f6 0%, #b39ddb 100%)";
  } else if (!event.animalId && !event.animal) {
    background = "linear-gradient(90deg, #f9f9f9 0%, #eeeeee 100%)";
  } else {
    background = "linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)";
  }

  // 2. Bordure gauche selon comportement
  let borderColor = "#bdbdbd"; // gris doux par défaut
  if (event.comportement && event.comportement.trim().toLowerCase() !== "ras") {
    const { background: comportementBg } = getComportementColors(event.comportement);
    if (comportementBg && comportementBg.includes("#")) {
      const match = comportementBg.match(/#([0-9a-fA-F]{6})/g);
      if (match && match.length > 1) borderColor = match[1];
      else if (match && match.length > 0) borderColor = match[0];
    }
  }

  return {
    style: {
      background,
      color: event.highlight ? "#4527a0" : "#0d47a1",
      border: "1px solid #bbdefb",
      borderLeft: `6px solid ${borderColor}`,
      fontWeight: event.highlight ? 700 : 500,
    },
  };
};

function AgendaEvent({ event }) {
  const { background, color } = getComportementColors(event.comportement);
  return (
    <div>
      <div style={{ fontWeight: 400, fontSize: "0.88em" }}>{event.title}</div>
      {event.comment && (
        <span
          style={{
            background: "#f5f5f5",
            color: "#333",
            borderRadius: 12,
            padding: "2px 10px",
            fontWeight: 500,
            fontSize: "0.83em",
            marginTop: 2,
            marginRight: 6,
            display: "inline-block",
            border: "1px solid #eee",
          }}
        >
          {event.comment}
        </span>
      )}
      {event.comportement &&
        event.comportement.trim().toLowerCase() !== "ras" && (
          <span
            style={{
              background,
              color,
              borderRadius: 12,
              padding: "2px 10px",
              fontWeight: 600,
              fontSize: "0.85em",
              marginTop: 2,
              display: "inline-block",
            }}
          >
            {event.comportement}
          </span>
        )}
    </div>
  );
}

const pad = (n) => n.toString().padStart(2, "0");
const formatLocalDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const dayPropGetter = (date) => {
  const iso = formatLocalDate(date); // <-- compare en local
  if (holidays.includes(iso)) {
    return {
      style: {
        background: "linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%)",
        color: "#b26a00",
      },
    };
  }
  return {};
};

