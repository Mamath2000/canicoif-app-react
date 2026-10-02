// Tests de l'API (node:test) sur une base MongoDB dédiée, vidée au début et à la fin.
//   TEST_MONGO_URI (défaut mongodb://localhost:27017/canicoif-test) : le nom de base doit finir par "-test".
//   Lancement : npm test (depuis backend/)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const MONGO_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/canicoif-test';
if (!/\/[^/?]+-test(\?|$)/.test(MONGO_URI)) {
  throw new Error(`TEST_MONGO_URI doit viser une base dont le nom finit par "-test" (reçu : ${MONGO_URI})`);
}
// Lus au chargement des routes : à définir avant de charger l'app
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.ANIMAUX_LIMIT = '5';
process.env.CLIENTS_LIMIT = '5';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const Client = require('../models/Client');
const Animal = require('../models/Animal');
const Appointment = require('../models/Appointment');

const YEAR = new Date().getFullYear();
const PASSWORD = { admin: 'admin-pass-123', user: 'user-pass-123' };
let server, base, fx = {};

async function call(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* corps vide ou non JSON */ }
  return { status: res.status, data };
}
const login = async (username, password) => (await call('POST', '/api/login', { body: { username, password } })).data.token;

before(async () => {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all([User, Client, Animal, Appointment].map((m) => m.syncIndexes()));

  fx.admin = await User.create({ username: 'admin', passwordHash: await bcrypt.hash(PASSWORD.admin, 4), role: 'admin' });
  fx.user = await User.create({ username: 'Marie', passwordHash: await bcrypt.hash(PASSWORD.user, 4), role: 'user' });

  fx.martin = await Client.create({ nom: 'Martin', prenom: 'Paul' });
  fx.archived = await Client.create({ nom: 'Archivé', prenom: 'Ancien', archive: true });
  for (let i = 0; i < 6; i++) await Client.create({ nom: `Client${i}` });

  // Animaux : updatedAt croissant dans l'ordre de création (le dernier est le plus récent)
  const day = (d) => new Date(Date.UTC(YEAR, 0, d, 12));
  fx.rex = await Animal.create({ nom: 'Rex', espece: 'Chien', clientId: fx.martin._id, comportement: 'calme' });
  fx.rexArchived = await Animal.create({ nom: 'Rex', espece: 'Chien', clientId: fx.archived._id });
  fx.felix = await Animal.create({ nom: 'Felix', espece: 'Chat', clientId: fx.martin._id, decede: true });
  for (let i = 0; i < 6; i++) await Animal.create({ nom: `Animal${i}`, espece: 'Chien', clientId: fx.martin._id });
  const all = await Animal.find().sort({ _id: 1 });
  for (const [i, a] of all.entries()) await Animal.collection.updateOne({ _id: a._id }, { $set: { updatedAt: day(i + 1) } });

  // RDV : semaine du 2 au 8 mars de l'année courante, un RDV hors semaine, un l'année précédente
  const at = (y, m, d) => new Date(Date.UTC(y, m - 1, d, 10));
  await Appointment.create([
    { animalId: fx.rex._id, title: 'Rex', start: at(YEAR, 3, 3), end: at(YEAR, 3, 3) },
    { title: 'Indisponible', start: at(YEAR, 3, 5), end: at(YEAR, 3, 5) },
    { animalId: fx.rex._id, title: 'Rex', start: at(YEAR, 3, 20), end: at(YEAR, 3, 20) },
    { animalId: fx.rex._id, title: 'Rex', start: at(YEAR - 1, 3, 4), end: at(YEAR - 1, 3, 4) },
  ]);

  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://localhost:${server.address().port}`;
  fx.tAdmin = await login('admin', PASSWORD.admin);
  fx.tUser = await login('Marie', PASSWORD.user);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// --- Authentification ---

test('login : identifiants valides, nom insensible à la casse', async () => {
  assert.equal((await call('POST', '/api/login', { body: { username: 'marie', password: PASSWORD.user } })).status, 200);
});

test('login : mauvais mot de passe, regex et objet refusés', async () => {
  assert.equal((await call('POST', '/api/login', { body: { username: 'Marie', password: 'faux' } })).status, 401);
  assert.equal((await call('POST', '/api/login', { body: { username: '.*', password: PASSWORD.user } })).status, 401);
  assert.equal((await call('POST', '/api/login', { body: { username: { $ne: null }, password: PASSWORD.user } })).status, 400);
});

test('jeton absent, ou signé avec un autre secret : refusé', async () => {
  assert.equal((await call('GET', '/api/clients')).status, 401);
  const forged = jwt.sign({ username: 'admin', id: String(fx.admin._id), role: 'admin' }, 'canicoif-secret');
  assert.equal((await call('GET', '/api/users', { token: forged })).status, 403);
});

test('routes admin : utilisateurs et modification des paramètres', async () => {
  assert.equal((await call('GET', '/api/users', { token: fx.tUser })).status, 403);
  const users = await call('GET', '/api/users', { token: fx.tAdmin });
  assert.equal(users.status, 200);
  assert.ok(users.data.every((u) => !('passwordHash' in u) && !('tempPasswordHash' in u)));
  assert.equal((await call('POST', '/api/settings', { token: fx.tUser, body: { showStatsFlag: true } })).status, 403);
  assert.equal((await call('POST', '/api/settings', { token: fx.tAdmin, body: { showStatsFlag: true } })).status, 200);
  assert.equal((await call('GET', '/api/settings', { token: fx.tUser })).data.showStatsFlag, true);
});

test('erreurs de l\'API sous la clé "error"', async () => {
  const dup = await call('POST', '/api/users', { token: fx.tAdmin, body: { username: 'Marie', password: 'x', role: 'user' } });
  assert.equal(dup.status, 409);
  assert.equal(typeof dup.data.error, 'string');
  const missing = await call('GET', `/api/animaux/${new mongoose.Types.ObjectId()}`, { token: fx.tUser });
  assert.equal(missing.status, 404);
  assert.equal(typeof missing.data.error, 'string');
  assert.equal((await call('GET', '/api/inconnue', { token: fx.tUser })).status, 404);
  // Pas de 403 (déconnexion côté front) pour une règle métier
  const delAdmin = await call('DELETE', `/api/users/${fx.admin._id}`, { token: fx.tAdmin });
  assert.equal(delAdmin.status, 400);
  assert.equal(typeof delAdmin.data.error, 'string');
});

test('réinitialisation : code temporaire → jeton limité au changement de mot de passe', async () => {
  const u = await User.create({ username: 'reset-me', passwordHash: await bcrypt.hash('old-pass-1', 4) });
  const flag = await call('POST', `/api/users/${u._id}/flag-reset`, { token: fx.tAdmin });
  assert.match(flag.data.tempPassword, /^\d{8}$/);

  const temp = await call('POST', '/api/login', { body: { username: 'reset-me', password: flag.data.tempPassword } });
  assert.equal(temp.status, 200);
  assert.equal(temp.data.reset, true);
  for (const path of ['/api/clients', '/api/settings', '/api/users']) {
    assert.equal((await call('GET', path, { token: temp.data.token })).status, 403, path);
  }
  const done = await call('POST', `/api/users/${u._id}/reset-password`, { token: temp.data.token, body: { tempPassword: 'SKIP', newPassword: 'new-pass-1' } });
  assert.equal(done.status, 200);
  assert.equal((await call('POST', '/api/login', { body: { username: 'reset-me', password: 'new-pass-1' } })).status, 200);
});

// --- Animaux ---

test('animaux récents : triés par date de modification, limités', async () => {
  const { data } = await call('GET', '/api/animaux?recents=true', { token: fx.tUser });
  assert.equal(data.length, 5);
  const dates = data.map((a) => new Date(a.updatedAt).getTime());
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
  assert.ok(data.every((a) => a.client && a.client.nom));
});

test('animaux : exclusion des clients archivés et des décédés', async () => {
  const withArchived = await call('GET', '/api/animaux?nom=rex', { token: fx.tUser });
  assert.equal(withArchived.data.length, 2);
  const active = await call('GET', '/api/animaux?nom=rex&exclureClientsArchives=true', { token: fx.tUser });
  assert.deepEqual(active.data.map((a) => String(a._id)), [String(fx.rex._id)]);
  const ofArchived = await call('GET', `/api/animaux?clientId=${fx.archived._id}&exclureClientsArchives=true`, { token: fx.tUser });
  assert.deepEqual(ofArchived.data, []);
  const alive = await call('GET', '/api/animaux?nom=felix&exclureDecedes=true', { token: fx.tUser });
  assert.deepEqual(alive.data, []);
});

test('animal : historique des rendez-vous', async () => {
  const { data } = await call('GET', `/api/animaux/${fx.rex._id}?withAppointments=true`, { token: fx.tUser });
  assert.equal(data.appointments.length, 3);
});

// --- Clients ---

test('clients : recherche, archivés exclus par défaut, animaux joints', async () => {
  assert.equal((await call('GET', '/api/clients?nom=archiv', { token: fx.tUser })).data.length, 0);
  assert.equal((await call('GET', '/api/clients?nom=archiv&exclureArchives=false', { token: fx.tUser })).data.length, 1);
  assert.equal((await call('GET', '/api/clients?nom=client', { token: fx.tUser })).data.length, 5);
  const { data } = await call('GET', '/api/clients?nom=martin&withAnimaux=true', { token: fx.tUser });
  assert.equal(data[0].animaux.length, 8);
});

test('modifications : seuls les champs métier sont écrits', async () => {
  const before = await Client.findById(fx.martin._id).lean();
  const res = await call('PUT', `/api/clients/${fx.martin._id}`, {
    token: fx.tUser,
    body: { tel: '0102030405', createdAt: '2000-01-01T00:00:00.000Z', pirate: 'x' },
  });
  assert.equal(res.status, 200);
  const after = await Client.findById(fx.martin._id).lean();
  assert.equal(after.tel, '0102030405');
  assert.equal(after.createdAt.getTime(), before.createdAt.getTime());
  assert.ok(!('pirate' in after));

  const rdv = await Appointment.findOne({ title: 'Indisponible' });
  const fixedId = new mongoose.Types.ObjectId();
  const upd = await call('PUT', `/api/appointments/${rdv._id}`, { token: fx.tUser, body: { comment: 'ok', _id: fixedId, createdAt: '2000-01-01' } });
  assert.equal(upd.status, 200);
  assert.equal(upd.data.comment, 'ok');
  assert.equal(String(upd.data._id), String(rdv._id));
  assert.notEqual(new Date(upd.data.createdAt).getFullYear(), 2000);
});

// --- Rendez-vous et statistiques ---

test('rendez-vous de la semaine, avec le comportement de l\'animal', async () => {
  const week = `start=${YEAR}-03-02&end=${YEAR}-03-09`;
  const { data } = await call('GET', `/api/appointments?${week}`, { token: fx.tUser });
  assert.equal(data.length, 2);
  assert.equal(data.find((r) => r.animalId).comportement, 'calme');
});

test('statistiques par mois et par semaine', async () => {
  const month = (await call('GET', '/api/stats/rdv-per-month', { token: fx.tUser })).data;
  assert.equal(month.labels.length, 12);
  assert.equal(month.datasets[0].data[2], 3); // mars de l'année courante
  assert.equal(month.datasets[1].data[2], 1); // mars de l'année précédente
  const week = (await call('GET', '/api/stats/rdv-per-week', { token: fx.tUser })).data;
  assert.equal(week.labels.length, 52);
  assert.equal(week.datasets[0].data.reduce((s, n) => s + n, 0), 3);
});
