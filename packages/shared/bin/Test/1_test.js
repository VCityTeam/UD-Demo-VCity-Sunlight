const SharedAPI = require('../../src/index');

const instance = new SharedAPI.SharedClass();
instance.print();

// some test

process.exit(0); // test suceed
