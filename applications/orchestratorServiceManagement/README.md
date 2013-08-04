#Orchestrator Service Management

This is the sample app included in the Open Saas project that will provide a web ui frontend for the orchestrator service.

#How To Run

Although this is intended to be run on the Open Saas framework, it can also be run as a standalone app. 

		cd notoja-saas/applications/orchestratorServiceManagement/app_codebase
		sudo npm install
		grunt build

At this point, there will be a .tar.gz archive which can be deployed on to an orchestrator. However, to run as a standalone app, do the following:

		cd notoja-saas/applications/orchestratorServiceManagement
		sudo npm install
		node app.js

The frontend ui will be now running by default at: http://localhost:4000