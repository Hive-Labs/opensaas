var engine = require('ejs-locals'),
    express = require('express'),
    email = require('./lib/email'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),    
    mongoose = require('mongoose'),
    passport = require('passport'),
    user = require('./user'),
    dbService = require("dbService"),
    winston = require('winston'),
    providers = [],
    models = require('./lib/models'),
    User = models.UserModel,
    settings = require('./config.json'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    expressValidator = require('express-validator'),
    MemoryStore = session.MemoryStore,
    app = express();

//  Setup the logger
global.logger = new winston.Logger({
    transports: [
        new(winston.transports.Console)({
            handleExceptions: true
        })
    ],
    exitOnError: false
});

//  Pretty-print the output
logger.cli();

// Load all express middleware
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
//app.use(morgan("combined"));
app.use(bodyParser());
app.use(express.query());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
    store: new MemoryStore({
        reapInterval: 5 * 60 * 1000
    }),
    secret: settings.security.sessionPassword
}));
app.use(passport.initialize());
app.use(passport.session());

logger.info('Running the Hive Authentication Server on port ' + settings.server.port);

// Application name must be lower case due to limits in couchdb
dbService.init("127.0.0.1", 3000, "authservice");

var db = require("./db")(dbService, logger);

db.users.init(function() {
    //  Read in an list of authentication providers (UML)
    readProviders();
    require('./auth')(dbService,providers, db);
    var jabber = require('./jabberAuth.js')(db);
    var site = require('./site')(db);
    var oauth2 = require('./oauth2')(dbService, db);
    app.get('/', ensureAuthenticated, site.index);
    app.get('/login', site.loginForm);
    app.get('/users', ensureAuthenticated, site.usersForm);
    app.post('/user', ensureAuthenticated, site.newUser);
    app.delete('/user', ensureAuthenticated, site.removeUser);
    app.post('/login', site.login);
    app.get('/logout', site.logout);
    app.get('/account', ensureAuthenticated, site.account);

    app.get('/dialog/authorize', oauth2.authorization);
    app.post('/dialog/authorize/decision', oauth2.decision);
    app.post('/oauth/token', oauth2.token);

    app.get('/api/user', user.info);
    app.put("/api/user", passport.authenticate('bearer', {
        session: false
    }),  site.updateUser);
    app.post("/login/jabber",  jabber.jabberLogin);


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
        if(providerList[i].enabled){
            var provider = require('./providers/' + providerList[i].type + ".js");
            provider.init(providerList[i].settings);
            console.log("Adding " + providerList[i].name);
            providers.push(provider);
        }
    }
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.returnTo = req.path;
    res.redirect('/login');
}