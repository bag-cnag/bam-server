const exec = require('child_process').exec;
const async = require('async');
const shell = require('shelljs');
const path = require('path');
var config = require("./config.json");

module.exports = {
    getReadsFromRegions: function (fileName, regions, histogram, histogramLogarithm, callback) {
        async.waterfall([
            function (cb) {
                var files = shell.find(config.folders).filter(function (file) {
                    return new RegExp(fileName + "$").test(file);
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
                if (histogram != true) {
                    for (var i = 0; i < regions.length; i++) {
                        tasks.push(getRegionTask(filePath, regions[i]));
                    }
                } else {
                    for (var i = 0; i < regions.length; i++) {
                        tasks.push(getHistogramRegionTask(filePath, regions[i], histogramLogarithm));
                    }
                }
                async.parallel(tasks, function (err, results) {
                    cb(err, results);
                });
            }
        ], function (err, results) {
            if (err) {
                callback(err);
            } else {
                if (histogram != true) {
                    callback(null, {
                        regionsCount: results.length,
                        regions: regions,
                        results: results
                    });
                } else {
                    callback(null, results);
                }
            }
        });
    },

    getFiles: function (callback) {
        async.waterfall([
            function (cb) {
                var files = shell.find(config.folders).filter(function (file) {
                    return new RegExp(".bam" + "$").test(file);
                });
                var tasks = [];
                for (var i = 0; i < files.length; i++) {
                    tasks.push(getFirstReadTask(files[i]));
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
                callback(err);
            } else {
                callback(null, results);
            }
        });
    }
}

function getHistogramRegionTask(filePath, region, histogramLogarithm) {
    return function (cb) {
        var command = 'sam/samtools/bin/samtools view -c ' + filePath + ' ' + region;
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
}

function getFirstReadTask(filePath) {
    return function (cb) {
        var command = 'sam/samtools/bin/samtools view ' + filePath + ' | head -n 1';
        exec(command, function (error, stdout, stderr) {
            var out = stdout.trim();
            if (out == "") {
                cb('No lines found');
            } else {
                cb(error, lineToJson(stdout.trim()));
            }
        });
    }
}

function getRegionTask(filePath, region) {
    return function (cb) {
        getReadsFromRegion(filePath, region, function (err, out) {
            cb(err, out);
        });
    }
}

function getReadsFromRegion(filePath, region, cb) {
    var command = 'sam/samtools/bin/samtools view ' + filePath + ' ' + region;
    // console.log(command);
    exec(command, {
        maxBuffer: 1024 * 10000
    }, function (error, stdout, stderr) {
        // console.log(error);
        // console.log(stdout);
        var out = stdout.trim();
        if (out == "") {
            cb(error, []);
        } else {
            var reads = processLines(stdout.trim().split("\n"));
            cb(error, reads);
        }
    });
}

function processLines(lines) {
    var reads = [];
    for (var i = 0; i < lines.length; i++) {
        reads.push(lineToJson(lines[i]));
    }
    return reads;
}

function lineToJson(line) {
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
