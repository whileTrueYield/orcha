# How to setup a backend server

## Host creation in EC2

use `us-west-1` as your region. create an EC2 medium, ubuntu image, with about 32GB of EBS storage.
Grant access to HTTP, HTTPS and SSH ports.
Download the `.pem` certificate and move it to your `$HOME/.ssh/` folder. You'll also need to restrict its access:

```sh
mv ~/Downloads/orcha-staging.pem ~/.ssh
chmod og-rwx .ssh/orcha-staging.pem
```

Once the key moved to the `.ssh` folder, add a config to your SSH client in the `$HOME/.ssh/config` file:

```
Host staging
Hostname ec2-54-91-242-96.compute-1.amazonaws.com
IdentityFile ~/.ssh/orcha-staging.pem
user ubuntu
```

The user is usually ubuntu for ubuntu distributions. The `Hostname` information can be gathered from the [listing page of the EC2 console](https://console.aws.amazon.com/ec2/v2/home?region=us-west-1#Instances:) under the `Public IPv4 DNS` section. This config will let you login to the EC2 instance using an alias (`staging`):

```sh
ssh staging
```

## Setting up the env

Let's start by installing `nginx` and the `build-essential` package (will be necessary to compile dependencies later)

```sh
sudo apt update
sudo apt install nginx build-essential
```

Followed by nodeJS 14 using a custom APT source:

```sh
cd ~
curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
```

verify the file content and then run it:

```sh
sudo bash nodesource_setup.sh
```

You can then install Node using APT:

```sh
sudo apt-get install -y nodejs
```

The package manager used for the Orcha project is yarn (instead of npm). To install yarn we'll use a custom repository managed by yarn itself:

```sh
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn
```

We'll also need to install PM2 in order to manage our application instance and
restart it in case of crash. We'll install pm2 using npm in global (available
to all users):

```sh
sudo npm install pm2@latest -g
```

## Application User

We will not run the application using the root user, instead we'll use a user
without a password called `webapp`. This user will host the application's code

```sh
sudo adduser --disabled-password webapp
```

We can now change to this user and add our public SSH key so we can
login to this account easily.

```sh
sudo su -l webapp
```

We will need our public RSA key to be visible to copy it to the new user. On **your
personal machine** run the following command to display your public key:

```sh
cat ~/.ssh/id_rsa.pub
```

On **the remote EC2 instance** we can now add that key. We'll start by creating
our own key first

```sh
ssh-keygen
```

We'll use this key (the public one) and add it to github as a **deploy key** (without write access) so we can easily clone the backend repository. To display the public key use the following command on the EC2 instance:

```sh
cat ~/.ssh/id_rsa.pub
```

Now we can also add the public key of our own machine to the remote instance:

```sh
vi ~/.ssh/authorized_keys
```

and copy our personal public RSA key into this file. On your personal machine, you can now add an app config section to login as `webapp` user:

```
Host staging-app
Hostname ec2-54-91-242-96.compute-1.amazonaws.com
user webapp
```

you may now connect to the `staging-app` instance as `webapp` using:

```sh
ssh staging-app
```

## DB services

If the instance is for testing, SQLite should be enough. Aside from it, you'll require
redis-server for caching (including sessions):

```sh
sudo apt install redis-server sqlite3 python
```

## Node server setup

We'll start by cloning the backend repository:

```sh
git clone git@github.com:orchalabs/orcha-backend.git
```

If everything went well we should be able to download all the node dependencies

```sh
cd ~/orcha-backend
yarn
```

and compire the typescript code to vanilla JS

```sh
yarn build
```

We will run the server using an ecosystem file so we can setup environment variables. This is the content of the `$HOME/ecosystem.config.js` file:

```js
module.exports = {
  apps: [
    {
      name: "orcha",
      cwd: "./orcha-backend",
      script: "./dist/server.js",
      watch: false,
      min_uptime: 5000,
      env: {
        PORT: 4000,
        NODE_ENV: "production",
        ORCHA_HOSTNAME: "api.dev-orcha.com",
        ORCHA_ALLOW_ORIGIN: "https://app.dev-orcha.com",
        ORCHA_SESSION_SECRET: "something-secret-right-here",
        ORCHA_DB_TYPE: "postgres",
        ORCHA_DB_URL: "postgres://webapp@localhost/webapp",
      },
    },
  ],
};
```

then run it using PM2

```sh
pm2 start $HOME/ecosystem.config.js
```

We can now make sure the server is running:

```sh
curl http://localhost:4000/graphql
```

you should get the following response:

```
GET query missing.
```

If everything is looking good, we can now setup the EC2 instance to launch the PM2 server on every startup

```sh
pm2 startup systemd
```

Which should output a command line to run as the `ubuntu` user, something like that:

```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u webapp --hp /home/webapp
```

## Nginx Reverse proxy setup

As the `ubuntu` user (we need sudo power) we'll setup nginx to pass every
connection to the node service.

```sh
sudo vi /etc/nginx/sites-enabled/default
```

And replace the content with the following:

```
server {
  listen 80 default_server;
  listen [::]:80 default_server;

  server_name api.dev-orcha.com;

  # redirect any request to root domain to the marketing website
  server_name dev-orcha.com;
  if ($host = dev-orcha.com) {
      return 301 https://www.$host$request_uri;
  }

  location / {
    # If you want basic auth protection
    # auth_basic “Restricted”;
    # auth_basic_user_file /etc/apache2/.htpasswd;

    # First attempt to serve request as file, then
    # as directory, then fall back to displaying a 404.
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-NginX-Proxy true;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## SSL Certificates

All data exchanged between our server and our client should be encrypted. We'll use
Let's encrypt service to provide us with a free SSL certificate and setup their auto renewal solution.

First we'll need to add an `A` record to our Route53 domain in the AWS console. The A record should point to the IP address of the machine.

| Record Name         | Type | Routing Policy | Value          |
| ------------------- | ---- | -------------- | -------------- |
| `api.dev-orcha.com` | `A`  | Simple         | `54.91.242.96` |

You'll have to wait for the domain to refresh prior to making a request to generate the SSL certificate. As the ubuntu user:

```sh
sudo snap install core; sudo snap refresh core
```

We can now install the `CERTBOT` utility:

```sh
sudo snap install --classic certbot
```

and make the certbot command global

```sh
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

And install the certificate. Make sure you do not have the redirect on the port 80 in the nginx config active yet, if so, remove the section and restore the previous nginx default config version.

```sh
sudo certbot --nginx
```

From now on, the certificate should auto-renew without you having anything to do (unless you were to change the `A` record on your DNS)

If everything goes as planned, CERTBOT should have udated your port 80 configs to redirect any traffic to the port 443, ensuring secure data exchange at all time.

## Postgres Database

Orcha is expected to run on Postgres. That being said, you should also be able to use SQLite for dev and testing and also on a test box on the cloud. For staging boxes, we'll want to stick to an architecture as close as possible to production and using Postgres is therefore recommended. To install it on ubuntu use the following:

```sh
sudo apt update
sudo apt install postgresql postgresql-contrib
```

You can then start managing it by using the postgres user (you can also switch to postgres user `sudo su postgres`).

Lets start by creating a `webapp` user

```sh
sudo -u postgres createuser --no-createdb --no-superuser --no-createrole --pwprompt webapp
```

and a `webapp` database

```sh
sudo -u postgres createdb webapp
```
