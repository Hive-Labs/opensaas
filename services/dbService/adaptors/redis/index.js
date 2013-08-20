module.exports = function (settings) {
  var redis  = require('redis'),
      client = redis.createClient();

  return {
    entity: require('./entity')(client)
  };
};
