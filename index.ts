import * as admin from 'firebase-admin';

const serviceAccount = require("../fcc-backend-firebase-adminsdk-7185u-edd72e9ca4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fcc-backend.firebaseio.com"
});

const db = admin.firestore();
const testCollection = db.collection('test');

console.log(testCollection.id);
let test = testCollection.doc('tester-1');
test.set({label:'tester-1'}, {merge: true});
test.get().then(x => console.log());
// let test = testCollection.add({ label: 'first test', text: 'random text!' })
//   .then((x) => console.log(x))
//   .catch((x) => console.log(x));

db.collection('test').get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });
