const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const ADMIN_USERNAME = 'admin';
const PASSWORD_LENGTH = 16;

function generateRandomPassword(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function createAdminIfNotExists() {
  await mongoose.connect('mongodb://localhost:27017/agenda');
  const admin = await User.findOne({ username: ADMIN_USERNAME });
  const password = generateRandomPassword(PASSWORD_LENGTH);
  const passwordHash = await bcrypt.hash(password, 10);
  if (!admin) {
    await User.create({ username: ADMIN_USERNAME, passwordHash, role: 'admin' });
    console.log('Mot de passe admin généré :', password);
    console.log('Notez-le, il ne sera plus affiché.');
  } else {
    admin.passwordHash = passwordHash;
    await admin.save();
    console.log('Mot de passe admin réinitialisé :', password);
    console.log('Notez-le, il ne sera plus affiché.');
  }
  mongoose.disconnect();
}

createAdminIfNotExists();
