// Internal require
const cluster = require('cluster');
const samtoolsWrap = require('./samtools-wrap.js');
var config = require("./config.json");

if (cluster.isMaster) {
    // Code to run if we're in the master process
    // Count the machine's CPUs

    var cpuCount = Math.min(require('os').cpus().length, 10);
    // Create a worker for each CPU
    console.log('');
    console.log('Starting server workers...');
    console.log('===================');
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();
    });

} else {
    // Includes
    var compression = require('compression');
    var express = require('express');
    var cors = require('cors');
    var bodyParser = require('body-parser');

    // Create a new Express application
    var app = express();
    app.use(compression());
    app.use(cors({
        origin: true,
        credentials: true
    }));

    app.use(bodyParser.urlencoded({
        extended: true
    })); // support encoded bodies
    app.use(bodyParser.json()); // support json encoded bodies

    app.get(config.urlPathPrefix + '/', function (req, res) {
        var fileName = req.query.fileName;
        var histogram = req.query.histogram === 'true';
        var histogramLogarithm = req.query.histogramLogarithm === 'true';
        if (req.query.region != null) {
            var regions = req.query.region.split(',');
            samtoolsWrap.getReadsFromRegions(fileName, regions, histogram, histogramLogarithm, function (err, result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.send(result);
                }
            });

        } else {
            res.status(500).send();
        }
    });
    app.get(config.urlPathPrefix + '/list', function (req, res) {
        samtoolsWrap.getFiles(function (err, result) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(result);
            }
        });
    });

    app.get(config.urlPathPrefix + '/test', function (req, res) {
        res.send("I am alive!");
    });

    app.listen(config.port);
    console.log('Worker %d running!', cluster.worker.id);
}
