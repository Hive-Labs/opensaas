dependencies: 
	@#Install git
	@echo "Checking for git"
	@if ! which git -c >>/dev/null; then sudo apt-get -q -y install git; fi
	@#Install openssh-server
	@echo "Checking for openssh-server"
	@if ! which openssh-server -c >>/dev/null; then sudo apt-get -q -y install openssh-server; fi
	@#Install expect
	@echo "Checking expect"
	@if ! which expect -c >>/dev/null; then sudo apt-get -q -y install expect; fi
	@#Install NVM, NPM, and NODE
	@echo "Checking node"
	@if ! which node -c; then \
		echo "I found a node installation"; \
	else \
		echo "Installing node"; \
		rm -rf nvm; \
		git clone git://github.com/creationix/nvm.git >/dev/null; \
		. nvm/nvm.sh;\
		nvm install 0.10 >/dev/null; \
		nvm alias default 0.10 >/dev/null; \
		nvm use default >/dev/null; \
	fi
	@echo "===============ALL DEPENDENCIES INSTALLED==============="
update:
	@echo "Getting most updated version of open-saas"
	@git pull	
	@git fetch origin
	@echo "===============WORKING DIRECTORY UPDATED WITH GIT==============="
npm:
	@cd ../services/orchestratorService/; \
	pwd; \
	sudo npm link ../../notoja_modules/dbService; \
	sudo npm install; 
	
	@cd ../services/nodeRunnerService/; \
	pwd; \
	sudo npm link ../../notoja_modules/dbService; \
	sudo npm install; 

	@cd ../services/proxyService/; \
	pwd; \
	sudo npm link ../../notoja_modules/dbService; \
	sudo npm install; 
	@echo "==============='NPM INSTALL' FINISHED==============="

install: dependencies update npm

			

