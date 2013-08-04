# Open SAAS

Intro to Open SAAS here...


# Getting Started First Time

To get a basic test server working on a single machine, follow the below steps. They can be adapted for multiple nodes and production machines too.

		#Setup the node runner service

		cd services/nodeRunnerService

		sudo npm link ../../notoja_modules/dbService

		sudo npm install

		#Setup the orchestrator management app

		cd ../../applications/orchestratorServiceManagement/app_codebase

		sudo npm install

		grunt build

		cp orchestratorServiceManagement.tar.gz ../../../services/orchestratorService/apps/		

		cd ..

		sudo npm install

		#Setup the orchestrator service

		cd ../../services/orchestratorService/

		sudo npm link ../../notoja_modules/dbService

		sudo npm install

		sudo apt-get install expect

		sudo apt-get install openssh-server

		grunt

At this point, follow the on-screen instructions and wait 1-2 minutes after competion for the orchestrator management app (web frontend) to come up. This can be accessed at: http://localhost:4000



