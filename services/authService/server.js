// library imports
var engine = require('ejs-locals'),
  express = require('express'),
  email = require('./lib/email'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  MemoryStore = express.session.MemoryStore,
  mongoose = require('mongoose'),
  passport = require('passport'),
  user = require('./user'),
  dbService = require("dbService"),
  winston = require('winston');

// setup the logger
global.logger = new winston.Logger({
  transports: [
    new(winston.transports.Console)({
      handleExceptions: true
    })
  ],
  exitOnError: false
});

logger.cli();

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

logger.info('Running the Notoja Authentication Server on port ' + settings.server.port);

//Application name must be lower case due to limits in couchdb
dbService.init("127.0.0.1", 3000, "authservice");


var db = require("./db")(dbService, logger);

db.users.init(function() {
  require('./auth')(dbService, db);
  var site = require('./site')(db);
  var oauth2 = require('./oauth2')(dbService, db);
  app.get('/', ensureAuthenticated, site.index);
  app.get('/login', site.loginForm);
  app.get('/users', ensureAuthenticated, site.usersForm);
  app.post('/user', ensureAuthenticated, site.newUser);
  app.del('/user', ensureAuthenticated, site.removeUser);
  app.post('/login', site.login);
  app.get('/logout', site.logout);
  app.get('/account', ensureAuthenticated, site.account);
  app.get('/auth/google', site.googleAuth);

  app.get('/dialog/authorize', oauth2.authorization);
  app.post('/dialog/authorize/decision', oauth2.decision);
  app.post('/oauth/token', oauth2.token);
  app.get('/auth/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login?loginFailed=true'
  }));

  app.get('/api/user', user.info);

  //////////////////  Have the express server listen on the specified port  //////////////////
  if (settings.security.ssl.enable === true) {
    logger.info('Running in SSL Protected mode: ');
    logger.info('Using SSL Key ' + settings.security.ssl.key);
    logger.info('Using SSL cert ' + settings.security.ssl.cert);

    var ssl_options = {
      key: fs.readFileSync(settings.security.ssl.key),
      cert: fs.readFileSync(settings.security.ssl.cert)
    };

    https.createServer(ssl_options, app).listen(settings.server.port);
  } else {
    logger.info('Running in plaintext mode');
    http.createServer(app).listen(settings.server.port);
  }
});

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