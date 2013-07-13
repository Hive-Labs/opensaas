// library imports
var OAuth2Provider      = require('oauth2-provider/index').OAuth2Provider,
           engine       = require('ejs-locals'),
           express      = require('express'),
           email        = require('./lib/email'),
           fs           = require('fs'),
           http         = require('http'),
           https        = require('https'),
           MemoryStore  = express.session.MemoryStore,
           mongoose     = require('mongoose');
           

// Models
var models = require('./lib/models'),
    User   = models.UserModel;

// Application Settings
var settings = require('./config.json');


// hardcoded list of <client id, client secret> tuples
var myClients = {
 'notoja-frontend': '1secret',
};

// temporary grant storage
var myGrants = {};
var myOAP = new OAuth2Provider({crypt_key: settings.security.oAuthCryptKey, sign_key: settings.security.oAuthSigningSecret});



var app = express();

// load all express middleware
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.query());
app.use(express.cookieParser());
app.use(express.session({store: new MemoryStore({reapInterval: 5 * 60 * 1000}), secret: settings.security.sessionPassword }));
app.use(myOAP.oauth());
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.static(__dirname + '/public'));
app.use(myOAP.login());


console.info('Running the Notoja Authentication Server on port ' + settings.server.port);
// connect to the database and once connected setup the routes and start
// listening on the specified port
console.info('Making connection to the database at ' + settings.server.mongooseServer);

mongoose.connect(settings.server.mongooseServer);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.info('Successfully connected the the databse');

  /////////////////////////////////  OAP ROUTES  ////////////////////////////////
  
  // This is a step in the oAuth procedure
  myOAP.on('enforce_login', function(req, res, authorize_url, next) {
    //If user is already logged in, no need to do oAuth
    if(req.session.user) {
      next(req.session.user);
    } else {
      //Redirect them to the login page
      res.writeHead(303, {Location: '/login?next=' + encodeURIComponent(authorize_url)});
      res.end();
    }
  });
  
  // Render the authorize form (Do you want notebook to access your credit cards?)
  // TODO: Replace this inline html with a real file (similar to how login.ejs is done)
  myOAP.on('authorize_form', function(req, res, client_id, authorize_url) {
  
  var next_url = req.query.next ? req.query.next : '/';
    next_url = stripTrailingSlash(next_url);
    res.render('authorize.ejs', {authorize_url: authorize_url});
  });
  

  // This is called once oAuth is complete and we are saving the grant given to a client.
  myOAP.on('save_grant', function(req, client_id, code, next) {
    if(!(req.session.user in myGrants))
      myGrants[req.session.user] = {};
  
    myGrants[req.session.user][client_id] = code;
    next();
  });
  
  // When this is called, oAuth is complete and there is no need for a grant anymore
  // since there is now an access_token.
  myOAP.on('remove_grant', function(user_id, client_id, code) {
    if(myGrants[user_id] && myGrants[user_id][client_id])
      delete myGrants[user_id][client_id];
  });
  
  // When this is called, oAuth is trying to verify whether a grant code corresponds
  // to a given client_id and client_secret
  myOAP.on('lookup_grant', function(client_id, client_secret, code, next) {
    // verify that client id/secret pair are valid
    if(client_id in myClients && myClients[client_id] == client_secret) {
      for(var user in myGrants) {
        var clients = myGrants[user];
        if(clients[client_id] && clients[client_id] == code)
          return next(null, user);
      }
    }
    next(new Error('no such grant found'));
  });
  
 //  Generate an access token for a given user.
 //  TODO: Embed within the access token the permission levels for that user.
 //        eg. whether the user is an administrator, a developer, etc.
  myOAP.on('create_access_token', function(user_id, client_id, next) {
    var data = 'blah'; // can be any data type or null
  
    next(data);
  });
  

  // TODO: Save the access token to a database and do something with it...
  myOAP.on('save_access_token', function(user_id, client_id, access_token) {
   
  });
  
  // An access token was received in a URL query string parameter or HTTP header.
  // Make sure this token was valid. If so, save user data to session.
  // TODO: If not, bring them to the login page.
  myOAP.on('access_token', function(req, token, next) {
    var TOKEN_TTL = 10 * 60 * 1000; // 10 minutes
  
    if(token.grant_date.getTime() + TOKEN_TTL > Date.now()) {
      req.session.user = token.user_id;
      req.session.data = token.extra_data;
    } else {
      //Access token has expired
    }
    next();
  });
  
  // (optional) client authentication (xAuth) for trusted clients
  myOAP.on('client_auth', function(client_id, client_secret, username, password, next) {
    if(client_id == '1' && username == 'guest') {
      var user_id = '1337';
      return next(null, user_id);
    }
    return next(new Error('client authentication denied'));
  }); 

  ////////////////////////////  Public REST API  ////////////////////////////////////
  app.get('/', function(req, res, next) {
    console.dir(req.session);
    res.end('home, logged in? ' + !!req.session.user);
  });
  
  // If logged in, redirect to /. 
  // If not, display the login.ejs page.
  app.get('/login', function(req, res, next) {
    if(req.session.user) {
      res.writeHead(303, {Location: '/'});
      return res.end();
    }
    var next_url = req.query.next ? req.query.next : '/';
    next_url = stripTrailingSlash(next_url);
    res.render('login.ejs', {next_url: next_url});
  });

  
  // This is a post request (invoked when user click "login" button).
  // TODO: Do some database checking here to make sure req.body.username
  //       and req.body.password are valid.
  app.post('/login', function(req, res, next) {
    // Check to see if the username and password are valid
    if(req.body.username == 'emarcoux') {
      res.writeHead(303, {Location: req.body.next || '/'});
      req.session.user = req.body.username;
      res.end();
    } else { // redirect them back to the login page if their creds are invalid
      res.writeHead(303, {Location: '/login' });
      res.end();
    }
  });
 

  // Destroy the user's session and redirect them back to home page.
  app.get('/logout', function(req, res, next) {
    req.session.destroy(function(err) {
      res.writeHead(303, {Location: '/'});
      res.end();
    });
  });
   
  
  ////////////////////////////////////////  API Routes  ////////////////////////////////////////
  // Validates that the user did login for testing purposes
  app.get('/api/auth_test', function(req, res, next) {
    if(req.session.user) {
      res.end(JSON.stringify({valid: true}));
    } else {
      res.end(JSON.stringify({valid: false}));
    }
  });
 

  // Get detailed information on the extras stored in the user
  app.get('/api/user/get_user_info', function(req, res, next) {
    if(req.session.user) {
      res.end(JSON.stringify({fullName: req.session.user}));
    } else {
      res.writeHead(403);
    }
  });
 
  //  User is trying to get some app (like /app/notebook/index.html).
  //  Contact the packaging server and ask it for the app.
  //  TODO: Make sure that user is authenticated before giving them the app
  //  TODO: Make sure user has permission for that app before giving them the app
  app.get('/app/:appPath/*', function(context, res, next) {
     // If it was simply /notebook instead of /notebook/index.html, 
     // assume it was the latter
      if (context.params[0] === '') {
          context.params[0] = 'index.html';
      }
      // TODO: Do some authentication here to make sure that whoever is
      // asking for app is authorized to do so.
      http.get("http://local.notoja.com:4000/apps/" + context.params.appPath + 
                  "/" + context.params[0], function(result) {
        result.on('data', function (chunk) {
        res.end(chunk);        
        });
      });
  }); 
  
 // Invalidates the user's session (does not destroy their login tokens)
  app.get('/api/logout', function(req, res, next) {
    req.session.destroy(function(err) {
      res.end(JSON.stringify({success: true}));
    });
  });
 

  // Creates a traditional user account from the given information
  // Note: this does not set any extras on the user, only
  // the required fields to actually have an account
  // On success an email will be sent to the user to validate
  // their account
  // @param username - the user's username
  // @param email    - the user's email address
  // @param password - the hashed password of the new user
  app.post('/api/user/create', function(req, res, next) {
    var newUser = new User({ 
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

    if(validateEmail(newUser.email) && 
        validateUsername(newUser.username) &&
        validatePassword(newUser.password) &&
        validateNonExistingUser(newUser)) {

      newUser[activationKey] = newUser.generateActivationKey();
      newUser.save(function(err,user) {
        if(err){
          console.log('User save failed');
        }

        // send activation email to the user
        var activationEmail = settings.server.activationEmail;
        var templateData = {
          sender: activationEmail,
          to: newUser.email,
          subject: settings.server.activationSubject,
          activationKey: newUser.activationKey
        };
        email('activation', templateData);
      });
    } else {
      res.end('Invalid input');
    }
  });

  //////////////////  Have the express server listen on the specified port  //////////////////
  // app.listen(settings.server.port);
  if(settings.security.ssl.enable === true) {
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
});


function escapeEntities (s) {
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
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}
