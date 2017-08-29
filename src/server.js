"use strict"; 

const cluster = require('cluster');
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

let _security_Lib = require('./security/security.js');
let _samtoolsWrap_Lib = require('./samtools-wrap/samtools-wrap.js');

let _configFile = require("./config.json");


let _server_Methods = {
  
    'map_serverMethods': function(_options) {

        _options = (_options !== undefined) ? _options : {};
        let _urlPathPrefix = _configFile.flow.urlPathPrefix;

        let _app = _server_Lib.get_App();
        
        
        // define the home page route
        _app.get('/', function (req, res) {
          res.send('BAM-Flow home page')
        });
        
        // define the about route
        _app.get('/about', function (req, res) {
          res.send('About BAM-Flow')
        });


        // Now oder methods should be protected
        _security_Lib.secure_ExpressRouter({
          'router': _app
        });
        
        
        // Get region
        _app.get(_urlPathPrefix + '/region', function (_req, _res) {
            _server_Methods._method_GET_Region({
                'request': _req,
                'response': _res
            });
        });
        
        
        // Get list of files
        _app.get(_urlPathPrefix + '/list', function (_req, _res) {
            _server_Methods._method_GET_ListOf_Files({
                'request': _req,
                'response': _res
            });
        });

    },

        
    '_method_GET_Region': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};
        let _config = _server_Lib.get_Config();
        
        let _req = _options.request;
        let _res = _options.response;
        
        let _fileName = _req.query.filename;
        let _histogram = _req.query.histogram === 'true';
        let _histogramLogarithm = _req.query.histogramLogarithm === 'true';
        
        let _region = _req.query.region;
        
        if (_region !== undefined) {
            let _regions = _region.split(',');
            
            _samtoolsWrap_Lib.getReadsFromRegions({
                'fileName': _fileName,
                'regions': _regions,
                'histogram': _histogram,
                'histogramLogarithm': _histogramLogarithm,
                'callback': function (_err, _result) {
                    if (_err) {
                        _res.status(500).send(_err);
                    } else {
                        _res.send(_result);
                    }
                }
            });
            

        } else {
            _res.status(500).send();
        }

    },
    
    
    '_method_GET_ListOf_Files': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};
        
        let _req = _options.request;
        let _res = _options.response;
        
        _samtoolsWrap_Lib.getFiles({
           'callback': function(_err, _result) {
               if (_err) {
                   _res.status(500).send(_err);
               } else {
                   _res.send(_result);
               }
           } 
        });
        
    }
    
        
};




let _server_Lib = {
  
    "_config": {
        "app": null
    },
    
    
    "get_Config": function(_options) {
        return _server_Lib._config;
    },
    
    
    "get_App": function(_options) {
        
        let _config = _server_Lib.get_Config();
        return _config.app;
    },
    
    "initialize": function(_options) {
        let _app = _server_Lib.get_App();
        if (_app === null) {
            _server_Lib._init_App();
        } else {
            throw "Application already initialized.";
        }
    },
    
    
    "_init_App": function(_options) {
        
        _options = (_options !== undefined) ? _options : {};
        let _config = (_options.config !== undefined) ? _options.config : _server_Lib.get_Config();
        
        if (_config.app !== null) {
            return;
        }
        
        
        // Create a new Express _application
        let _app = express();
        _app.use(compression());
        _app.use(cors({
            origin: true,
            credentials: true
        }));

        _app.use(bodyParser.urlencoded({
            extended: true
        })); // support encoded bodies
        
        _app.use(bodyParser.json()); // support json encoded bodies
        
        _config.app = _app;
        
        _server_Methods.map_serverMethods();    // Map server methods
        
        _app.listen(_configFile.flow.port);
        
        console.log('Worker %d running!', cluster.worker.id);   // TODO: REMOVE DEBUG LOG

    }
    
        
        
};


module.exports = _server_Lib;

