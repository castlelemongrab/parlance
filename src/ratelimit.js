// ✊🏿

'use strict';

const Base = require('./base');
const Out = require('./output');
const ISO8601X = require('./iso8601x'); /* It's time */

/**
  A ratelimiting implementation based upon HTTP response headers.
  @extends Base
**/
const Ratelimit = class extends Base {

  constructor (_headers, _options) {

    super(_options);

    /* To do: this probably isn't ideal */
    this._crypto = require('crypto');

    this._rng_divisor = 128;
    this._headers = (_headers || {});
    this._log_level = (this.options.log_level || 1);
    this._out = (this.options.output || new Out.Default());

    return this.reset();
  }

  reset () {

    this._limit = this.limit_default;
    this._remaining = this.remaining_default;
    this._reset_time = this.reset_time_default;
  }

  get log_level () {

    return this._log_level;
  }

  get limit () {

    return this._limit;
  }

  get limit_default () {

    return 20;
  }

  get remaining () {

    return this._remaining;
  }

  get remaining_default () {

    return 20;
  }

  get reset_time () {

    return this._reset_time;
  }

  get reset_time_default () {

    return (new Date()).valueOf();
  }

  get headers () {

    return this._headers;
  }

  set headers (_headers) {

    this._headers = (_headers || {});
    this._update_ratelimit_data();

    return this;
  }

  async wait () {

    if (this.remaining <= 0) {

      let deadline = ISO8601X.unparse(this.reset_time);

      if (this.log_level > 1) {
        this._out.log('ratelimit', `Limit hit; waiting until ${deadline}`);
      }

      await this._wait_until(this.reset_time);

      if (this.log_level > 0) {
        this._out.log('ratelimit', `Reset time reached; resuming operation`);
      }
    }

    return await this._wait_rng();
  }

  async _wait_until (_ts) {

    return new Promise((_resolve) => {
      let i = setInterval(() => {
        if (Date.now() > this.reset_time) {
          clearInterval(i);
          return _resolve();
        }
      }, 500);
    });
  }

  async _wait_rng () {

    return new Promise((_resolve) => {
      setTimeout(_resolve, Math.floor(
        (this._crypto.randomBytes(1)[0] / this._rng_divisor) * 1000
      ));
    });
  }

  _update_ratelimit_data () {

    let limit = this.headers['x-ratelimit-limit'];
    let reset_time = this.headers['x-ratelimit-reset'];
    let remaining = this.headers['x-ratelimit-remaining'];

    if (limit) {
      let n = parseInt(limit, 10);
      this._limit = (isNaN(n) ? this.limit_default : n);
    }

    if (remaining) {
      let n = parseInt(remaining, 10);
      this._remaining = (isNaN(n) ? this.remaining_default : n);
    }

    if (reset_time) {
      let n = parseInt(reset_time, 10);
      this._reset_time = (isNaN(n) ? this.reset_time_default : n * 1000);
    }

    if (this.log_level > 1) {
      this._log_ratelimit_data();
    }

    return this;
  }

  _log_ratelimit_data () {

    let ts, now;

    try {
      now = ISO8601X.unparse(Date.now());
      ts = ISO8601X.unparse(this.reset_time);
    } catch (_e) {
      ts = 'unknown';
      ts = 'currently invalid';
    }

    this._out.log(
      'ratelimit', `Current time is ${now}`
    );

    this._out.log(
      'ratelimit',
        `${this.remaining}/${this.limit} remaining; reset time is ${ts}`
    );
  }
};

/* Export symbols */
module.exports = Ratelimit;

