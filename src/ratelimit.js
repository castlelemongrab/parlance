// ✊🏿

'use strict';

const Base = require('./base');
const IO = require('@castlelemongrab/ioh');
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

    this._headers = (_headers || {});
    this._io = (this.options.io || new IO.Node());
    this._disable_rng_delay = !!this.options.disable_rng_delay;

    return this.reset();
  }

  reset () {

    this._rng_divisor = 48;
    this._limit = this.limit_default;
    this._remaining = this.remaining_default;
    this._reset_time = this.reset_time_default;

    return this.reset_rng_multiplier();
  }

  reset_rng_multiplier () {

    this._multiplier = 1000;
    return this;
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

  async wait (_force_rng_delay, _use_exponential_backoff) {

    if (this.remaining <= 0) {

      let deadline = ISO8601X.unparse(this.reset_time);
      this._io.log('ratelimit', `Limit hit; waiting until ${deadline}`);

      await this._wait_until(this.reset_time);
      this._io.log('ratelimit', `Reset time reached; resuming operation`, 2);
    }

    if (_force_rng_delay || !this._disable_rng_delay) {
      await this._wait_rng(_use_exponential_backoff);
    }

    return this;
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

  async _wait_rng (_use_exponential_backoff) {

    if (_use_exponential_backoff) {
      this._multiplier *= 2;
    } else {
      this._multiplier = 1000;
    }

    let delay = Math.floor(
      (this._crypto.randomBytes(1)[0] / this._rng_divisor) * this._multiplier
    );

    this._io.log('ratelimit', `Random delay waiting ${delay / 1000}s`, 1);
    return new Promise((_resolve) => setTimeout(_resolve, delay));
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

    this._log_ratelimit_data();
    return this;
  }

  _log_ratelimit_data () {

    let ts, now = ISO8601X.unparse(Date.now());

    try {
      ts = ISO8601X.unparse(this.reset_time);
    } catch (_e) {
      throw new Error('Peer provided an invalid ratelimit reset time');
    }

    this._io.log(
      'ratelimit', `Current time is ${now}`, 2
    );

    this._io.log(
      'ratelimit', `${this.remaining}/${this.limit}; reset time is ${ts}`, 1
    );
  }
};

/* Export symbols */
module.exports = Ratelimit;

