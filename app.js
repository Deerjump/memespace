const express = require('express');
const app = express();
const multer = require('multer');
const memoryStorage = multer.memoryStorage;
const {Storage} = require('@google-cloud/storage');
const googleCloudStorage = new Storage({
  projectId: 556107747776,
});
const bucket = googleCloudStorage.bucket("memes2018");

const firebase = require('firebase');
var config = {
  apiKey: "AIzaSyAvZa2qG10RV63Hy90NWy0K7d5eWycS1AA",
  authDomain: "invertible-now-222800.firebaseapp.com",
  databaseURL: "https://invertible-now-222800.firebaseio.com",
  projectId: "invertible-now-222800",
  storageBucket: "invertible-now-222800.appspot.com",
  messagingSenderId: "556107747776"
};
firebase.initializeApp(config);

const m = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

app.set('port', (process.env.PORT || 8000))
  .use(express.static(__dirname + '/public'))
  .use(express.urlencoded({extended:true}))
  .use(express.json())
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .get('/', main)
  .get('/create', create)
  .get('/account', account)
  .post('/upload', m.single('file'), uploadFileToCloudStorage)
  .get('*', send404)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

async function uploadFileToCloudStorage(req, res, next) {
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on("error", err => {
    console.error(err);
  });

  blobStream.on("finish", () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    blob.makePublic().then(() => {
      res.status(200).json({url: publicUrl});
    });
  });

  blobStream.end(req.file.buffer);
}

function main(req, res) {



  var images = [
    {
      name: "Wow this a cool meme",
      date: "2018-11-16",
      url: "https://storage.googleapis.com/memes2018/alphameme.jpg"
    },
    {
      name: "Another true gem",
      date: "2218-11-16",
      url: "https://storage.googleapis.com/memes2018/dankness.jpg"
    }
  ]
  res.render('pages/index.ejs', {images: images});
}

function create(req, res) {
  res.render('pages/create.ejs');
}

function account(req, res){
  res.render('pages/account.ejs')
}

function send404(req, res) {
  res.render('pages/404');
}
