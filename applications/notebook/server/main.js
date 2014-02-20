/*
	We modified the default meteor main.js to include futures
	for asyncronous code calls.
*/
Meteor.startup(function() {
    Future = Npm.require('fibers/future');
    Users.remove({});
    Documents.remove({});
});