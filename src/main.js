// ✊🏿

'use strict';

const CLI = require('./cli');

/**
  Application entry point
**/
async function main() {

  let cli = new CLI();
  await cli.run();
}

/* Export symbols */
module.exports = main;

