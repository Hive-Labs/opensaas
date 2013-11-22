module.exports = function (settings) {
  var cradle = require('cradle');
  return {
    entity: require('./entity')(settings),
    schema: require('./schema')(this.entity, settings)
  };
};
