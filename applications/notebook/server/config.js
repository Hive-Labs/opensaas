/*
    This file contains configuration information for the server side code
*/
config = {
    dbAppName: "notebooktest",
    dbRoutes: {
        notes: "notes/note",
        users: "users/user",
    },
    messages: {
        welcomeNotification: {
            type: 'text',
            text: "Welcome to the NoteBook app!",
            read: false,
            id: 0
        }
    },
    dbServerHost: "http://localhost",
    dbServerPort: "3000",
    authServerHost: "http://localhost",
    authServerPort: "4455",
    authClientID: "notebookLocal",
    authClientSecret: "google1",
    authRedirectURI: "http://localhost:5000",
    temporaryPaths: {
        profilePicture: 'profilePictures/'
    }
};