// Calcule la date de Pâques (algorithme de Meeus/Jones/Butcher)
function getEasterDate(year) {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // force minuit locale
  const pad = n => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getFrenchHolidays(year) {
  const easter = getEasterDate(year);

  // Helper pour ajouter des jours à une date
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // Liste des jours fériés fixes et mobiles
  const holidays = [
    new Date(year, 0, 1), // Jour de l'an
    new Date(year, 4, 1), // Fête du Travail
    new Date(year, 4, 8), // Victoire 1945
    new Date(year, 6, 14), // Fête nationale
    new Date(year, 7, 15), // Assomption
    new Date(year, 10, 1), // Toussaint
    new Date(year, 10, 11), // Armistice
    new Date(year, 11, 25), // Noël
    easter, // Pâques
    addDays(easter, 1), // Lundi de Pâques
    addDays(easter, 39), // Ascension
    addDays(easter, 50), // Lundi de Pentecôte
  ];

  // Retourne les dates au format local YYYY-MM-DD
  return holidays.map(formatLocalDate);
}

// Exemple d'utilisation pour l'année courante :
export const holidays = getFrenchHolidays(new Date().getFullYear()).concat(getFrenchHolidays(new Date().getFullYear()+1));
