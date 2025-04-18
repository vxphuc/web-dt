const admin = require("firebase-admin");
const serviceAccount = require("./dtshop-50141-firebase-adminsdk-fbsvc-def366aa67.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;