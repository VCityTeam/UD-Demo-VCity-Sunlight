/** @file Running the build-debug script */
const exec = require('child-process-promise').exec;
const spawn = require('child-process-promise').spawn;
const path = require('path');

/**
 * It prints the stdout and stderr of a result object
 *
 * @param {{stdout:string,stderr:string}} result - The result of the command execution.
 */
const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

// run a build debug bundle browser
exec('npm run build-debug --prefix ./packages/browser')
  .then(printExec)
  .then(() => {
    // start a server
    const child = spawn('node', ['./bin/host.js', process.env.PORT || 8000], {
      shell: true,
    });

    child.childProcess.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    child.childProcess.stderr.on('data', (data) => {
      console.error('\x1b[31m', 'host' + ` ERROR :\n${data}`);
    });
  });
