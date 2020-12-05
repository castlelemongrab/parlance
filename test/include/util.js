
const fs = require('fs');
const path = require('path');
const IO = require('@castlelemongrab/ioh');
const Oath = require('@castlelemongrab/oath');
const child_process = require('child_process');

/**
  An asynchronous version of `child_process.runFile`.
**/
const run_process_async = Oath.promisify(child_process.execFile);

/**
  Define a fixture-producing factory method for Chai
**/
const define_factories = (_chai, _filetype) => {

  let ext = (_filetype || 'json');

  _chai.factory.define('fixture', function (_args) {

    return fs.readFileSync(path.join(
      __dirname, '..', 'fixtures', _args.type,
        `${path.basename(_args.name, `.${ext}`)}.${ext}`
    )).toString();
  });

  return _chai;
};

/**
  Execute `_file` while providing arguments in `_argv`.
**/
const run_process = async (_file, _argv) => {

  return await run_process_async(_file, _argv);
};

module.exports = {
  run_process: run_process,
  define_factories: define_factories,
  init_fixture_test: init_fixture_test
};

