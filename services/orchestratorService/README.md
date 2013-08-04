# Orchestrator

The orchestrator service monitors traffic and availability on each of the application runner nodes.  If a node is down or experiencing high traffic it's job is seek out a new node (if available) and ask the packaging service to populate that node with a new copy of that application. 


# Packaging Server

The server that handles all saved application data.  It is responsible for downloading applications from the centralized notoja application distribution server and populating runner nodes with applications at the request of the orchestrator.

# Running the orchestrator server

	cd notoja-saas/services/orchestratorService/

    sudo npm link ../../notoja_modules/dbService

    sudo npm install

    sudo apt-get install expect

    sudo apt-get install openssh-server

    grunt

You can now navigate to http://localhost:2000 to access this server's api calls, or you can access the frontend UI by navigating to http://localhost:4000