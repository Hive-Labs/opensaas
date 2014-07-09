# Open SAAS

Intro to Open SAAS here...

# Getting Started First Time

To get a basic test server working on a single machine, follow the below steps. They can be adapted for multiple nodes and production machines too.

		#Make a hive folder and put this in it

		rm -rf ~/hive

		mkdir ~/hive

		cd ~/hive

		git clone ssh://git@stash.hivelabs.it:7999/os/master.git opensaas

		#Setup the node runner service

		cd opensaas/services/nodeRunnerService

		sudo chown -R $(whoami):$(whoami) /usr/local/lib/node_modules

		sudo chown -R $(whoami):$(whoami) ~/.npm

		npm link ../../notoja_modules/dbService #Point npm to the dbService module

		npm install #Update any dependencies

		#Setup the orchestrator management app

		cd ../../applications/orchestratorServiceManagement

		sudo npm install -g grunt grunt-cli

		npm install #Update any dependencies

		grunt build #Perform minification and generate a tar

		cp orchestratorServiceManagement.tar.gz ../../services/orchestratorService/apps/		#Copy the output tar to the orchestrator service

		#Setup the orchestrator service

		cd ../../services/orchestratorService/

		npm link ../../notoja_modules/dbService

		npm install #Update dependencies for orchestrator service

		sudo apt-get install expect #Expect is needed for node.js SSH module

		sudo apt-get install openssh-server #OpenSSH is needed to ssh into the node runner service machine and start it.

		echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

		cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
		chmod 600 ~/.ssh/authorized_keys


		grunt #Start the orchestrator app and monitor any file changes

At this point, follow the on-screen instructions:

		Welcome! This seems to be your first time because you have not yet setup your server configuration file. I will ask you a series of questions and automatically create this for you (how nice of me).
		1) How many machines would you like to register?: 1
		2) OK. What is the location of the dbService (eg. localhost:2001): localhost:2001
		4a) What is the IP of machine 1? (eg. localhost): localhost
		4b) What is the SSH username of machine 1? (eg. steve): someUser
		4c) What is the SSH password of machine 1? (eg. fluffybunnies): somePassword
		4d) Where is the nodeRunnerService located in machine 1? (eg. ~/hive/hive-saas/services/nodeRunnerService/server.js): ~/hive/hive-saas/services/nodeRunnerService/server.js
		4e) Where is the start port for machine 1? (eg. 3000): 3000 
		4f) Where is the finish port for machine 1? (eg. 3400): 3400
		THANKS! I have made a file called ServerConfiguration.json and I will remember this next time.


 and wait 1-2 minutes after competion for the orchestrator management app (web frontend) to come up. This can be accessed at: http://localhost:4000





