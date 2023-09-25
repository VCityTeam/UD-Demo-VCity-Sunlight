/** @file This code will be interpretaded by a node environnement. It is the actually the server side.*/
const { SharedClass } = require('@ud_demo_vcity_sunlight/shared');

module.exports = class MyAppNameServer {
  constructor() {}

  start() {
    console.log('MY_APP_SERVER_ENV_VARIABLE: ', process.env.MY_ENV_VARIABLE);

    const mySharedClass = new SharedClass('SERVER');
    mySharedClass.print();
  }
};
