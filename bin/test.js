const exec = require('child-process-promise').exec;
const Test = require('@ud-viz/node').Test;

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

console.log('Build @my_app_name/shared');
exec('npm run build-shared')
  .catch((error) => {
    console.log('@my_app_name/shared build failed');
    console.error(error);
    process.exit(1); //
  })
  .then(printExec)
  .then(() => {
    console.log('Build @my_app_name/browser');
    exec('npm run build-browser')
      .catch((error) => {
        console.log('@my_app_name/browser build failed');
        console.error(error);
        process.exit(1);
      })
      .then(printExec)
      .then(() => {
        console.log('Build @my_app_name/node');
        exec('npm run build-node')
          .catch((error) => {
            console.log('@my_app_name/node build failed');
            console.error(error);
            process.exit(1);
          })
          .then(printExec)
          .then(() => {
            console.log('nothing for now');
            Test.scripts('./packages/shared/bin/Test').then(() => {
              Test.browserScripts(
                './packages/browser/bin/Test',
                './packages/browser/dist/production/bundle.js'
              ).then(() => {
                Test.html('./packages/browser');
              });
            });
          });
      });
  });
