var mongoose = require('mongoose');

var crypto = require('crypto'),
    shasum = crypto.createHash('sha1');

var userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String
});


// Generate a hash of the user's password
//
// @param password The user's plaintext password
// @param callback a function that takes a hashed password as a parameter
userSchema.methods.getHashedPassword = function(password, callback) {
  shasum.update(password);
  callback(shasum.digest('hex'));
};

var UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
