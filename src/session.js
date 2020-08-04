// ✊🏿

'use strict';

const Base = require('./base');
const Cookie = require('./cookie');
const IO = require('@castlelemongrab/ioh');
const Credentials = require('./credentials');
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
    this._io = (this.options.output || new IO.Base());
    this._output_file = this.options.credentials_output;

    return this;
  }

  get headers () {

    return this._headers;
  }

  async set_headers (_headers) {

    this._headers = (_headers || {});
    await this._update_credentials_from_headers();

    return this;
  }

  async _update_credentials_from_headers () {

    let cookies = this.headers['set-cookie'];

    if (!cookies) {
      return this;
    }

    let parsed = Cookie.parse_array(cookies);

    for (var i = 0, len = parsed.length; i < len; ++i) {
      this.update_credentials(parsed[i]);
    }

    return await this.write_credentials(true);
  }

  async update_credentials (_object) {

    [ 'mst', 'jst' ].forEach((_k) => {
      if (_object[_k]) {
        this._credentials[_k] = decodeURIComponent(_object[_k]);
      }
    });

    return this;
  }

  async write_credentials(_is_initial_update) {

    if (this._output_file) {
      try {
        await this._io.write_file(
          this._output_file,
            jsdump.parse(this._credentials.toObject()) + "\n"
        );
        this._io.log_level(
          'credentials', 'Credentials file was updated', this.log_level, 0
        );
      } catch (_e) {
        this._io.fatal('Failed to update credentials file');
      }
    } else if (!_is_initial_update) {
      this._io.warn('Please use the -o option to save credentials');
      this._io.warn('Updated client credentials may have been lost');
    }

    return this;
  }
};

/* Export symbols */
module.exports = Session;

