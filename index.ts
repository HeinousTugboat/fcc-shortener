import * as admin from 'firebase-admin';
import * as express from 'express';
import { URL } from 'url';
import { Response } from '_debugger';
import { ErrorRequestHandler } from 'express';

const serviceAccount = require("../fcc-backend-firebase-adminsdk-7185u-edd72e9ca4.json");
const app = express();
const port = process.env.PORT || 58808;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fcc-backend.firebaseio.com"
});

const db = admin.firestore();
const links = db.collection('fcc-shortener');

app.get('/new/*', (req, res) => {
  const path = decodeURI(req.path.slice(5));
  const test = new URL(path);
  links.where('original_url', '==', test.toString()).get().then((snapshot) => {
    if (snapshot.empty) {
      console.log('Snapshot Empty!');
      const doc = links.add({original_url: test.toString()})
        .then(ref => ref.set({key: ref.id}, {merge: true}))
        .then(result => {
          res.send(result);
        })
    } else {
      const doc = snapshot.docs[0].data();
      console.log(doc);
      res.send(doc);
    }
  })
});

app.get('/die', (req, res) => {
  res.send('Goodbye!');
  killServer();
});

app.get('/:url', (req, res) => {
  res.send({short_url: req.params.url});
});


app.use((err: Error, req: express.Request, res: express.Response, next: express.ErrorRequestHandler) => {
  // console.log(err);
  res.status(500).send({error: 'Oops.'});
})

// test.set({label:'tester-1'}, {merge: true});
// test.get().then(x => console.log());
// let test = testCollection.add({ label: 'first test', text: 'random text!' })
//   .then((x) => console.log(x))
//   .catch((x) => console.log(x));

// db.collection('test').get()
//   .then((snapshot) => {
//     snapshot.forEach((doc) => {
//       console.log(doc.id, '=>', doc.data());
//     });
//   })
//   .catch((err) => {
//     console.log('Error getting documents', err);
//   });


const server = app.listen(port, () => {
  console.log('Listening on port '+port+'! '+new Date(Date.now()));
});

function killServer() {
  server.close();
}
