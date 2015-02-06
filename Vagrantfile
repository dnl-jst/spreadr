# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "ubuntu/trusty64"
  config.vm.provision :shell, path: "vagrant/provision.sh"
  config.vm.hostname = "spreadr"
  config.vm.network "private_network", ip: "192.168.33.80"
  config.hostsupdater.aliases = ["spreadr.local"]

end
