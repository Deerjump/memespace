var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 8000))
  .use(express.static(__dirname + '/public'))
  .use(express.urlencoded({extended:true}))
  .use(express.json())
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .get('/', main)
  .get('/create', create)
  .get('/account', account)
  .get('*', send404)
  .listen(app.get('port'), () => console.log('Listening on ' + app.get('port')));

function main(req, res) {
  res.render('pages/index.ejs');
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
