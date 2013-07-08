# API Service

The API service is a service that provides a global API for all applications to access.  Applications can call to the API service to handle all a variety of common tasks that are existant across applications.  In the API there is a built in API that comes by default, external apimodules (called plugins) can be added by hooking into the plugin system of the API so that applications can expose their actions to many applications.

# Plugin System

Plugins can be either manually added or automatically pulled as dependencies of other applications.
