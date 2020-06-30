// ✊🏿

'use strict';

const Base = require('./base');
const Out = require('./output');
const Cookie = require('./cookie');
const Credentials = require('./credentials');

/**
  A session abstraction.
  Handles credential rotation from HTTP response headers.
  @extends Base
**/
const Session = class extends Base {

  constructor (_credentials, _headers, _options) {

    super(_options);

    this.headers = _headers;
    this._credentials = _credentials;
    this._log_level = (this.options.log_level || 1);
    this._out = (this.options.output || new Out.Default());

    return this;
  }

  get headers () {

    return this._headers;
  }

  set headers (_headers) {

    this._headers = (_headers || {});
    return this;
  }
};

/* Export symbols */
module.exports = Session;

