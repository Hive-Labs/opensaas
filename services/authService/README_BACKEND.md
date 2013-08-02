# Running

The backend is running off express and a couple of simple modules (jade, oauth2-provider, stylus) and here are the steps to running it.

Before you can get all hunky dory, you need to add a line to your hosts file to make it work. We are doing this because it will be more consistent and clean across all development machines for Notoja.

  $ sudo vim /etc/hosts
  Make sure first line looks like below:
  127.0.0.1       localhost local.notoja.com
  Save and quit vim

Next, you can download the source files and run them

  $ git clone http://gitlab.notoja.com/notoja/backend.git
  $ cd backend
  $ sudo npm install
  $ node app.js

# How it works

More on this later this week...