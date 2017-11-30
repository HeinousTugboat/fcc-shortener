import * as admin from 'firebase-admin';
import * as express from 'express';
import { URL } from 'url';
import { Response } from '_debugger';
import { ErrorRequestHandler } from 'express';

const serviceAccount = require("./.data/firestore.json");

const app = express();
const port = process.env.PORT || 58808;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fcc-backend.firebaseio.com"
});

const db = admin.firestore();
const links = db.collection('fcc-shortener');

app.get('/new/*', (req, res) => {
  const path = new URL(decodeURI(req.path.slice(5)));
  links.where('original_url', '==', path.toString()).get()
    .then((snapshot) => {
      if (snapshot.empty) {
        const doc = links.doc();
        doc.set({ original_url: path.toString(), key: doc.id }, { merge: true })
          .then(result => res.send({ original_url: path.toString(), key: doc.id }));
      } else {
        res.send(snapshot.docs[0].data());
      }
    });
});

app.get('/:url', (req, res) => {
  links.doc(req.params.url).get().then((snapshot) => {
    if (snapshot.exists) {
      res.redirect(snapshot.data().original_url);
    } else {
      res.status(404).send('Shortened URL not found');
    }
  })
});

app.get('/', (req, res) => {
  res.send('Please go to /new/:url: to receive a shortened key, or go to /:key: to navigate to your chosen address.');
});


app.use((err: Error, req: express.Request, res: express.Response, next: express.ErrorRequestHandler) => {
  // console.log(err);
  res.status(500).send({ message: 'Oops, something broke.',  error: err });
})

const server = app.listen(port, () => {
  console.log('Listening on port ' + port + '! ' + new Date(Date.now()));
});
