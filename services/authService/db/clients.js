var clients = [
    { id: '1', name: 'Orchestrator Service Management', clientId: 'orchestratorManagement', clientSecret: 'google1' , redirectURI: 'http://dev1.notoja.com:2002/app/orchestratorServiceManagement'},
    { id: '2', name: 'Orchestrator Service Management', clientId: 'orchestratorManagementLocal', clientSecret: 'google1' , redirectURI: 'http://dev1.notoja.com:2002/app/orchestratorServiceManagement'}
];


exports.find = function(id, done) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.id === id) {
      return done(null, client);
    }
  }
  return done(null, null);
};

exports.findByClientId = function(clientId, done) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.clientId === clientId) {
      return done(null, client);
    }
  }
  return done(null, null);
};
