
'use strict';

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const util = require('../include/util');
const IO = require('@castlelemongrab/ioh');
const promises = require('chai-as-promised');
const Oath = require('@castlelemongrab/oath');
const factories = require('chai-js-factories');

/**
 */
describe('cli', () => {

  let expect = chai.expect;
  let should = chai.should();

  chai.use(promises);
  chai.use(factories);

  let io = new IO.Node();
  let unlink = Oath.promisify(fs.unlink);
  let temp_path = path.join(__dirname, '..', 'temp');
  let fixtures_in = path.join(__dirname, '..', 'fixtures', 'input');
  let fixtures_out = path.join(__dirname, '..', 'fixtures', 'output');
  let parlance_path = path.join(__dirname, '..', '..', 'bin', 'parlance');

  /**
  **/
  const parlance_init = async (_file, _filetype) => {

    let file_data = '';
    let ext = (_filetype || 'json');
    let temp_file = path.join(temp_path, `${uuid.v4()}.${ext}`);

    if (_file != null) {
      file_data = await io.read_file(_file));
    }

    await io.write_file(temp_file, file_data);
    return temp_file;
  }

  /**
  **/
  const parlance_final = async (_file, _expect_file) => {

    let output = await io.read_file(_file);
    let expect = await io.read_file(_expect_file);

    output.should.equal(expect);
    return Promise.resolve();
  }

  /**
  **/
  const parlance = async (_file, _args) => {

    let [ out ] = await util.run_process(
      parlance_path, _args
    );

    return await io.write_file(_file, out);
  }

  /**
  **/
  it('should initialize credentials', async () => {

    let file = parlance_init();
    let expect_file = path.join(fixtures_out, 'init-001.json');

    await parlance(file, [
      'init', '-o', file. '--mst', '%2A%2A%2A', '--jst', 'JWT'
    ]);

    await parlance_final(file, expect_file);
    return await unlink(file);
  });
});

