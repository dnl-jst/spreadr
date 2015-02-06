var cluster = require('cluster'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    httpProxy = require('./modules/http_proxy.js');

var config = require(path.resolve(__dirname) + '/spreadr.json');
var clientConfigs = {};

var files = fs.readdirSync(path.resolve(__dirname, 'configs/'));

for (var i = 0; i < files.length; i++) {

    if (path.extname(files[i]) != '.json') {
        continue;
    }

    var clientConfig = require(path.resolve(__dirname, 'configs/') + '/' + files[i]);

    if (clientConfig.https) {

        clientConfig.httpsContext = tls.createSecureContext({
            secureProtocol: 'SSLv23_method',
            secureOptions: constants.SSL_OP_NO_SSLv3,
            key: config.https_private_key,
            cert: config.https_certificate,
            ca: config.https_ca_certificate,
            ecdhCurve: 'prime256v1'
        });

    }

    clientConfigs[clientConfig.hostname] = clientConfig;

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
