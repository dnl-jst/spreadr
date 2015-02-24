var cluster = require('cluster'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    httpProxy = require('./lib/http_proxy.js'),
    constants = require('constants'),
    tls = require('tls');

var config = require(path.resolve(__dirname, 'configs/spreadr.json'));
var clientConfigs = {};

var vhostFolder = path.resolve(__dirname, 'configs/virtual_hosts/');
var vhostFolders = fs.readdirSync(vhostFolder);

for (var i = 0; i < vhostFolders.length; i++) {

    var configFile = vhostFolder + '/' + vhostFolders[i] + '/config.json';

    if (!fs.existsSync(configFile)) {
        continue;
    }

    var clientConfig = require(vhostFolder + '/' + vhostFolders[i] + '/config.json');

    if (clientConfig.https) {

        var secureContextOptions = {
            secureProtocol: 'SSLv23_method',
            secureOptions: constants.SSL_OP_NO_SSLv3,
            key: fs.readFileSync(vhostFolder + '/' + vhostFolders[i] + '/' + clientConfig.https_private_key),
            cert: fs.readFileSync(vhostFolder + '/' + vhostFolders[i] + '/' + clientConfig.https_certificate)
        };

        if (clientConfig.https_ca_certifcate !== undefined && clientConfig.https_ca_certificate) {
            secureContextOptions.ca = fs.readFileSync(vhostFolder + '/' + vhostFolders[i] + '/' + clientConfig.https_ca_certificate);
        }

        clientConfig.httpsContext = tls.createSecureContext(secureContextOptions);

    }

    for (var j = 0; j < clientConfig.hostnames.length; j++) {
        clientConfigs[clientConfig.hostnames[j]] = clientConfig;
    }

}

var numCpus = os.cpus().length;

if (cluster.isMaster) {

    console.info('daemon running with pid ' + process.pid);

    for (var i = 0; i < numCpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.warn('worker ' + worker.pid + ' died with code ' + code + ', restarting');
        cluster.fork();
    });

} else {

    console.log('worker started with pid ' + process.pid);
    httpProxy.start(config, clientConfigs);

}
