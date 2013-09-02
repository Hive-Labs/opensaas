module.exports = function (settings) {
  var redis  = require('redis'),
      client = redis.createClient();

  return {
    schema: require('./schema')(client),
    entity: require('./entity')(client)
  };
};
