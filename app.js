const express = require('express');
const app = express();
const multer = require('multer');
const memoryStorage = multer.memoryStorage;
const {Storage} = require('@google-cloud/storage');
const googleCloudStorage = new Storage({
  projectId: 556107747776,
});
const bucket = googleCloudStorage.bucket("memes2018");
const stream = require('stream');

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
  .use(express.json({limit: '100mb'}))
  .use(express.urlencoded({extended:true, limit: '100mb'}))
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .get('/', main)
  .get('/create', create)
  .get('/loginpage', loginpage)
  .get('/newaccount', newaccount)
  .get('/signout', signout)
  .post('/login', login)
  .post('/createaccount',createaccount)
  .post('/upload', m.single('file'), uploadFileToCloudStorage)
  .get('*', send404)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

async function uploadFileToCloudStorage(req, res, next) {
  const blob = bucket.file((new Date()).getTime() + req.file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  })
  .on("error", err => {
    console.error(err);
  })
  .on("finish", () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    blob.makePublic().then(() => {
      firebase.database().ref('/memes').push({
        url: publicUrl,
        date: new Date().toLocaleDateString(),
        name: req.body.name
      });
      res.redirect('/');
    });
  })
  .end(req.file.buffer);
}

function main(req, res) {

  var user = firebase.auth().currentUser;
  var loggedin;
  if (user) {
    loggedin = true;
  } else {
    loggedin = false;
  }

  var images = [];
  firebase.database().ref('/memes').once('value').then((snapshot) => {
    var arr = snapshot.val();
    for (k in arr) {
      images.push({
        name: arr[k].name,
        date: arr[k].date,
        url: arr[k].url
      });
    }
    res.render('pages/index.ejs', {images: images, loggedin: loggedin});
  });
}

function newaccount(req, res) {
  var user = firebase.auth().currentUser;
  var loggedin;

  if (user) {
    loggedin = true;
  } else {
    loggedin = false;
  }

  res.render('pages/newaccount.ejs', {loggedin: loggedin});
}

function create(req, res){
  var user = firebase.auth().currentUser;
  var loggedin;

  if (user) {
    loggedin = true;
  } else {
    loggedin = false;
  }

  res.render('pages/create.ejs', {loggedin: loggedin})
}

function loginpage(req, res){
  var user = firebase.auth().currentUser;
  var loggedin;

  if (user) {
    loggedin = true;
  } else {
    loggedin = false;
  }

  res.render('pages/login.ejs', {loggedin: loggedin})
}

function createaccount(req, res){
  var email = req.body.email;
  var password = req.body.password;
  var username = req.body.username;

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error.code);
    console.log(error.message);
  });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      res.redirect("/");
    } else {
      // No user is signed in.
    }
    });
}

function login(req,res){
  var email = req.body.email;
  var password = req.body.password;

  firebase.auth().signInWithEmailAndPassword(email, password);
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      res.redirect("/");
    } else {
      // No user is signed in.
    }
    });
}

function signout(req,res){
  firebase.auth().signOut().then(function() {
    console.log("Logged out!")
    res.redirect('/loginpage')
}, function(error) {
    console.log(error.code);
    console.log(error.message);
 });
}

function send404(req, res) {

  var user = firebase.auth().currentUser;
  var loggedin;

  if (user) {
    loggedin = true;
  } else {
    loggedin = false;
  }

  res.render('pages/404', {loggedin:loggedin});
}
