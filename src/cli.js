// ✊🏿

'use strict';

const Base = require('./base');
const Client = require('./client');
const Emitter = require('./emitter');
const Arguments = require('./arguments');
const IO = require('@castlelemongrab/ioh');
const Credentials = require('./credentials');

/**
  The command-line interface to Parlaid.
  @extends Base
**/
const CLI = class extends Base {

  constructor (_options) {

    super(_options);

    this._io = new IO.Node();
    this._args = new Arguments();
    return this;
  }

  /**
    This is a far lesser evil than touching the filesystem,
    or something similarly dynamic and scary; do not @ me.
  **/
  instansiate_emitter_from_option (_str) {

    switch (_str) {
      case 'json':
      case 'default':
        return new Emitter.JSON();
      case 'jsonl':
        return new Emitter.JSONL();
      default:
        break;
    }

    return false;
  }

  async run () {

    let profile = {}, config = {};
    let args = this._args.parse();

    let page_size = null;
    let guarded_option_used = false;

    if (args.n) {
      this._io.warn('Use --confirm-no-delay to truly disable delays');
      guarded_option_used = true;
    }

    if (args.p != null) {
      this._io.warn('Use --confirm-page-size to truly change the page size');
      guarded_option_used = true;
    }

    if (guarded_option_used) {
      this._io.warn('You are responsible for deciding if this is allowed');
      this._io.warn('The authors bear no responsibility for your actions');
      this._io.fatal('You have been warned; refusing to continue as-is');
    }

    if (args.g != null) {
      /* Yargs should be type-checking this */
      page_size = parseInt(args.g, 10);
      if (isNaN(page_size) || page_size <= 0) {
        this._io.fatal('Page size must be an integer greater than zero');
      }
    }

    /* Initial configuration */
    if (args._[0] === 'init') {
      config.mst = args.mst; config.jst = args.jst;
    } else {
      try {
        let json_config = await this._io.read_file(args.c);
        config = JSON.parse(json_config);
      } catch (_e) {
        this._io.fatal(`Unable to read authorization data from ${args.c}`, 2);
      }
    }

    /* Output format */
    if (args.f != null) {
      if (!(this._emitter = this.instansiate_emitter_from_option(args.f))) {
        this._io.fatal(`Invalid or unknown output engine '${args.f}'`);
      }
    }

    let credentials = new Credentials(config.mst, config.jst);

    let client = new Client(credentials, {
      io: this._io,
      page_size: page_size,
      ignore_last: !!args.i,
      emitter: this._emitter,
      credentials_output: args.o,
      disable_rng_delay: !!args.x,
      expand_fields: this._parse_expand_option(args.e)
    });

    /* Support arbitrary start keys */
    if (args.k) {
      client.start_key = decodeURIComponent(args.k).replace('@', '_');
    }

    /* Try to be human-friendly */
    let wrote_credentials = false;
    let mst = decodeURIComponent(config.mst);
    let jst = decodeURIComponent(config.jst);

    if (config.mst !== mst || config.jst !== jst) {
      this._io.warn('Detected invalid URI-encoded credentials; correcting');
      client.credentials.mst = mst; client.credentials.jst = jst;
      client.session.write_credentials();
      wrote_credentials = true;
    }

    /* Command dispatch */
    switch (args._[0]) {

      case 'init':
        if (args.c !== this._args.default_credentials_path) {
          this._io.fatal('Credentials are unnecessary; please use -o');
        }
        if (!args.o) {
          this._io.fatal('Refusing to continue without an output file');
        }
        if (!wrote_credentials) {
          client.session.write_credentials();
        }
        break;

      case 'profile':
        await client.profile(args.u);
        break;

      case 'feed':
        profile = await client.profile(null, true);
        await client.print_feed(profile);
        break;

      case 'post':
        await client.post(args.i);
        break;

      case 'posts':
        profile = await client.profile(args.u, true);
        await client.print_posts(profile);
        break;

      case 'echoes':
        profile = await client.profile(args.u, true);
        await client.print_echoes(profile);
        break;

      case 'comments':
        if (args.i) {
          await this._ensure_post_exists(client, args.i); /* Yikes */
          await client.print_post_comments(args.i);
        } else if (args.r) {
          profile = await client.profile(null, true);
          await client.print_comment_replies(profile, args.r);
        } else {
          profile = await client.profile(args.u, true);
          await client.print_user_comments(profile);
        }
        break;

      case 'following':
        profile = await client.profile(args.u, true);
        await client.print_following(profile);
        break;

      case 'followers':
        profile = await client.profile(args.u, true);
        await client.print_followers(profile);
        break;

      case 'tag':
        profile = await client.profile(args.u, true);
        await client.print_tag({ tag: args.t });
        break;

      case 'votes':
        profile = await client.profile(args.u, true);
        await client.print_votes(profile);
        break;

      case 'news':
        profile = await client.profile(null, true);
        await client.print_affiliate_news(profile);
        break;

      case 'write':
        profile = await client.profile(null, true);
        await client.write_post(profile, args.t);
        break;

      case 'delete':
        profile = await client.profile(null, true);
        await this._ensure_post_exists(client, args.i); /* Yikes */
        await client.delete_post(profile, args.i);
        break;

      case 'follow':
        await client.follow(args.u);
        break;

      case 'unfollow':
        await client.unfollow(args.u);
        break;

      case 'mute':
        await client.mute(args.u);
        break;

      case 'moderation':
        await client.print_moderation();
        break;

      default:
        this._args.usage();
        this._io.exit(1);
        break;
    }

    return true;
  }

  async _ensure_post_exists (_client, _id) {

    try {
      await _client.post(_id, true);
    } catch (_e) {
      this._io.fatal(_e.message);
    }
  }

  _parse_expand_option (_array) {

    let rv = {};

    let valid = {
      root: true, parent: true,
      links: true, creator: true
    };

    if (!_array) {
      return valid;
    }

    for (let i = 0, len = _array.length; i < len; ++i) {
      switch (_array[i]) {
        case 'none':
          if (len > 1) {
            this._io.fatal('Cannot reuse -e after specifying -e none');
          }
          rv = {};
          break;
        case 'all':
          if (len > 1) {
            this._io.fatal('Cannot reuse -e after specifying -e all');
          }
          rv = valid;
          break;
        case 'help':
          let keys = Object.keys(Object.assign(valid, {
            all: true, none: true, help: true
          }));
          this._io.fatal(`Valid -e field types: ${keys.join(', ')}`);
          break;
        default:
          if (valid[_array[i]]) {
            rv[_array[i]] = true;
          } else {
            this._io.warn(`Invalid option '-e ${_array[i]}' provided`);
            this._io.fatal(`Use '-e help' to view a list of valid fields`);
          }
          break;
      }
    }

    return rv;
  }
};

/* Export symbols */
module.exports = CLI;

