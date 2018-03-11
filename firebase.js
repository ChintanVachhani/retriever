// firebase admin setup
const path = require('path');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require(path.join(__dirname, process.env.SERVICE_ACCOUNT_KEY));
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
});

module.exports = firebaseAdmin;