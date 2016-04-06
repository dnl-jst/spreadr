# spreadr

[![Travis](https://img.shields.io/travis/dnl-jst/spreadr.svg)](https://travis-ci.org/dnl-jst/spreadr) [![David](https://img.shields.io/david/dnl-jst/spreadr.svg)](https://david-dm.org/dnl-jst/spreadr) [![npm](https://img.shields.io/npm/v/spreadr.svg)](https://www.npmjs.com/package/spreadr)

spread http(s) requests to different hosts based on hostname with http2 and sni ssl support

## features

- define any number of virtual hosts containing any number of aliases
- define non-ssl and ssl target-hostname
- allow to define specific port for non-ssl and ssl target
- define ssl-context per virtual host, allowing to forward ssl-requests (sni, server name indication)
- define whether to allow invalid certificates on ssl target host (per virtual host)
- http/2 support (via NPN and ALPN)
- support for multiple cpu-cores, will spawn as many workers as cpu-cores available

## how-to use

Clone repository, look at configs/example.org.json and define as many additional files as you want.

When done, fire up spreadr with

	sudo node spreadr.js

You need to sudo because spreadr listens on port 80 & 443 and you need root access to bind on ports lower than 1024. If you want to listen on other ports, you may want to edit the spreadr.json file in root folder.

### run as docker container

Pull latest docker image:

    docker pull dnljst/spreadr

Start your machine:

    docker run -d -p 80:80 -p 443:443 --name my-spreadr-container dnljst/spreadr

This command creates a new docker container based on the spreadr image named "my-spreadr-container" and exposes ports 80 and 443 to the new container.
