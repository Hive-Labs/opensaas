module.exports = function (adaptors) {
  return {
    entity: require('./entity')(adaptors.persistent, adaptors.cache),
    db: require('./db')(adaptors.persistent, adaptors.cache),
    schema: require('./schema')(this.entity)
  };
}
