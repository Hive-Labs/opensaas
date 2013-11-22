module.exports = function (settings) {
  var cradle = require('cradle');
  cradle.setup(settings);

  return {
    entity: require('./entity')(new(cradle.Connection), settings),
    schema: require('./schema')(this.entity, settings)
  };
};
