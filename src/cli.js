// ✊🏿

'use strict';

const Base = require('./base');
const Out = require('./output');
const Client = require('./client');
const Arguments = require('./arguments');
const Credentials = require('./credentials');
const fs = require('fs').promises; /* Kept them */

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

    let config, profile;
    let args = this._args.parse();

    if (args.n) {
      this._out.warn('Use --confirm-no-delay if you wish to disable delays');
    }

    if (args.p != null) {
      this._out.warn('Use --confirm-page-size to truly change the page size');
    }

    if (args.n || args.p != null) {
      this._out.warn('You are responsible for deciding if this is allowed');
      this._out.warn('The authors bear no responsibility for your actions');
      this._out.fatal('You have been warned; refusing to continue as-is');
    }

    if (args.g <= 0) {
      this._out.fatal('Page size must be greater than zero');
    }

    try {
      let json_config = await fs.readFile(args.a);
      config = JSON.parse(json_config);
    } catch (_e) {
      this._out.fatal(`Unable to read authorization data from ${args.a}`, 2);
    }

    let credentials = new Credentials(config.mst, config.jst);

    let client = new Client(credentials, {
      page_size: args.g,
      ignore_last: !!args.i,
      disable_rng_delay: !!args.x,
      log_level: this._compute_log_level(args)
    });

    /* Command dispatch */
    switch (args._[0]) {

      case 'profile':
        await client.profile(args.u, true);
        break;

      case 'feed':
        await client.print_feed();
        break;

      case 'feedechoes':
        await client.print_feed_echoes();
        break;

      case 'posts':
        profile = await client.profile(args.u);
        await client.print_posts(profile);
        break;

      case 'echoes':
        profile = await client.profile(args.u);
        await client.print_echoes(profile);
        break;

      case 'comments':
        this._yargs_check_comment_options(args);
        if (args.i) {
          await(client.print_post_comments(args.i));
        } else {
          profile = await client.profile(args.u);
          await client.print_user_comments(profile);
        }
        break;

      case 'following':
        profile = await client.profile(args.u);
        await client.print_following(profile);
        break;

      case 'followers':
        profile = await client.profile(args.u);
        await client.print_followers(profile);
        break;

      case 'votes':
        profile = await client.profile(args.u);
        await client.print_votes(profile);
        break;

      case 'post':
        profile = await client.profile();
        await client.post(profile, args.c, true);
        break;

      case 'delete':
        profile = await client.profile();
        await client.delete(profile, args.i, true);
        break;

      default:
        this._args.usage();
        this._out.exit(1);
        break;
    }
  }

  _yargs_check_comment_options (_args) {

    /* Intentional == */
    let is_valid = (
      (_args.i != null && _args.u == null)
        || (_args.u != null && _args.i == null)
    );

    if (!is_valid) {
      this._args.usage();
      this._out.stderr("Missing required argument: u or i\n");
      this._out.exit(1);
    }

    return this;
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
};

/* Export symbols */
module.exports = CLI;

