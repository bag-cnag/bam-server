"use strict"; 

// max     // Internal require
const cluster = require('cluster');
let _configFile = require("./config.json");
const _server = require('./server.js');


if (cluster.isMaster) {
    // Code to run if we're in the master process
    // Count the machine's CPUs

    var cpuCount = Math.min(require('os').cpus().length, 10);
    // Create a worker for each CPU
    console.log('');
    console.log('Starting server workers...');
    console.log('===================');
    
    let _maxWorkers = (_configFile.flow.maxWorkers !== false &&
            _configFile.flow.maxWorkers !== 0 &&
            _configFile.flow.maxWorkers < cpuCount) ? _configFile.flow.maxWorkers : cpuCount;
    
    
    for (var i = 0; i < _maxWorkers; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();
    });

} else {
    
    _server.initialize();
    
}

