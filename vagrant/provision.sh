# install nodesource key
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -

# install repos
echo 'deb https://deb.nodesource.com/node_4.x trusty main' > /etc/apt/sources.list.d/nodesource.list
echo 'deb-src https://deb.nodesource.com/node_4.x trusty main' >> /etc/apt/sources.list.d/nodesource.list

# update package lists
apt-get update

# install nodejs 4.x
apt-get install -y nodejs
