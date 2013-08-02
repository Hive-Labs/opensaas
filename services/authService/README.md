# Auth Service

The auth service provides a simplistic OAuth2 based authentication system for all applications.  The authentication system is used in multiple contexts.  The first is to authentication users to the application they are attemping to access.  The second is to authenticate applications to their host for activities such as accessing the database or making API calls.  Finally the Auth service authenticates the orchestrator with the notoja central application distribution server so that applications can be downloaded, updated or authenticate their liscensing.
