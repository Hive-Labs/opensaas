module.exports = function (settings, logger) {
  var cradle = require('cradle');
  cradle.setup(settings);

  return {
    entity: require('./entity')(new(cradle.Connection), settings, logger),
    schema: undefined
  };
};
