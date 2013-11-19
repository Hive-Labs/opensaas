module.exports = function (settings) {
  return {
    entity: require('./entity')(settings),
    schema: require('./schema')(this.entity, settings)
  };
};
