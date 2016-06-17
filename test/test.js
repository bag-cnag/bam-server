const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const exec = require('child_process').exec;

var test = require('tape');

test('test samtools works', function (t) {
    // t.is(err, null);
    // t.isNot(user, null);
    // t.true(shell.test('-d', userPath), "Directory exists");
    t.true(shell.test('-e', 'sam/samtools/bin/samtools'), "File exists");

    exec('sam/samtools/bin/samtools --help', function (error, stdout, stderr) {
        t.is(error, null);
        t.end();
    });
});
test('test samtools view', function (t) {
    var file = "/home/fsalavert/projects/examples/HG00096.chrom20.ILLUMINA.bwa.GBR.low_coverage.20120522.bam"
    var region = "20:32878184-32878370";
    var command = 'sam/samtools/bin/samtools view ' + file + ' ' + region;
    console.log(command);
    exec(command, function (error, stdout, stderr) {
        t.is(error, null);
        console.log(stdout);
        t.end();
    });
});
