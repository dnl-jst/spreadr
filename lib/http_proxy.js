var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    http = require('http'),
    https = require('https'),
    http2 = require('http2'),
    constants = require('constants');

exports.start = function(config, clientConfigs) {

    var totalRequestCount = 0;

    var requestHandler = function(request, response) {

        var startTime = new Date();
        var remoteAddress = request.connection.remoteAddress;
        var requestHost = request.headers.host;
        var requestMethod = request.method;
        var requestUrl = path.normalize(request.url);
        var requestString = '"' + request.method + ' ' + requestUrl + ' HTTP/' + request.httpVersion + '"';
        var encryptionString = '"' + ((request.connection.encrypted != undefined) ? request.connection.getCipher().name + ' ' + request.connection.getCipher().version : '-') + '"';

        totalRequestCount++;

        var currentRequestID = '[' + totalRequestCount + ']';

        response.on('finish', function() {

            var endTime = new Date();

            console.log(
                currentRequestID,
                remoteAddress,
                requestHost,
                encryptionString,
                requestString,
                response.statusCode,
                '(' + (endTime - startTime) + 'ms)'
            );

        });

        if (clientConfigs[requestHost] == undefined) {

            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('500 Internal Server Error');

            console.log(currentRequestID + ' vhost ' + requestHost + ' not found');

            return;

        }

        var clientConfig = clientConfigs[requestHost];

        var headers = request.headers;

        headers['spreadr-connecting-ip'] = request.connection.remoteAddress;

        if (!headers['x-forwarded-for']) {
            headers['x-forwarded-for'] = request.connection.remoteAddress;
        }

        var proxyHandler = function(proxyResponse) {

            response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
            proxyResponse.pipe(response);

        };

        var proxy_options = {
            hostname: clientConfig.target_http_hostname,
            port: clientConfig.target_http_port,
            path: requestUrl,
            method: requestMethod,
            headers: headers,
            agent: false
        };

        var proxyRequest;

        if (request.connection.encrypted != undefined && clientConfig.target_https) {

            proxy_options.hostname = clientConfig.target_https_hostname;
            proxy_options.port = clientConfig.target_https_port;
            proxy_options.rejectUnauthorized = clientConfig.target_https_check_certificate;

            proxyRequest = https.request(proxy_options, proxyHandler);

        } else {

            proxyRequest = http.request(proxy_options, proxyHandler);

        }

        proxyRequest.on('error', function (err) {

            console.log(currentRequestID + ' an error occured on proxy-request ' + util.inspect(err));

            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('500 Internal Server Error');

        });

        request.pipe(proxyRequest);

    };

    var httpServer = http.createServer(requestHandler);
    httpServer.listen(config.http_port, '::');

    var httpsOptions = {
        secureProtocol: 'SSLv23_method',
        secureOptions: constants.SSL_OP_NO_SSLv3,
        key: fs.readFileSync(path.resolve(__dirname) + '/../configs/' + config.https_default_key),
        cert: fs.readFileSync(path.resolve(__dirname) + '/../configs/' + config.https_default_crt),
        SNICallback: function(hostname, cb) {

            if (clientConfigs[hostname] != undefined && clientConfigs[hostname].httpsContext != null) {

                cb(null, clientConfigs[hostname].httpsContext);

            } else {

                cb(null, null);

            }
        }
    };

    if (config.https_default_ca_crt != undefined && config.https_default_ca_crt) {
        httpsOptions.ca = fs.readFileSync(path.resolve(__dirname) + '/../configs/' + config.https_default_ca_crt);
    }

    var httpsServer = http2.createServer(httpsOptions, requestHandler);
    httpsServer.listen(config.https_port, '::');

    console.log('listening on port ' + config.http_port + ' (http), ' + config.https_port + ' (https)');

};
