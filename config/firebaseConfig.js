const admin = require("firebase-admin");
const serviceAccount = require("./dtweb-7cfee-firebase-adminsdk-fbsvc-93c00c321b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;