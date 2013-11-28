/**
 * Module dependencies.
 */
var passport = require('passport'),
	login = require('connect-ensure-login');


	exports.index = function(req, res) {
		res.send('Hello ' + req.user.displayName);
	};

exports.loginForm = function(req, res) {
	res.render('login');
};

exports.login = passport.authenticate('local', {
	successReturnToOrRedirect: '/',
	failureRedirect: '/login'
});
exports.googleAuth = passport.authenticate('google', {
	successReturnToOrRedirect: '/',
	failureRedirect: '/login'
});

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
};

exports.account = [

function(req, res) {
	res.render('account', {
		user: req.user
	});
}];