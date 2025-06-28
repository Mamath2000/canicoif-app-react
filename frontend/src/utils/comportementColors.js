export function getComportementColors(comportement) {
  switch (comportement) {
    case "Agressif":
      return {
        background: "linear-gradient(90deg, #ffeaea 0%, #ffd6d6 100%)", // rouge très clair dégradé
        color: "#b71c1c"
      };
    case "Peureux":
      return {
        background: "linear-gradient(90deg, #fffde7 0%, #fff9c4 100%)", // jaune très clair dégradé
        color: "#bfa100"
      };
    case "Gueulard":
      return {
        background: "linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%)", // orange très clair dégradé
        color: "#e65100"
      };
    default:
      return {
        background: "linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)", // gris très doux
        color: "#333"
      };
  }
}