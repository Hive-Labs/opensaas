// library imports
var engine = require('ejs-locals'),
  express = require('express'),
  email = require('./lib/email'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  oauth2 = require('./oauth2'),
  MemoryStore = express.session.MemoryStore,
  mongoose = require('mongoose'),
  passport = require('passport'),
  user = require('./user'),
  site = require('./site');
// Models
var models = require('./lib/models'),
  User = models.UserModel;

// Application Settings
var settings = require('./config.json');

var app = express();

// load all express middleware
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.query());
app.use(express.cookieParser());
app.use(express.session({
  store: new MemoryStore({
    reapInterval: 5 * 60 * 1000
  }),
  secret: settings.security.sessionPassword
}));
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

console.info('Running the Notoja Authentication Server on port ' + settings.server.port);
// connect to the database and once connected setup the routes and start
// listening on the specified port
console.info('Making connection to the database at ' + settings.server.mongooseServer);

/*mongoose.connect(settings.server.mongooseServer);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
console.info('Successfully connected the the databse');*/

require('./auth');

app.get('/', ensureAuthenticated, site.index);
app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);
app.get('/account', ensureAuthenticated, site.account);
app.get('/auth/google', site.googleAuth);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);
app.get('/auth/google/callback', passport.authenticate('google', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login'
}));

app.get('/api/user', user.info);

//////////////////  Have the express server listen on the specified port  //////////////////
// app.listen(settings.server.port);
if (settings.security.ssl.enable === true) {
  console.info('Running in SSL Protected mode: ');
  console.info('Using SSL Key ' + settings.security.ssl.key);
  console.info('Using SSL cert ' + settings.security.ssl.cert);

  var ssl_options = {
    key: fs.readFileSync(settings.security.ssl.key),
    cert: fs.readFileSync(settings.security.ssl.cert)
  };

  https.createServer(ssl_options, app).listen(settings.server.port);
} else {
  console.info('Running in plaintext mode');
  http.createServer(app).listen(settings.server.port);
}
//});

function escapeEntities(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function validateUsername(username) {
  return username.length > 0;
}

function validateEmail(email) {
  var validEmailRegex = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/, i);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateNonExistingUser(user) {

}

function stripTrailingSlash(str) {
  if (str.substr(-1) == '/') {
    return str.substr(0, str.length - 1);
  }
  return str;
}

function readProviders() {
  var providerList = settings.providers;
  for (var i = 0; i < providerList.length; i++) {
    var provider = require('./providers/' + providerList[i].type + ".js");
    provider.init(providerList[i].settings);
    providers.push(provider);
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}