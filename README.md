# Open SAAS

Intro to Open SAAS here...

# Getting Started First Time

To get a basic test server working on a single machine, follow the below steps. They can be adapted for multiple nodes and production machines too.

		#Setup the node runner service

		cd services/nodeRunnerService

		sudo npm link ../../notoja_modules/dbService #Point npm to the dbService module

		sudo npm install #Update any dependencies

		#Setup the orchestrator management app

		cd ../../applications/orchestratorServiceManagement/app_codebase

		sudo npm install #Update any dependencies

		grunt build #Perform minification and generate a tar

		cp orchestratorServiceManagement.tar.gz ../../../services/orchestratorService/apps/		#Copy the output tar to the orchestrator service

		cd ..

		sudo npm install  #Update dependencies for orchestrator management app

		#Setup the orchestrator service

		cd ../../services/orchestratorService/

		sudo npm link ../../notoja_modules/dbService

		sudo npm install #Update dependencies for orchestrator service

		sudo apt-get install expect #Expect is needed for node.js SSH module

		sudo apt-get install openssh-server #OpenSSH is needed to ssh into the node runner service machine and start it.

		grunt #Start the orchestrator app and monitor any file changes

At this point, follow the on-screen instructions and wait 1-2 minutes after competion for the orchestrator management app (web frontend) to come up. This can be accessed at: http://localhost:4000



