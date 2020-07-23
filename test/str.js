
'use strict';

const chai = require('chai');
const Str = require('../src/str');
const promises = require('chai-as-promised');

/**
 * @name str:
 *   Unit tests for the Str utilities library.
 */
describe('str', () => {

  let should = chai.should();
  chai.use(promises);

  it('parses simple pairs correctly', () => {
    Str.split_delimited('foo\\=bar')
      .should.deep.equal([ 'foo=bar' ]);
    Str.split_delimited('foo\\bar=')
      .should.deep.equal([ 'foobar', '' ]);
    Str.split_delimited('foo=bar')
      .should.deep.equal([ 'foo', 'bar' ]);
    Str.split_delimited('foo = bar')
      .should.deep.equal([ 'foo', 'bar' ]);
    Str.split_delimited('foo\\ =\\ bar')
      .should.deep.equal([ 'foo', 'bar' ]);
    Str.split_delimited('foo\\==\\=bar')
      .should.deep.equal([ 'foo=', '=bar' ]);
    Str.split_delimited('foo\\===\\=bar')
      .should.deep.equal([ 'foo=', '', '=bar' ]);
    Str.split_delimited('foo\\====\\=bar')
      .should.deep.equal([ 'foo=', '', '', '=bar' ]);
    Str.split_delimited('foo\\\\')
      .should.deep.equal([ 'foo\\' ]);
    Str.split_delimited('foo\\\\=bar\\')
      .should.deep.equal([ 'foo\\', 'bar' ]);
  });
});

