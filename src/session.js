// ✊🏿

'use strict';

const Base = require('./base');
const Out = require('./output');
const Cookie = require('./cookie');
const Credentials = require('./credentials');
const fs = require('fs').promises; /* Kept them */
const jsdump = require('jsDump'); /* More human than human */

/**
  A session abstraction.
  Handles credential rotation from HTTP response headers.
  @extends Base
**/
const Session = class extends Base {

  constructor (_credentials, _headers, _options) {

    super(_options);

    this._headers = _headers;
    this._credentials = _credentials;
    this._log_level = (this.options.log_level || 1);
    this._output_file = this.options.credentials_output;
    this._out = (this.options.output || new Out.Default());

    return this;
  }

  get headers () {

    return this._headers;
  }

  async set_headers (_headers) {

    this._headers = (_headers || {});
    await this._update_credentials();

    return this;
  }

  async _update_credentials () {

    let cookies = this.headers['set-cookie'];

    if (!cookies) {
      return this;
    }

    let parsed = Cookie.parse_array(cookies);

    for (var i = 0, len = parsed.length; i < len; ++i) {

      [ 'mst', 'jst' ].forEach((_k) => {
        if (parsed[i][_k]) {
          this._credentials[_k] = decodeURIComponent(parsed[i][_k]);
        }
      });

      if (this._output_file) {
        try {
          await fs.writeFile(
            this._output_file, jsdump.parse(this._credentials.toObject())
          );
          this._out.log_level(
            'credentials', 'Credentials file was updated', this.log_level, 0
          );
        } catch (_e) {
          this._out.warn('Failed to update credentials file');
        }
      } else {
        this._out.warn('Please use the -o option to save credentisals');
        this._out.warn('Newly-issued server credentials may have been lost');
      }

      this._out.log_level(
        'credentials', 'Server issued updated credentials', this.log_level, 0
      );
    }

    return this;
  }
};

/* Export symbols */
module.exports = Session;

