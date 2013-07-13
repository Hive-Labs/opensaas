## Node modules for Notoja

These modules expose a NodeJs API for services to use and connect to other services within the cluster.

To add a module:

  1) Add "require('../notoja_modules/SERVICE_NAME/')" inside the service you want to add a module to

  2) Install the module
      
            cd SERVICE_NAME
            npm install -g .