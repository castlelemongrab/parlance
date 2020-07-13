// ✊🏿

'use strict';

const Base = require('./base');
const Out = require('./output');
const Session = require('./session');
const Credentials = require('./session');
const Ratelimit = require('./ratelimit');
const bent = require('bent'); /* Get bent */
const ISO8601X = require('./iso8601x'); /* It's time */

/**
  The core HTTPS client implementation.
  @extends Base
**/
const Client = class extends Base {

  constructor (_credentials, _options) {

    super(_options);

    this._log_level = (this.options.log_level || 1);
    this._out = (this.options.output || new Out.Default());
    this._expand_fields = (this.options.expand_fields || {});

    this._page_size_override = (
      this.options.page_size ?
        parseInt(_options.page_size, 10) : null
    );

    this._credentials = _credentials;
    this._page_size_temporarily_disabled = false;
    this._ignore_last = !!this.options.ignore_last;
    this._url = (this.options.url || 'https://api.parler.com/');

    this._ua = (
      this.options.ua || [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'AppleWebKit/537.36 (KHTML, like Gecko)',
        'Chrome/83.0.4103.116',
        'Safari/537.36'
      ].join(' ')
    );

    this._session = new Session(this.credentials, null, {
      log_level: this.log_level,
      credentials_output: this.options.credentials_output
    });

    this._ratelimit = new Ratelimit(null, {
      log_level: this.log_level,
      disable_rng_delay: !!this.options.disable_rng_delay
    });

    return this;
  }

  get session() {

    return this._session;
  }

  get credentials () {

    return this._credentials;
  }

  get log_level () {

    return this._log_level;
  }

  get user_agent () {

    return this._ua;
  }

  get base_url () {

    return this._url;
  }

  get page_size () {

    return (this._page_size_override || this._page_size);
  }

  get log_level () {

    return this._log_level;
  }

  set page_size (_page_size) {

    if (this._page_size_override) {
      return this;
    }

    let page_size = parseInt(_page_size, 10);

    if (page_size > 0) {
      this._page_size = page_size;
    }

    return this;
  }

  /** HTTPS functions **/

  _create_client (_headers, _method) {

    let headers = (_headers || {});
    let method = (_method || 'GET');

    let mst = encodeURIComponent(this._credentials.mst);
    let jst = encodeURIComponent(this._credentials.jst);

    headers = Object.assign(_headers, {
      'User-Agent': this.user_agent,
      'Origin': 'https://parler.com',
      'Cookie': `jst=${jst}; mst=${mst}`
    });

    return bent(this.base_url, method, null, 200, headers);
  }

  _create_extra_headers (_args) {

    let args = (_args || {});

    let rv = {
      'Accept-Language': 'en-us',
      'Referrer': (_args.referrer || 'https://parler.com')
    };

    if (args.username) {
      rv.Referrer += `/profile/${encodeURIComponent(args.username)}/posts`;
    } else if (args.id) {
      rv.Referrer += `/post-view?q=${encodeURIComponent(args.id)}`;
    } else if (args.tag) {
      rv.Referrer += `/?hashtag=${encodeURIComponent(args.tag)}`;
    }

    return rv;
  }

  /** Result output functions **/

  _start_json_results () {

    this._out.stdout("[\n");
    return true;
  }

  _end_json_results () {

    this._out.stdout("\n]\n");
    return true;
  }

  _print_json_results (_results, _is_first_page, _is_final_page) {

    if (_results.length <= 0) {
      return true;
    }

    for (let i = 0, len = _results.length; i < len; ++i) {

      if (typeof _results[i] !== 'object') {
        this._out.warn('Skipping invalid non-object result');
      }

      if (!(_is_first_page && i <= 0)) {
        this._out.stdout(",");
      }

      this._out.stdout(
        JSON.stringify(_results[i]).trim()
      );
    }

    return true;
  }

  /** Paging **/

  _temporarily_disable_page_size () {

    this._page_size_temporarily_disabled = true;
    return this;
  }

  async _paged_request (_profile, _request_callback, _reduce_callback,
                        _result_callback, _start_callback, _end_callback) {

    /* To do:
        This paging logic could be pulled out into a buffered iterator. */

    let record = {};
    let results = [];
    let is_first_page = true;
    let prev_key = null, next_key = null;

    if (!_request_callback) {
      throw new Error('Request callback required');
    }

    let end_cb = (_end_callback || this._end_json_results.bind(this));
    let start_cb = (_start_callback || this._start_json_results.bind(this));
    let result_cb = (_result_callback || this._print_json_results.bind(this));

    if (!start_cb()) {
      throw new Error('Result dispatch: start failed');
    }

    for (;;) {

      /* Fail closed */
      let key_comparison = 0;

      /* Perform actual network request */
      let record = await _request_callback(_profile, next_key);
      next_key = record.next;

      /* Extract result array */
      results = _reduce_callback(record);

      /* Yikes and a half:
          Occasionally, the API will return differently-formatted
          non-string timestamps of zero. This is, of course, nuts. */

      let is_next_key_valid = (next_key.toString() != 0);

      /* Enforce monotonicity */
      if (!is_first_page && is_next_key_valid) {
        try {
          let prev_key_parsed = ISO8601X.parse_extended(prev_key);
          let next_key_parsed = ISO8601X.parse_extended(next_key);

          key_comparison = ISO8601X.compare_extended(
            prev_key_parsed, next_key_parsed
          );

          if (this.log_level > 1) {
            let tskp = ISO8601X.unparse_extended(next_key_parsed, true);
            this._out.log('paging', `Next time-series key will be ${tskp}`);
          }
        } catch (_e) {
          throw new Error('Invalid or corrupt time-series key');
        }
      }

      /* Primary exit condition */
      let is_final_page = (
        (!is_first_page && key_comparison >= 0) ||
          (this._ignore_last ? false : record.last == true)
      );

      /* Supplemental exit condition */
      if (!results.length) {
        is_final_page = true;
      }

      /* Dispatch result */
      if (!result_cb(results, is_first_page, is_final_page)) {
        throw new Error('Result dispatch failed');
      }

      is_first_page = false;
      prev_key = next_key;

      /* Termination */
      if (is_final_page) {
        break;
      }
    }

    /* Some APIs don't use the limit parameter */
    this._page_size_temporarily_disabled = false;

    if (!end_cb()) {
      throw new Error('Result dispatch: completion failed');
    }

    this._out.log_level(
      'success', 'Finished fetching paged results', this.log_level, 0
    );

    return true;
  }

  async _paged_request_one (_url, _profile, _start_key, _url_callback) {

    let url = _url.slice(); /* Clone */

    let request = this._create_client(
      this._create_extra_headers(_profile)
    );

    let url_callback = (
      _url_callback || ((_p) => {
        return (_p._id ? `id=${encodeURIComponent(_p._id)}` : null);
      })
    );

    let qs = (url_callback(_profile || {}) || '');

    /* Some APIs don't use the limit parameter */
    if (!this._page_size_temporarily_disabled) {
      qs = `${qs}&limit=${encodeURIComponent(this.page_size)}`;
    }

    if (_start_key) {
      qs += `&startkey=${encodeURIComponent(_start_key)}`;
    }

    if (qs) {
      url = `${_url}?${qs}`;
    }

    if (this.log_level > 0) {
      this._out.log_network(url);
    }

    /* HTTPS request */
    let rv = await request(url);

    /* Propagate response headers */
    this._ratelimit.headers = rv.headers;
    await this._session.set_headers(rv.headers);

    /* Minimize impact on service */
    await this._ratelimit.wait();

    /* Finished */
    return rv;
  }

  /** Generic threading functions **/

  _reparent (_targets, _refs, _target_properties) {

    let refhash = {};

    /* Smoke it up */
    for (let i = 0, len = _refs.length; i < len; ++i) {
      if (typeof _refs[i] !== 'object') {
        throw new Error(`Expected object at ${i} reference array`);
      }
      refhash[_refs[i].id || _refs[i]._id] = _refs[i];
    }

    /* And improvise */
    for (let i = 0, len = _targets.length; i < len; ++i) {

      if (typeof _targets[i] !== 'object') {
        throw new Error(`Expected object at ${i} in targets array`);
      }

      _target_properties.forEach((_k) => {
        this._reparent_one(_targets[i], refhash, _k);
      });
    }

    return this;
  }

  _reparent_one (_target, _refhash, _key) {

    /* Only reparent/expand if asked to */
    if (!this._expand_fields[_key]) {
      return this;
    }

    /* Find value to reparent */
    let value = _target[_key];

    if (!value) {
      return this;
    }

    /* A brief comment:
        If you're a backend engineer and do this to your frontend
        team, you are committing a crime and should be disciplined. */

    if (Array.isArray(value)) {

      /* Handle an array of UUIDs */
      for (let i = 0, len = value.length; i < len; ++i) {
        if (_refhash[value[i]]) {
          value[i] = _refhash[value[i]];
        } else {
          throw new Error(`Reference to invalid UUID ${value[i]} at ${i}`);
        }
      }

    } else {

      /* Handle a single UUID */
      if (_refhash[value]) {
        _target[_key] = _refhash[value];
      } else {
        throw new Error(`Reference to invalid UUID ${value}`);
      }
    }

    return _target;
  }

  _reparent_all (_o) {

    /* Expand author */
    this._reparent(
      (_o.posts || []), (_o.users || []), [ 'creator' ]
    );

    /* Expand parent/root */
    this._reparent(
      (_o.posts || []), (_o.postRefs || []), [ 'parent', 'root' ]
    );

    /* Expand links */
    this._reparent(
      (_o.posts || []), (_o.urls || []), [ 'links' ]
    );

    return _o;
  }

  /** Paged API request callbacks **/

  async _request_feed (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/feed', _profile, _start_ts, () => null
    );

    let rv = await response.json();
    return this._reparent_all(rv);
  }

  async _request_creator (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/post/creator', _profile, _start_ts
    );

    let rv = await response.json();
    return this._reparent_all(rv);
  }

  async _request_following (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/follow/following', _profile, _start_ts
    );

    return await response.json();
  }

  async _request_followers (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/follow/followers', _profile, _start_ts
    );

    return await response.json();
  }

  async _request_user_comments (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/comment/creator', _profile, _start_ts, (_profile) => {
        return `username=${encodeURIComponent(_profile.username)}`;
      }
    );

    let rv = await response.json();

    /* Expand links */
    this._reparent(
      (rv.comments || []), (rv.urls || []), [ 'links' ]
    );

    return rv;
  }

  async _request_post_comments (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/comment', _profile, _start_ts, (_profile) => {
        return `id=${encodeURIComponent(_profile._id)}&reverse=true`;
      }
    );

    return await response.json();
  }

  async _request_tag (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/post/hashtag', _profile, _start_ts, (_profile) => {
        return `tag=${encodeURIComponent(_profile.tag)}`;
      }
    );

    let rv = await response.json();
    return this._reparent_all(rv);
  }

  async _request_votes (_profile, _start_ts) {

    const response = await this._paged_request_one(
      'v1/post/creator/liked', _profile, _start_ts
    );

    let rv = await response.json();
    return this._reparent_all(rv);
  }

  async _request_affiliate_news (_profile, _start_ts) {

    let profile = Object.assign((_profile || {}), {
      referrer: 'https://parler.com/discover'
    });

    const response = await this._paged_request_one(
      'v1/discover/news', profile, _start_ts
    );

    return await response.json();
  }

  async _request_moderation(_profile, _start_ts) {

    let profile = Object.assign((_profile || {}), {
      referrer: 'https://parler.com/moderation'
    });

    const response = await this._paged_request_one(
      'v1/moderation/pending', profile, _start_ts
    );

    return await response.json();
  }

  /** Paged API print functions **/

  async _print_generic (_profile, _fn_name, _key) {

    return await this._paged_request(
      _profile, this[_fn_name].bind(this), (_o) => (_o[_key] || [])
    );
  }

  /** API endpoints **/

  async profile (_username, _print_results) {

    let request = this._create_client(
      this._create_extra_headers({ username: _username })
    );

    let url = `v1/profile`;

    if (_username) {
      url = `${url}?username=${encodeURIComponent(_username)}`;
    }

    if (this.log_level > 0) {
      this._out.log_network(url);
    }

    /* HTTPS request */
    const r = await request(url);
    const rv = await r.json();

    /* Optionally print results */
    if (_print_results) {
      this._start_json_results();
      this._print_json_results([ rv ], true);
      this._end_json_results();
    }

    await this._ratelimit.wait();
    return rv;
  }

  async post (_id, _print_results) {

    let request = this._create_client(
      this._create_extra_headers({ id: _id })
    );

    let url = `v1/post?id=${encodeURIComponent(_id)}`;

    if (this.log_level > 0) {
      this._out.log_network(url);
    }

    /* HTTPS request */
    const r = await request(url);
    let rv = await r.json();

    /* Reparent */
    rv.posts = [ rv.post ];
    this._reparent_all(rv);

    /* Optionally print results */
    if (_print_results) {
      this._start_json_results();
      this._print_json_results(rv.posts, true);
      this._end_json_results();
    }

    await this._ratelimit.wait();
    return rv;
  }

  async write_post (_profile, _text, _print_results) {

    let body = {
      body: _text,
      parent: null, links: [], state: 4
    }

    let request = this._create_client(
      this._create_extra_headers(_profile), 'POST'
    );

    let url = 'v1/post';

    if (this.log_level > 0) {
      this._out.log_network(url, body);
    }

    /* HTTPS request */
    const r = await request(url, body);
    const rv = await r.json();

    /* Optionally print results */
    if (_print_results) {
      this._start_json_results();
      this._print_json_results([ rv ], true);
      this._end_json_results();
    }

    await this._ratelimit.wait();
    return rv;
  }

  async delete_post (_profile, _id, _print_results) {

    let body = { id: _id };

    let request = this._create_client(
      this._create_extra_headers(_profile), 'POST'
    );

    let url = 'v1/post/delete';

    if (this.log_level > 0) {
      this._out.log_network(url, body);
    }

    /* HTTPS request */
    const r = await request(url, body);
    const rv = await r.json();

    /* Optionally print results */
    if (_print_results) {
      this._start_json_results();
      this._print_json_results([ rv ], true);
      this._end_json_results();
    }

    await this._ratelimit.wait();
    return rv;
  }

  async print_feed (_profile) {

    this.page_size = 10;

    return this._print_generic(
      _profile, '_request_feed', 'posts'
    );
  }

  async print_posts (_profile) {

    this.page_size = 20;

    return this._print_generic(
      _profile, '_request_creator', 'posts'
    );
  }

  async print_following (_profile) {

    this.page_size = 10;

    return this._print_generic(
      _profile, '_request_following', 'followees'
    );
  }

  async print_followers (_profile) {

    this.page_size = 10;

    return this._print_generic(
      _profile, '_request_followers', 'followers'
    );
  }

  async print_user_comments (_profile) {

    this.page_size = 10;

    return this._print_generic(
      _profile, '_request_user_comments', 'comments'
    );
  }

  async print_post_comments (_id) {

    this.page_size = 10;
    this._temporarily_disable_page_size(); /* They do this */

    return this._print_generic(
      { _id: _id }, '_request_post_comments', 'comments'
    );
  }

  async print_comment_replies (_profile, _id) {

    this.page_size = 10;
    this._temporarily_disable_page_size(); /* They do this */

    return this._print_generic(
      { _id: _id, username: _profile.username },
        '_request_post_comments', 'comments'
    );
  }

  async print_tag (_profile, _id) {

    this.page_size = 10;

    return this._print_generic(
      { tag: _profile.tag }, /* Fix this */
        '_request_tag', 'posts'
    );
  }

  async print_votes (_profile) {

    this.page_size = 10;

    return this._print_generic(
      _profile, '_request_votes', 'posts'
    );
  }

  async print_affiliate_news (_profile) {

    this.page_size = 20;

    return this._print_generic(
      _profile, '_request_affiliate_news', 'links'
    );
  }

  async print_moderation (_profile) {

    this._temporarily_disable_page_size(); /* They do this */

    return this._print_generic(
      _profile, '_request_moderation', 'comments'
    );
  }
};

/* Export symbols */
module.exports = Client;

