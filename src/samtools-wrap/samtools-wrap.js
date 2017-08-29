"use strict"; 

/**
 *  Provides a basic wrapper for samtools
 *  
 *  The code is based on the previous work 'bam-server' located at 'https://github.com/frasator/bam-server'
 */

const exec = require('child_process').exec;
const async = require('async');
const shell = require('shelljs');
const path = require('path');

let _configFile = require("../config.json");


let _samtoolsWrap_frasator = {
  
    'getHistogramRegionTask': function(filePath, region, histogramLogarithm) {
        return function (cb) {
            let _samtools_Path = _configFile.samtools.path;
            
            let command = _samtools_Path + ' view -c ' + filePath + ' ' + region;
            
            exec(command, function (error, stdout, stderr) {
                var out = stdout.trim();
                var split1 = region.split(':');
                var split2 = split1[1].split('-');
                // console.log(stdout);
                // console.log(stderr);
                if (out == "") {
                    cb(error, {
                        features_count: 0,
                        start: parseInt(split2[0]),
                        end: parseInt(split2[1]),
                        chromosome: split1[0]
                    });
                } else {
                    var count = parseInt(out);
                    if (histogramLogarithm == true) {
                        count = (count < 2) ? count : Math.log10(count);
                    }
                    cb(error, {
                        features_count: count,
                        start: parseInt(split2[0]),
                        end: parseInt(split2[1]),
                        chromosome: split1[0]
                    });
                }
            });
        }
    },
    

    'getFirstReadTask': function(filePath) {
        return function (cb) {
            let _samtools_Path = _configFile.samtools.path;

            var command = _samtools_Path + ' view ' + filePath + ' | head -n 1';
            exec(command, function (error, stdout, stderr) {
                var out = stdout.trim();
                if (out == "") {
                    cb('No lines found');
                } else {
                    cb(error, _samtoolsWrap_frasator.lineToJson(stdout.trim()));
                }
            });
        }
    },
    
    
    'getRegionTask': function(filePath, region) {
        return function (cb) {
            _samtoolsWrap_frasator.getReadsFromRegion(filePath, region, function (err, out) {
                cb(err, out);
            });
        }
    },
    
    
    'getReadsFromRegion': function(filePath, region, cb) {
        let _samtools_Path = _configFile.samtools.path;
        
        let _command = _samtools_Path + ' view ' + filePath + ' ' + region;
        
        
        console.log('getReadsFromRegion');       // TODO: REMOVE DEBUG LOG
        console.log(_command);       // TODO: REMOVE DEBUG LOG
        
        exec(_command, {
            maxBuffer: 1024 * 10000
        }, function (error, stdout, stderr) {
            // console.log(error);
            // console.log(stdout);
            var out = stdout.trim();
            if (out == "") {
                cb(error, []);
            } else {
                var reads = _samtoolsWrap_frasator.processLines(stdout.trim().split("\n"));
                cb(error, reads);
            }
        });
    },
    

    'processLines': function(lines) {
        var reads = [];
        for (var i = 0; i < lines.length; i++) {
            reads.push(_samtoolsWrap_frasator.lineToJson(lines[i]));
        }
        return reads;
    },
    
    
    
    'lineToJson': function(line) {
        // 1  QNAME String [!-?A-~]{1,254} Query template NAME
        // 2  FLAG Int [0,216-1] bitwise FLAG
        // 3  RNAME String \*|[!-()+-<>-~][!-~]* Reference sequence NAME
        // 4  POS Int [0,231-1] 1-based leftmost mapping POSition
        // 5  MAPQ Int [0,28-1] MAPping Quality
        // 6  CIGAR String \*|([0-9]+[MIDNSHPX=])+ CIGAR string
        // 7  RNEXT String \*|=|[!-()+-<>-~][!-~]* Ref. name of the mate/next read
        // 8  PNEXT Int [0,231-1] Position of the mate/next read
        // 9  TLEN Int [-231+1,231-1] observed Template LENgth
        // 10 SEQ String \*|[A-Za-z=.]+ segment SEQuence
        // 11 QUAL String [!-~]+
        var fields = line.split("\t");
        // console.log(fields);
        var read = {
            QNAME: fields[0],
            FLAG: fields[1],
            RNAME: fields[2],
            POS: fields[3],
            MAPQ: fields[4],
            CIGAR: fields[5],
            RNEXT: fields[6],
            PNEXT: fields[7],
            TLEN: fields[8],
            SEQ: fields[9],
            QUAL: fields[10],
            OPTIONAL: {}
        };
        //Optional fields
        for (var k = 11; k < fields.length; k++) {
            var optionalFieldSplit = fields[k].split(':');
            var optionalFieldKey = optionalFieldSplit.shift();
            read["OPTIONAL"][optionalFieldKey] = optionalFieldSplit.join(':');
        }
        // read["chromosome"] = read["RNAME"];
        // read["start"] = parseInt(read["POS"]);
        // read["end"] = read["start"] + read["SEQ"].length - 1;
        return read;
    }

    
};      // EndOf _samtoolsWrap_frasator




let _samtoolsWrap = {
      
        
    'task_getHistogramRegion': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};

        let _filePath = _options.filePath;
        let _region = _options.region;
        let _histogramLogarithm = _options.histogramLogarithm;
        
        return _samtoolsWrap_frasator.getHistogramRegionTask(
                _filePath, 
                _region,
                _histogramLogarithm);
        
    },
    
    
    'task_getFirstRead': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};

        let _filePath = _options.filePath;
        
        return _samtoolsWrap_frasator.getFirstReadTask(_filePath);
    },
    
    
    'task_getRegion': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};

        let _filePath = _options.filePath;
        let _region = _options.region;

        return _samtoolsWrap_frasator.getRegionTask(_filePath, _region);
    },
    
    
    'getReadsFromRegion': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};

        let _filePath = _options.filePath;
        let _region = _options.region;
        let _callback = _optins.callback;

        _samtoolsWrap_frasator.getReadsFromRegion(_filePath, _region, _callback);
    },
    
    
    'processLines': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};

        let _lines = _options.lines;
        return _samtoolsWrap_frasator.processLines(_lines);
    },
    
    
    'lineToJson': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};

        let _line = _options.line;
        return _samtoolsWrap_frasator.lineToJson(_line);
    }
    
    
        
};      // EndOf _samtoolsWrap




let _samtoolsWrap_Lib = {
        
        
    'getReadsFromRegions': function(_options) {
        
        _options = (_options !== undefined) ? _options : {};
        
        let _fileName = _options.fileName;
        let _regions = _options.regions;
        let _histogram = _options.histogram;
        let _histogramLogarithm = _options.histogramLogarithm;
        let _callback = _options.callback;
        
        let _bam_Folders = _configFile.bam.folders;


        
        async.waterfall([
            function (cb) {
                var files = shell.find(_bam_Folders).filter(function (file) {
                    return new RegExp(_fileName + "$").test(file);
                });
                if (files.length <= 0) {
                    cb('file not found');
                } else {
                    var filePath = files[0];
                    if (shell.test('-e', filePath + '.bai') == false) {
                        cb('Index(.bai) file not found');
                    } else {
                        cb(null, filePath);
                    }
                }
            },
            function (filePath, cb) {
                var tasks = [];
                if (_histogram !== true) {
                    for (var i = 0; i < _regions.length; i++) {
                        
                        // tasks.push(getRegionTask(filePath, _regions[i]));
                        
                        tasks.push(
                            _samtoolsWrap.task_getRegion({
                                'filePath':  filePath,
                                'region': _regions[i]
                            })
                        );
                    }
                } else {
                    for (var i = 0; i < _regions.length; i++) {
                        
                        // tasks.push(getHistogramRegionTask(filePath, _regions[i], _histogramLogarithm));
                        
                        tasks.push(
                            _samtoolsWrap.task_getHistogramRegion({
                                'filePath':  filePath,
                                'region': _regions[i],
                                'histogramLogarithm': _histogramLogarithm
                            })
                        );
                        
                    }
                }
                async.parallel(tasks, function (err, results) {
                    cb(err, results);
                });
            }], 

            function (err, results) {
                if (err) {
                    _callback(err);
                } else {
                    if (_histogram !== true) {
                        _callback(null, {
                            regionsCount: results.length,
                            regions: _regions,
                            results: results
                        });
                    } else {
                        _callback(null, results);
                    }
                }
            });

    },
    
    
    'getFiles': function (callback) {
        
        _options = (_options !== undefined) ? _options : {};
        
        let _callback = _options.callback;
        
        let _bam_Folders = _configFile.bam.folders;

        
        async.waterfall([
            function (cb) {
                var files = shell.find(_bam_Folders).filter(function (file) {
                    return new RegExp(".bam" + "$").test(file);
                });
                var tasks = [];
                for (var i = 0; i < files.length; i++) {
                    
                    // tasks.push(getFirstReadTask(files[i]));
                    
                    tasks.push(
                        _samtoolsWrap.task_getFirstRead({
                            'filePath': files[i]
                        })
                    );
                    
                }
                async.parallel(tasks, function (err, results) {
                    cb(err, files, results);
                });
            },
            function (files, firstReadResults, cb) {
                var finalFiles = [];
                for (var i = 0; i < files.length; i++) {
                    var f = files[i];
                    finalFiles.push({
                        name: path.basename(f),
                        hasIndex: shell.test('-e', f + ".bai"),
                        firstReadPos: firstReadResults[i].RNAME + ':' + firstReadResults[i].POS
                    });
                }
                cb(null, finalFiles)
            }
        ], function (err, results) {
            if (err) {
                _callback(err);
            } else {
                _callback(null, results);
            }
        });
    }
    
        
        
};      // EndOf _samtoolsWrap_Lib



module.exports = _samtoolsWrap_Lib;


