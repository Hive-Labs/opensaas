# Open SAAS

Intro to Open SAAS here...

# Getting Started First Time

To get a basic test server working on a single machine, follow the below steps. They can be adapted for multiple nodes and production machines too.

		#Make a notoja folder and put this in it

		rm -rf ~/notoja

		mkdir ~/notoja

		cd ~/notoja

		git clone http://git.notoja.com/notoja_saas/notoja-saas.git

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

At this point, follow the on-screen instructions:

		Welcome! This seems to be your first time because you have not yet setup your server configuration file. I will ask you a series of questions and automatically create this for you (how nice of me).
		1) How many machines would you like to register?: 1
		2) OK. What is the location of the dbService (eg. localhost:2001): localhost:2001
		4a) What is the IP of machine 1? (eg. localhost): localhost
		4b) What is the SSH username of machine 1? (eg. steve): someUser
		4c) What is the SSH password of machine 1? (eg. fluffybunnies): somePassword
		4d) Where is the nodeRunnerService located in machine 1? (eg. ~/notoja/notoja-saas/services/nodeRunnerService/server.js): ~/notoja/notoja-saas/services/nodeRunnerService/server.js
		4e) Where is the start port for machine 1? (eg. 3000): 3000 
		4f) Where is the finish port for machine 1? (eg. 3400): 3400
		THANKS! I have made a file called ServerConfiguration.json and I will remember this next time.


 and wait 1-2 minutes after competion for the orchestrator management app (web frontend) to come up. This can be accessed at: http://localhost:4000





