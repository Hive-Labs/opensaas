module.exports = function (persistent, cache) {
  return {
    entity: require('./entity')(persistent, cache),
    db: require('./db')(this.entity),
    schema: require('./schema')(this.entity)
  };
}
