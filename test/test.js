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
