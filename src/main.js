// ✊🏿

'use strict';

const process = require('process'); /* Criminals */
const crypto = require('crypto'); /* RNG */
const fs = require('fs').promises; /* Kept them */
const bent = require('bent'); /* Get it? */

const Base = class {

  constructor (_options) {

    this._options = JSON.parse(JSON.stringify(_options || {}));

    return this;
  }

  get options () {

    return this._options;
  }
};

const Credentials = class extends Base {

  constructor (_mst, _jst, _options) {

    super(_options);

    this.mst = _mst;
    this.jst = _jst;

    return this;
  }

  get mst () {

    return this._mst;
  }

  get jst () {

    return this._jst;
  }

  set mst (_mst) {

    this._mst = _mst.toString().replace(/^mst=/, '');
    return this;
  }

  set jst (_jst) {

    this._jst = _jst.toString().replace(/^jst=/, '');
  }
};

const Ratelimit = class extends Base {

  constructor (_headers) {

    super(_headers);

    this._rng_divisor = 64;
    return this;
  }

  get limit () {

    return 0;
  }

  get remaining () {

    return 0;
  }

  get reset () {

    return 0;
  }

  set headers (_headers) {

    return this;
  }

  async wait () {

    return new Promise((_resolve) => {
      setTimeout(_resolve, Math.floor(
        (crypto.randomBytes(1)[0] / this._rng_divisor) * 1000
      ));
    });
  }
};

const Session = class extends Base {

  constructor (_credentials, _headers) {

    super(_headers);

    this._credentials = _credentials;
    return this;
  }

  set headers (_headers) {

    return this;
  }
};

const Client = class extends Base {

  constructor (_credentials, _options) {

    super(_options);

    this._session = new Session();
    this._ratelimit = new Ratelimit();

    this._page_size = (
      this.options.page_size ?
        parseInt(_options.page_size, 10) : 20
    );

    this._credentials = _credentials;
    this._url = (this.options.url || 'https://api.parler.com/');

    this._ua = (
      this.options.ua || [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'AppleWebKit/537.36 (KHTML, like Gecko)',
        'Chrome/83.0.4103.116',
        'Safari/537.36'
      ].join(' ')
    );

    return this;
  }

  get credentials () {

    return this._credentials;
  }

  get user_agent () {

    return this._ua;
  }

  get base_url () {

    return this._url;
  }

  get page_size () {

    return this._page_size;
  }

  /** API endpoints **/

  async profile (_username) {

    let request = this._create_client(
      this._create_extra_headers(_username)
    );

    let username = encodeURIComponent(_username);
    let url = `v1/profile?username=${username}`;

    this._log_fetch(url);
    await this._ratelimit.wait();

    /* HTTPS request */
    let response = await request(url);
    return await response.json();
  }

  async posts (_profile) {

    return await this._paged_request(
      _profile, this._request_creator.bind(this), (_c) => (_c.posts || [])
    );
  }

  /** API request helpers **/

  async _request_creator (_profile, _start_ts) {

    let response = await this._paged_request_one(
      'v1/post/creator', _profile, _start_ts
    );

    return await response.json();
  }

  /** HTTPS functions **/

  _create_client (_headers) {

    let headers = Object.assign(_headers, {
      'User-Agent': this.user_agent,
      'Origin': 'https://parler.com',
      'Cookie': `mst=${encodeURIComponent(this._credentials.mst)}`
    });

    return bent(this.base_url, 'GET', null, 200, headers);
  }

  _create_extra_headers (_username) {

    let username = encodeURIComponent(_username);

    return {
      'Referrer': `https://parler.com/profile/${username}/posts`
    }
  }

  /** Result output functions **/

  _start_json_results () {

    process.stdout.write("[\n");
    return true;
  }

  _end_json_results () {

    process.stdout.write("\n]");
    return true;
  }

  _print_json_results (_results, _is_first_page, _is_final_page) {

    if (_results.length <= 0) {
      return true;
    }

    for (let i = 0, len = _results.length; i < len; ++i) {

      if (!(_is_first_page && i <= 0)) {
        process.stdout.write(",\n");
      }
      process.stdout.write(
        JSON.stringify(_results[i]).trim()
      );
    }

    return true;
  }

  /** Logging functions **/

  _log_generic (_type, _message) {

    process.stderr.write(`[${_type}] ${_message}`);
    process.stderr.write("\n");
  }

  _log_fetch (_url) {

    return this._log_generic('https', `Fetching ${_url}`);
  }

  _log_success (_message) {

    return this._log_generic('success', _message);
  }

  /** Paging **/

  async _paged_request (_profile, _request_callback, _reduce_callback,
                        _result_callback, _start_callback, _end_callback) {

    /* To do:
        This paging logic could be pulled out into a buffered iterator. */

    let record = {};
    let results = [];
    let next_key = null;
    let is_first_page = true;

    if (!_request_callback) {
      throw new Error('Request callback required');
    }

    let end_cb = (_end_callback || this._end_json_results.bind(this));
    let start_cb = (_start_callback || this._start_json_results.bind(this));
    let result_cb = (_result_callback || this._print_json_results.bind(this));

    if (!start_cb()) {
      throw new Error('Result dispatch: start failed');
    }

    /* To do: allow a check on next_key, with history */
    for (;;) {

      /* Perform actual network request */
      let record = await _request_callback(_profile, next_key);

      /* Extract result array */
      results = _reduce_callback(record);

      /* Exit conditions */
      let is_final_page = !(
        is_first_page || results.length >= this.page_size
      );

      if (!results.length) {
        is_final_page = true;
      }

      /* Dispatch result */
      if (!result_cb(results, is_first_page, is_final_page)) {
        throw new Error('Result dispatch failed');
      }

      next_key = record.next;
      is_first_page = false;

      /* Termination */
      if (is_final_page) {
        break;
      }
    }

    if (!end_cb()) {
      throw new Error('Result dispatch: completion failed');
    }

    this._log_success('Finished fetching paged results');
    return true;
  }

  async _paged_request_one (_url, _profile, _start_key) {

    let username = (_profile || {}).username;
    let user_id = encodeURIComponent(_profile._id);
    let limit = encodeURIComponent(this.page_size);

    let request = this._create_client(
      this._create_extra_headers(username)
    );

    let url = `${_url}?id=${user_id}&limit=${limit}`;

    if (_start_key) {
      url += `&startkey=${encodeURIComponent(_start_key)}`;
    }

    this._log_fetch(url);
    await this._ratelimit.wait();

    /* Issue actual HTTPS request */
    return await request(url);
  }
};

/** CLI functions **/

function fatal (_message, _status, _type) {

  let type = (_type || 'fatal');

  process.stderr.write(`[${type}] ${_message}`);
  process.stderr.write("\n");
  process.exit(_status || 127);
}

async function parlaid (_args) {

  let config = {};

  try {
    let json_config = await fs.readFile('config/auth.json');
    config = JSON.parse(json_config);
  } catch (_e) {
    fatal("Unable to read config/auth.json", 2);
  }

  if (!_args.user) {
    fatal('Please specifiy a user name', 3);
    process.exit(1);
  }

  let credentials = new Credentials(config.mst, config.jst);
  let client = new Client(credentials);

  let profile = await client.profile(_args.user);
  await client.posts(profile);
};

function main (_argv) {

  if (_argv.length != 3) {
    fatal(`${_argv[1]} user`, 1, 'usage');
  };

  let args = {
    user: _argv[2]
  };

  return parlaid(args);
}

/* Entry point */
main(process.argv);

