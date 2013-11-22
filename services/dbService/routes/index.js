module.exports = function (adaptors) {
  return {
    entity: require('./entity')(adaptors.persistent, adaptors.cache),
    db: require('./db')(this.entity),
    schema: require('./schema')(this.entity)
  };
}
