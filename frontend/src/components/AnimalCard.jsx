
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FaDog, FaCat, FaBookDead } from "react-icons/fa";
import { GiPig } from "react-icons/gi";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from '@mui/icons-material/Edit';
import { getComportementColors } from "../utils/comportementColors";

export default function AnimalCard({ 
  animal, 
  onEdit, 
  style, 
  showLastAppointments = false, 
  appointments = [] 
}) {
  if (!animal) return null;

  // Trie et prend les 4 derniers rendez-vous (suppose que appointments sont déjà ceux de cet animal)
  const lastAppointments = showLastAppointments && appointments && appointments.length > 0
    ? [...appointments]
        .sort((a, b) => new Date(b.start) - new Date(a.start))
        .slice(0, 4)
    : [];

  return (
    <Paper sx={{ p: 2, mb: 2, background: "#fafafa", borderRadius: 2, boxShadow: 1 }} style={style}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, position: "relative" }}>
        {/* Partie gauche : infos animal */}
        <Box sx={{ flex: showLastAppointments && lastAppointments.length > 0 ? 1 : "auto", minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            {animal.espece === "chien" ? (
              <FaDog style={{ color: "#795548", fontSize: 22 }} />
            ) : animal.espece === "chat" ? (
              <FaCat style={{ color: "#616161", fontSize: 22 }} />
            ) : animal.espece === "nac" ? (
              <GiPig style={{ color: "#8d6e63", fontSize: 22 }} />
            ) : (
              <HelpOutlineIcon fontSize="small" sx={{ color: "#aaa" }} />
            )}
            <span style={{ fontWeight: 600, fontSize: 18 }}>{animal.nom}</span>
            {animal.dateNaissance && !animal.decede && (
              <span style={{ color: "#666", marginLeft: 4 }}>
                ({Math.floor((Date.now() - new Date(animal.dateNaissance)) / (365.25 * 24 * 3600 * 1000))} ans)
              </span>
            )}
            {animal.decede && (
              <FaBookDead style={{ color: "red", marginLeft: 8, fontSize: 18 }} title="Décédé" />
            )}
            {animal.comportement && (
              <span
                style={{
                  ...getComportementColors(animal.comportement),
                  borderRadius: 12,
                  padding: "2px 10px",
                  fontWeight: 600,
                  fontSize: "0.95em",
                  marginLeft: 8,
                  marginRight: 6,
                  display: "inline-block",
                }}
              >
                {animal.comportement}
              </span>
            )}
          </Box>
          {(animal.race || animal.taille || animal.couleur) && (
            <div style={{ marginBottom: 4 }}>
              Caractéristiques :
              {animal.race && <> {animal.race}</>}
              {animal.taille && <> {animal.race ? "," : ""} {animal.taille}</>}
              {animal.couleur && <> {(animal.race || animal.taille) ? "," : ""} {animal.couleur}</>}
            </div>
          )}
          {animal.activiteDefault && (
            <div style={{ marginBottom: 4 }}>Activité : {animal.activiteDefault}</div>
          )}
          {animal.tarif !== undefined && animal.tarif !== null && (
            <div style={{ marginBottom: 4 }}>Tarif : {animal.tarif} €</div>
          )}
        </Box>
        {/* Partie droite : derniers rendez-vous */}
        {showLastAppointments && lastAppointments.length > 0 && (
          <Box sx={{ flex: 1.6, minWidth: 320, ml: 2, position: "relative", display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Derniers RDV
              {onEdit && (
                <Button
                  size="small"
                  onClick={() => onEdit(animal)}
                  sx={{ minWidth: 0, p: 0.5, ml: 1, color: "#1976d2" }}
                >
                  <EditIcon fontSize="small" />
                </Button>
              )}
            </div>
            {(lastAppointments || []).map((rdv, idx) => (
              <Box
                key={rdv._id || idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  borderBottom: idx < lastAppointments.length - 1 ? "1px solid #eee" : "none",
                  py: 0.5,
                  gap: 1,
                }}
              >
                <span style={{ minWidth: 80 }}>
                  {rdv.start ? new Date(rdv.start).toLocaleDateString("fr-FR") : ""}
                </span>
                <span style={{ flex: 1, color: "#555" }}>
                  {rdv.comment || rdv.title || "-"}
                </span>
                <span style={{ minWidth: 50, textAlign: "right", color: "#333" }}>
                  {rdv.tarif ? `${rdv.tarif} €` : ""}
                </span>
              </Box>
            ))}
          </Box>
        )}
        {/* Si pas de RDV, crayon à droite de la card */}
        {(!showLastAppointments || lastAppointments.length === 0) && onEdit && (
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <Button
              size="small"
              onClick={() => onEdit(animal)}
              sx={{ minWidth: 0, p: 0.5, color: "#1976d2" }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}