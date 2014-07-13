var clients = [{
    _id: '1',
    name: 'Orchestrator Service Management',
    clientId: 'orchestratorManagement',
    clientSecret: 'google1',
    redirectURI: 'http://heartbeat.hivelabs.it'
}, {
    _id: '2',
    name: 'Orchestrator Service Management',
    clientId: 'orchestratorManagementLocal',
    clientSecret: 'google1',
    redirectURI: 'http://localhost:2002/app/orchestratorServiceManagement/'
}, {
    _id: '3',
    name: 'Notebook',
    clientId: 'notebookLocal',
    clientSecret: 'google1',
    redirectURI: 'http://localhost:5000'
}, {
    _id: '4',
    name: 'Notebook',
    clientId: 'notebook',
    clientSecret: 'google1',
    redirectURI: 'http://notebook.hivelabs.it'
}];


exports.find = function(id, done) {
    for (var i = 0, len = clients.length; i < len; i++) {
        var client = clients[i];
        if (client._id === id) {
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