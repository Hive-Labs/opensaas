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
    redirectURI: 'http://localhost:2002'
}, {
    _id: '3',
    name: 'Notebook',
    clientId: 'notebook',
    clientSecret: 'e2e3e380-1520-11e4-8c21-0800200c9a66',
    redirectURI: 'http://notebook.hivelabs.it'
}, {
    _id: '4',
    name: 'Notebook',
    clientId: 'notebooklocal',
    clientSecret: 'e2e3e380-1520-11e4-8c21-0800200c9a66',
    redirectURI: 'http://localhost:5000'
}, {
    _id: '5',
    name: 'daps',
    clientId: 'daps',
    clientSecret: '4db703a0-0bc5-11e4-9191-0800200c9a66',
    redirectURI: 'daps://login'
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