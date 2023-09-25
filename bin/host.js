const express = require('express');
const { stringReplace } = require('string-replace-middleware');
const reload = require('reload');

const app = express();

// run an express server
const port = process.argv[2] || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const runMode = NODE_ENV === 'production' ? 'release' : 'debug';

const options = {
  contentTypeFilterRegexp: /text\/html/,
};

app.use(
  stringReplace(
    {
      RUN_MODE: runMode,
    },
    options
  )
);

app.use(express.static('./packages/browser'));

reload(app).then(() => {
  app.listen(port);
  console.log('HTTP SERVER IS RUNNING OF PORT', port);
});

try {
  // start applicaction server
  const { MyAppNameServer } = require('@ud_demo_vcity_sunlight/node');

  const myAppNameServer = new MyAppNameServer();
  myAppNameServer.start();
} catch (e) {
  console.error(e);
}
