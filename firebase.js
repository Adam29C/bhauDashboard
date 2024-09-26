const admin = require('firebase-admin');
const serviceAccount = require('./bhau777-e81f3-firebase-adminsdk-j30d2-76cb86e34e.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin.messaging();;
