var runner;
var application;
var winston;

exports.winston = winston;

exports.init = function(runner, application, winston){
	this.runner = runner;
	this.application = application;
  this.winston = winston;
}

exports.runner = runner;
exports.application = application;

exports.index = function(req, res) {
  res.end('hello world! I am the node runner service.')
};

exports.kill = function(req, res) {
  res.end('Goodbye!');
  setTimeout(function(){
    exports.winston.log('info', 'Killing runner.');
    exports.runner.kill();
  }, 5000);
  exports.winston.log('info', 'Killing app...');
  exports.winston.log('info', exports.application);
  exports.application.kill();
};

exports.log = function(req, res){
	exports.runner.readLog(function callback(data){
		res.end(data);
	});
}
exports.status = function(req, res){
  exports.runner.getStatus(function callback(data){
    res.end(data);
  });
}

