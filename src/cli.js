// ✊🏿

'use strict';

const Base = require('./base');
const Out = require('./output');
const Client = require('./client');
const Arguments = require('./arguments');
const Credentials = require('./credentials');

/**
  The command-line interface to Parlaid.
  @extends Base
**/
const CLI = class extends Base {

  constructor (_options) {

    super(_options);

    this._out = new Out.Node();
    this._args = new Arguments();
  }

  async run () {

    let profile = {}, config = {};
    let args = this._args.parse();

    if (args.n) {
      this._out.warn('Use --confirm-no-delay if you wish to disable delays');
    }

    if (args.g == null && args.p != null) {
      this._out.warn('Use --confirm-page-size to truly change the page size');
    }

    if (args.n || args.p != null) {
      this._out.warn('You are responsible for deciding if this is allowed');
      this._out.warn('The authors bear no responsibility for your actions');
      this._out.fatal('You have been warned; refusing to continue as-is');
    }

    if (args.g != null && parseInt(args.g, 10) > 0) {
      this._out.fatal('Page size must be an integer greater than zero');
    }

    if (args._[0] === 'init') {
      config.mst = args.mst; config.jst = args.jst;
    } else {
      try {
        let json_config = await this._out.read_file(args.c);
        config = JSON.parse(json_config);
      } catch (_e) {
        this._out.fatal(`Unable to read authorization data from ${args.c}`, 2);
      }
    }

    let credentials = new Credentials(config.mst, config.jst);

    let client = new Client(credentials, {
      page_size: args.g,
      ignore_last: !!args.i,
      credentials_output: args.o,
      disable_rng_delay: !!args.x,
      log_level: this._compute_log_level(args),
      expand_fields: this._parse_expand_option(args.e)
    });

    /* Be human-friendly */
    let wrote_credentials = false;
    let mst = decodeURIComponent(config.mst);
    let jst = decodeURIComponent(config.jst);

    if (config.mst !== mst || config.jst !== jst) {
      this._out.warn('Detected invalid URI-encoded credentials; correcting');
      client.credentials.mst = mst; client.credentials.jst = jst;
      client.session.write_credentials();
      wrote_credentials = true;
    }

    /* Command dispatch */
    switch (args._[0]) {

      case 'init':
        if (args.c !== this._args.default_credentials_path) {
          this._out.fatal('Credentials are unnecessary; please use -o');
        }
        if (!args.o) {
          this._out.fatal('Refusing to continue without an output file');
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
        this._out.exit(1);
        break;
    }
  }

  async _ensure_post_exists (_client, _id) {

    try {
      await _client.post(_id, true);
    } catch (_e) {
      this._out.fatal(_e.message);
    }
  }

  _compute_log_level (_args) {

    if (_args.s) {
      return -1;
    }

    if (_args.q) {
      return 0;
    }

    if (_args.v) {
      return 2;
    }

    return 1;
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
            this._out.fatal('Cannot reuse -e after specifying -e none');
          }
          rv = {};
          break;
        case 'all':
          if (len > 1) {
            this._out.fatal('Cannot reuse -e after specifying -e all');
          }
          rv = valid;
          break;
        case 'help':
          let keys = Object.keys(Object.assign(valid, {
            all: true, none: true, help: true
          }));
          this._out.fatal(`Valid -e field types: ${keys.join(', ')}`);
          break;
        default:
          if (valid[_array[i]]) {
            rv[_array[i]] = true;
          } else {
            this._out.warn(`Invalid option '-e ${_array[i]}' provided`);
            this._out.fatal(`Use '-e help' to view a list of valid fields`);
          }
          break;
      }
    }

    return rv;
  }
};

/* Export symbols */
module.exports = CLI;

