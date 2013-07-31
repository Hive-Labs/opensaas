var runner;

exports.init = function(runner){
	this.runner = runner;
}

exports.runner = runner;

exports.index = function(req, res) {
  res.end('hello world! I am the node runner service.')
};

exports.kill = function(req, res) {
  res.end('Goodbye!');
  process.exit(0);
};

exports.log = function(req, res){
	exports.runner.readLog(function callback(data){
		res.end(data);
	});
}

