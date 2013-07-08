var mongoose = require('mongoose');


var clientAppsSchema = mongoose.Schema({
  clientId: String,
  clientSecret: String
});
