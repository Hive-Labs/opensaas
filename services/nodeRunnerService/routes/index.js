exports.index = function(req, res) {
  res.end('hello world! I am the node runner service.')
};

exports.kill = function(req, res) {
  res.end('Goodbye!');
  process.exit(0);
};
