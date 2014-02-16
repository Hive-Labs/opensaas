/*
    This file contains configuration information for the server side code
*/
config = {
    dbAppName: "notebook",
    dbRoutes: {
        notes: "notes/note",
        users: "users/user",
    },
    messages: [{
        type: 'text',
        welcomeNotification: "Welcome to the NoteBook app!"
    }],
    dbServerHost: "http://localhost",
    dbServerPort: "3000",
    authServerHost: "http://localhost",
    authServerPort: "4455",
    authClientID: "notebookLocal",
    authClientSecret: "google1",
    authRedirectURI: "http://localhost:5000"
};