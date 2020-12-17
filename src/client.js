// ✊🏿

'use strict';

const Base = require('./base');
const Session = require('./session');
const Emitter = require('./emitter');
const Credentials = require('./session');
const Ratelimit = require('./ratelimit');
const IO = require('@castlelemongrab/ioh');
const bent = require('bent'); /* Get bent */
const ISO8601X = require('./iso8601x'); /* It's time */

/**
  The core HTTPS client implementation.
  @extends Base
**/
const Client = class extends Base {

  /**
  **/
  constructor (_credentials, _options) {

    super(_options);

    this._io = (this.options.io || new IO.Node());
    this._retry_limit = (this.options.retry_limit || 10);
    this._expand_fields = (this.options.expand_fields || {});
    this._emitter = (this.options.emitter || new Emitter.Default());

    this._page_size_override = (
      this.options.page_size ?
        parseInt(_options.page_size, 10) : null
    );

    this._credentials = _credentials;
    this._page_size_disabled = false;
    this._ignore_last = !!this.options.ignore_last;
    this._domain = (this.options.domain || 'parler.com');
    this._url = (this.options.url || `https://api.${this.domain}/`);

    this._ua = (
      this.options.ua || [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'AppleWebKit/537.36 (KHTML, like Gecko)',
        'Chrome/83.0.4103.116',
        'Safari/537.36'
      ].join(' ')
    );

    this._session = new Session(this.credentials, null, {
      io: this._io,
      credentials_output: this.options.credentials_output
    });

    this._ratelimit = new Ratelimit(null, {
      io: this._io,
      disable_rng_delay: !!this.options.disable_rng_delay
    });

    return this;
  }

  /** Accessor functions **/

  /**
  **/
  get start_key () {

    return this._start_key;
  }

  /**
  **/
  set start_key (_start_key) {

    this._start_key = (_start_key || null);
  }

  /**
  **/
  get end_key() {

    return this._end_key;
  }

  /**
  **/
  set end_key(_end_key) {

    this._end_key = (_end_key || null);
  }

  /**
  **/
  get domain () {

    return this._domain;
  }

  /**
  **/
  get session () {

    return this._session;
  }

  /**
  **/
  get credentials () {

    return this._credentials;
  }

  /**
  **/
  get user_agent () {

    return this._ua;
  }

  /**
  **/
  get base_url () {

    return this._url;
  }

  /**
  **/
  get page_size () {

    return (this._page_size_override || this._page_size);
  }

  /**
  **/
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

  /**
  **/
  _create_client (_headers, _method) {

    let headers = (_headers || {});
    let method = (_method || 'GET');

    let mst = encodeURIComponent(this._credentials.mst);
    let jst = encodeURIComponent(this._credentials.jst);

    headers = Object.assign(_headers, {
      'User-Agent': this.user_agent,
      'Origin': `https://${this.domain}`,
      'Cookie': `jst=${jst}; mst=${mst}`
    });

    return bent(this.base_url, method, null, 200, headers);
  }

  /**
  **/
  _create_headers (_options) {

    let o = (_options || {});

    let rv = {
      'Accept-Language': 'en-us',
      'Referrer': (o.referrer || `https://${this.domain}`)
    };

    if (o.username) {
      rv.Referrer += `/profile/${encodeURIComponent(o.username)}/posts`;
    } else if (o.id) {
      rv.Referrer += `/post-view?q=${encodeURIComponent(o.id)}`;
    } else if (o.tag) {
      rv.Referrer += `/?hashtag=${encodeURIComponent(o.tag)}`;
    }

    return rv;
  }

  /** Paging **/

  /**
  **/
  disable_page_size () {

    this._page_size_disabled = true;
    return this;
  }

  /**
  **/
  enable_page_size () {

    this._page_size_disabled = false;
    return this;
  }

  /**
   **/
  _object_to_querystring_fragment (_obj) {

    let rv = '';
    let o = (_obj || {});

    for (let k in o) {

      if (o[k] == null) {
        continue;
      }

      if (rv != '') {
        rv += '&';
      }

      rv += `${k}=${encodeURIComponent(o[k])}`;
    }

    return rv;
  }

  /**
  **/
  async _paged_generic_print (_query, _fn_name, _key) {

    return await this._paged_request(
      _query, this[_fn_name].bind(this), (_o) => (_o[_key] || [])
    );
  }

  /**
  **/
  async _paged_request (_query, _request_callback, _reduce_callback) {

    let record = {};
    let results = [];
    let error_count = 0;
    let prev_key = null, next_key = null;
    let start_parsed = null, end_parsed = null;
    let is_first_page = true, is_final_page = false;
    let reduce_callback = (_reduce_callback || ((_x) => _x));

    /* Support for time-series constraints:
        These options allow the caller to specify start and/or end
        keys for paged requests. For the start key, we rely the server's
        `startkey` HTTP option. For the end key, we correctly avoid a scary
        database's `endkey` HTTP option and just use what we already know. */

    try {
      if (this.start_key) {
        start_parsed = ISO8601X.parse_extended(this.start_key);
        next_key = ISO8601X.unparse_extended(start_parsed, true);
      }
      if (this.end_key) {
        end_parsed = ISO8601X.parse_extended(this.end_key);
      }
    } catch (_e) {
      throw Error('Malformed start and/or end time-series key');
    }

    if (!_request_callback) {
      throw new Error('Request callback required');
    }

    if (!this._emitter.start()) {
      throw new Error('Result dispatch: start failed');
    }

    /* Main request loop:
        This repearedly requests and emits paged time-series data. */

    for (;;) {

      let record = null;

      /* Issue network requests */
      try {

        /* Actual HTTP request happens here */
        record = await _request_callback(_query, next_key);

      } catch (_e) {

        /* Handle request errors */
        if (error_count++ >= this._retry_limit) {
          throw new Error('Retry limit exceeded; refusing to continue');
        }

        this._io.log('network', _e.message);
        this._io.log('network', `Retrying request (attempt ${error_count})`);

        /* Force randomized exponential backoff */
        await this._ratelimit.wait(true, true);
        continue;
      }

      /* Reduce into results array */
      results = reduce_callback(record);
      this._ratelimit.reset_rng_multiplier();

      /* Exit condition: no results */
      if (!results.length) {
        this._io.log('paging', 'Received zero-length result; stopping');
        break;
      }

      /* Exit condition: check for 'last' indicator */
      if (this._ignore_last ? false : record.last == true) {
        is_final_page = true;
      }

      /* Emit result data */
      if (!this._emitter.emit(results, is_first_page, is_final_page)) {
        throw new Error('Result dispatch failed');
      }

      /* Slide over */
      prev_key = next_key;
      next_key = record.next;

      /* Exit condition: compare time-series keys */
      try {

        /* Tell the user where we are */
        let next_parsed = ISO8601X.parse_extended(next_key);
        this._io.log('paging', `Next time-series key is ${next_key}`, 2);

        /* Compare keys */
        if (prev_key != null) {
          let prev_parsed = ISO8601X.parse_extended(prev_key);

          /* Exit condition: non-monotonicity */
          if (ISO8601X.compare_extended(prev_parsed, next_parsed) >= 0) {
            this._io.warn(`Next key ${next_key} is later than ${prev_key}`);
            this._io.warn('Time-series has gone non-monotonic; stopping now');
            is_final_page = true;
          }

          /* Exit condition: passing the end key */
          if (end_parsed != null) {
            if (ISO8601X.compare_extended(end_parsed, next_parsed) <= 0) {
              is_final_page = true;
              this._io.log('paging', 'Time-series end key found; stopping');
            }
          }
        }
      } catch (_e) {
        this._io.log('paging', 'API returned an invalid time-series key', 2);
        this._io.log('paging', `Previous key is currently ${prev_key}`, 2);
        this._io.log('paging', `Start/next key is currently ${next_key}`, 2);
        throw new Error('Invalid or corrupt time-series key');
      }

      /* Finish up */
      error_count = 0;
      is_first_page = false;

      if (is_final_page) {
        break;
      }
    }

    if (!this._emitter.finish()) {
      throw new Error('Result dispatch: completion failed');
    }

    this._io.log('success', 'Finished fetching paged results');
    this.start_key = null;

    return true;
  }

  /**
  **/
  async _paged_request_one (_url, _query, _start_key, _options) {

    let qs = {};
    let url = _url;

    /* Amend query */
    let query = Object.assign({}, _query); /* Clone */

    if (_start_key != null) {
      query.startkey = _start_key;
    };

    if (!this._page_size_disabled) {
      query.limit = this.page_size;
    }

    if (qs) {
      url += `?${this._object_to_querystring_fragment(query)}`;
    }

    /* HTTPS request */
    let request = this._create_client(
      this._create_headers(_options)
    );

    this._io.log('network', `Fetching ${url}`);
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

  /**
  **/
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

  /**
  **/
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

  /**
  **/
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

  /**
  **/
  async _request_feed (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/feed', _query, _start_ts
    );

    let rv = await response.json();
    return this._reparent_all(rv);
  }

  /**
  **/
  async _request_creator (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/post/creator', _query, _start_ts
    );

    let rv = await response.json();
    return this._reparent_all(rv);
  }

  /**
  **/
  async _request_following (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/follow/following', _query, _start_ts
    );

    return await response.json();
  }

  /**
  **/
  async _request_followers (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/follow/followers', _query, _start_ts
    );

    return await response.json();
  }

  /**
  **/
  async _request_user_comments (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/comment/creator', _query, _start_ts
    );

    let rv = await response.json();

    /* Expand links */
    this._reparent(
      (rv.comments || []), (rv.urls || []), [ 'links' ]
    );

    return rv;
  }

  /**
  **/
  async _request_post_comments (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/comment', _query, _start_ts
    );

    /* No refdata currently; might show up later */
    return this._reparent_all(await response.json());
  }

  /**
  **/
  async _request_tags (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/post/hashtag', _query, _start_ts
    );

    return this._reparent_all(await response.json());
  }

  /**
  **/
  async _request_votes (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/post/creator/liked', _query, _start_ts
    );

    return this._reparent_all(await response.json());
  }

  /**
  **/
  async _request_affiliate_news (_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/discover/news', _query, _start_ts, {
        referrer: `https://${this.domain}/discover`
      }
    );

    return await response.json();
  }

  /**
  **/
  async _request_moderation(_query, _start_ts) {

    const response = await this._paged_request_one(
      'v1/moderation/pending', _query, _start_ts, {
        referrer: `https://${this.domain}/moderation`
      }
    );

    return await response.json();
  }

  /** Generic single-request functions **/

  /**
  **/
  async _request_generic (_method, _url, _headers, _final_fn, _body) {

    /* Create a new `bent` instance */
    let request = this._create_client(
      this._create_headers(_headers), _method
    );

    /* HTTPS request */
    await this._ratelimit.wait();
    this._io.log('network', `Fetching ${_url}`);
    const r = await request(_url, _body);

    /* Reduce to JSON */
    const json = await r.json();
    await _final_fn(r, json);

    return json;
  }

  /**
  **/
  async _request_print_generic (_array, _is_silent) {

    if (!_is_silent) {
      this._emitter.start();
      this._emitter.emit(_array, true);
      this._emitter.finish();
    }

    return Promise.resolve();
  }

  /** API endpoints **/

  /**
  **/
  async profile (_username, _is_silent) {

    let h = {};
    let url = 'v1/profile';

    if (_username) {
      h.username = _username;
      url = `${url}?username=${encodeURIComponent(_username)}`;
    }

    return await this._request_generic(
      'GET', url, h, async (_r, _json) => {
        return await this._request_print_generic([ _json ], _is_silent);
      }
    );
  }

  /**
  **/
  async post (_id, _is_silent) {

    let h = { id: _id };
    let url = `v1/post?id=${encodeURIComponent(_id)}`;

    return await this._request_generic(
      'GET', url, h, async (_r, _json) => {
        _json.posts = [ _json.post ]; this._reparent_all(_json);
        return await this._request_print_generic(_json.posts, _is_silent);
      }
    );
  }

  /**
  **/
  async write_post (_query, _text) {

    let url = 'v1/post';

    let body = {
      body: _text,
      parent: null, links: [], state: 4
    }

    return await this._request_generic(
      'POST', url, _query, async (_r, _json) => {
        return await this._request_print_generic([ _json ]);
      }, body
    );
  }

  /**
  **/
  async delete_post (_query, _id) {

    let body = { id: _id };
    let url = 'v1/post/delete';

    return await this._request_generic(
      'POST', url, _query, async (_r, _json) => {
        return await this._request_print_generic([ _json ]);
      }, body
    );
  }

  /**
  **/
  async follow (_username) {

    let body = { username: _username }; /* Yikes */
    let h = { referrer: `https://${this.domain}/feed` };
    let url = `v1/follow?username=${encodeURIComponent(_username)}`;

    return await this._request_generic(
      'POST', url, h, async (_r, _json) => {
        return await this._request_print_generic([ _json ]);
      }, body
    );
  }

  /**
  **/
  async unfollow (_username) {

    let body = { username: _username }; /* Yikes */
    let h = { referrer: `https://${this.domain}/feed` };
    let url = `v1/follow/delete?username=${encodeURIComponent(_username)}`;

    return await this._request_generic(
      'POST', url, h, async (_r, _json) => {
        return await this._request_print_generic([ _json ]);
      }, body
    );
  }

  /**
  **/
  async mute (_username) {

    let body = { username: _username }; /* Yikes */
    let h = { referrer: `https://${this.domain}/feed` };
    let url = `v1/user/mute?username=${encodeURIComponent(_username)}`;

    return await this._request_generic(
      'POST', url, h, async (_r, _json) => {
        return await this._request_print_generic([ _json ]);
      }, body
    );
  }

  /**
  **/
  async print_feed (_profile) {

    this.page_size = 10;

    return this._paged_generic_print(
      { id: _profile._id },
        '_request_feed', 'posts'
    );
  }

  /**
  **/
  async print_posts (_profile) {

    this.page_size = 20;

    return this._paged_generic_print(
      { id: _profile._id },
        '_request_creator', 'posts'
    );
  }

  /**
  **/
  async print_following (_profile) {

    this.page_size = 10;

    return this._paged_generic_print(
      { id: _profile._id },
        '_request_following', 'followees'
    );
  }

  /**
  **/
  async print_followers (_profile) {

    this.page_size = 10;

    return this._paged_generic_print(
      { id: _profile._id },
        '_request_followers', 'followers'
    );
  }

  /**
  **/
  async print_user_comments (_profile) {

    this.page_size = 10;

    return this._paged_generic_print(
      { id: _profile._id, username: _profile.username },
        '_request_user_comments', 'comments'
    );
  }

  /**
  **/
  async print_post_comments (_id) {

    this.page_size = 10;
    this.disable_page_size(); /* They do this */

    let rv = this._paged_generic_print(
      { id: _id, reverse: true },
        '_request_post_comments', 'comments'
    );

    this.enable_page_size();
    return rv;
  }

  /**
  **/
  async print_comment_replies (_profile, _id) {

    this.page_size = 10;
    this.disable_page_size(); /* They do this */

    let rv = this._paged_generic_print(
      { id: _id, username: _profile.username },
        '_request_post_comments', 'comments'
    );

    this.enable_page_size();
    return rv;
  }

  /**
  **/
  async print_tags (_tag_name) {

    this.page_size = 10;

    return this._paged_generic_print(
      { tag: _tag_name }, '_request_tags', 'posts'
    );
  }

  /**
  **/
  async print_votes (_profile) {

    this.page_size = 10;

    return this._paged_generic_print(
      { id: _profile._id },
        '_request_votes', 'posts'
    );
  }

  /**
  **/
  async print_affiliate_news (_profile) {

    this.page_size = 20;

    return this._paged_generic_print(
      { id: _profile._id },
        '_request_affiliate_news', 'links'
    );
  }

  /**
  **/
  async print_moderation (_profile) {

    this.disable_page_size(); /* They do this */

    let rv = this._paged_generic_print(
      { id: _profile._id },
        '_request_moderation', 'comments'
    );

    this.enable_page_size();
    return rv;
  }
};

/* Export symbols */
module.exports = Client;

