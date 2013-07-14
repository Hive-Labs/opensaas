
//Unimplimented
exports.get = function(collectionName, entityType, entityId) {
  console.log("Get entity by id");
};
//Unimplimented
exports.get = function(collectionName, entityType) {
  var runner = {
    runnerId: 'id',
    runnerName: 'name',
    runnerIp: 'ip'
  }
  return [runner];
  console.log("Get entity by type");
};
//Unimplimented
exports.set = function(collectionName, entityType, entityId) {
  console.log("Set entity by id");
};
//Unimplimented
exports.set = function(collectionName, entityType) {
  console.log("Adding " + JSON.stringify(entityType) + " to " + collectionName);
  console.log(process.env.configFile);
};
//Unimplimented
exports.remove = function(collectionName, entityType) {
  console.log("Remove entity by type");
};
//Unimplimented
exports.remove = function(collectionName, entityType, entityId) {
  console.log("Remove entity by id");
};