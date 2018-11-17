var express = require('express')
var app = express()
var firebase = require("firebase");

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAvZa2qG10RV63Hy90NWy0K7d5eWycS1AA",
    authDomain: "invertible-now-222800.firebaseapp.com",
    databaseURL: "https://invertible-now-222800.firebaseio.com",
    projectId: "invertible-now-222800",
    storageBucket: "invertible-now-222800.appspot.com",
    messagingSenderId: "556107747776"
  };
  firebase.initializeApp(config);

app.set('port', (process.env.PORT || 8000))
  .use(express.static(__dirname + '/public'))
  .use(express.urlencoded({extended:true}))
  .use(express.json())
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .get('/', main)
  .get('/create', create)
  .get('/account', account)
  .post('/createaccount', createaccount)
  .get('*', send404)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

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

function createaccount(req, res){
  var email = req.body.email;
  var password= req.body.password;
  console.log(email, password)

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    console.log(error.code);
    console.log(error.message);
 });

 res.redirect("/");
}

function send404(req, res) {
  res.render('pages/404');
}
