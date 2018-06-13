require("ts-node/register");

// ^Jest global will call this file which in turn call other ts files
// If you want to reference other typescript modules, do it via require:
const { setup } = require("./setup");

module.exports = async function() {
  // Call your initialization methods here.
  // TEST_HOST will be setup in setup.
  // this is to prevent creating the connection multiple times
  if (!process.env.TEST_HOST) {
    await setup();
  }
  return null;
};
