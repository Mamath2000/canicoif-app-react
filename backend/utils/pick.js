// Ne garde de req.body que les champs modifiables listés (évite d'écrire _id, createdAt… envoyés par le client)
function pick(body, fields) {
  const out = {};
  for (const field of fields) {
    if (body && body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

const CLIENT_FIELDS = ['nom', 'prenom', 'adresse', 'tel', 'mobile', 'email', 'commentaire', 'archive'];
const ANIMAL_FIELDS = ['nom', 'espece', 'race', 'taille', 'couleur', 'comportement', 'dateNaissance', 'activiteDefault', 'decede', 'tarif', 'clientId'];
const APPOINTMENT_FIELDS = ['animalId', 'title', 'start', 'end', 'comment', 'tarif', 'highlight'];

module.exports = { pick, CLIENT_FIELDS, ANIMAL_FIELDS, APPOINTMENT_FIELDS };
