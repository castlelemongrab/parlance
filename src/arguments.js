// ✊🏿

'use strict';

const Base = require('./base');

/**
  An argument parser for command-line invocation.
  @extends Base
**/
const Arguments = class extends Base {

  constructor (_options) {

    super(_options);

    /* To do: this probably isn't ideal */
    this._yargs = require('yargs');

    this._default_credentials_path = 'config/auth.json';
    return this._setup();
  }

  get default_credentials_path () {

    return this._default_credentials_path;
  }

  parse () {

    return this._yargs.argv;
  }

  usage () {

    return this._yargs.showHelp();
  }

  _setup () {

    this._yargs.demandCommand(1)
      .option(
        'h', {
          type: 'boolean',
          alias: 'help',
          describe: 'Show help'
        }
      )
      .option(
        'c', {
          type: 'string',
          alias: 'credentials',
          describe: 'MST/JST tokens',
          default: this.default_credentials_path
        }
      )
      .option(
        'o', {
          type: 'string',
          alias: 'credentials-out',
          describe: 'Output file for client credentials'
        }
      )
      .option(
        'l', {
          type: 'boolean',
          alias: 'ignore-last',
          default: undefined,
          describe: 'Rely solely upon time comparisons'
        }
      )
      .option(
        'n', {
          type: 'boolean',
          alias: 'no-delay',
          default: undefined,
          describe: 'Disable the failsafe rate-limiter'
        }
      )
      .option(
        'x', {
          hidden: true,
          type: 'boolean',
          default: undefined,
          alias: 'confirm-no-delay',
          describe: 'Actually disable the failsafe rate-limiter'
        }
      )
      .option(
        'p', {
          type: 'number',
          alias: 'page-limit',
          describe: 'Set the page size limit'
        }
      )
      .option(
        'g', {
          hidden: true,
          type: 'number',
          alias: 'confirm-page-size',
          describe: 'Actually set the page size limit'
        }
      )
      .option(
        'v', {
          type: 'boolean',
          alias: 'verbose',
          default: undefined,
          conflicts: [ 'q', 's' ],
          describe: 'Print debug information to stderr'
        }
      )
      .option(
        'q', {
          type: 'boolean',
          alias: 'quiet',
          default: undefined,
          conflicts: [ 'v', 's' ],
          describe: 'Print less information to stderr'
        }
      )
      .option(
        's', {
          type: 'boolean',
          alias: 'silent',
          default: undefined,
          conflicts: [ 'v', 'q' ],
          describe: 'Print absolutely no information to stderr'
        }
      )
      .option(
        'e', {
          type: 'string',
          alias: 'expand',
          array: true,
          default: 'all',
          describe: 'Expand specific UUID types'
        }
      )
      .command(
        'init', 'Create an authorization file', {
          'mst': {
            type: 'string',
            demandOption: true,
            describe: 'The MST master session token'
          },
          'jst': {
            type: 'string',
            demandOption: true,
            describe: 'The shorter-lived JST session token'
          }
        }
      )
      .command(
        'feed', 'Fetch your own feed of posts'
      )
      .command(
        'profile', 'Fetch a user profile', {
          u: {
            type: 'string',
            alias: 'username',
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'post', 'Fetch a single post by identifier', {
          i: {
            type: 'string',
            alias: 'identifier',
            demandOption: true,
            describe: 'The unique identifier of the post'
          }
        }
      )
      .command(
        'write_comment', 'Comment on a post based on the post identifier', {
          i: {
            type: 'string',
            alias: 'identifier',
            demandOption: true,
            describe: 'The unique identifier of the post'
          },
          t: {
            type: 'string',
            alias: 'text',
            demandOption: true,
            describe: 'The textual content to post'
          }

        }
      )

      .command(
        'posts', 'Fetch all posts for a user', {
          u: {
            type: 'string',
            alias: 'username',
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'following', 'Fetch all users followed by a user', {
          u: {
            type: 'string',
            alias: 'username',
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'followers', 'Fetch all followers of a user', {
          u: {
            type: 'string',
            alias: 'username',
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'comments', 'Fetch all comments for a user, post, or comment', {
          u: {
            type: 'string',
            alias: 'username',
            conflicts: [ 'i', 'r' ],
            describe: 'The name of the user'
          },
          i: {
            type: 'string',
            alias: 'identifier',
            conflicts: [ 'u', 'r' ],
            describe: 'The unique identifier of the post'
          },
          r: {
            type: 'string',
            alias: 'replies',
            conflicts: [ 'u', 'i' ],
            describe: 'The unique identifier of the comment'
          }
        }
      )
      .command(
        'tag', 'Fetch all posts mentioning a hashtag', {
          t: {
            alias: 'tag',
            type: 'string',
            demandOption: true,
            describe: 'The hashtag, without the hash sign'
          }
        }
      )
      .command(
        'votes', 'Fetch all votes made by a user', {
          u: {
            type: 'string',
            alias: 'username',
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'write', 'Post a new message to your account', {
          t: {
            type: 'string',
            alias: 'text',
            demandOption: true,
            describe: 'The textual content to post'
          }
        }
      )
      .command(
        'delete', 'Delete an existing message from your account', {
          i: {
            type: 'string',
            alias: 'identifier',
            demandOption: true,
            describe: 'The unique identifier of the post'
          }
        }
      )
      .command(
        'follow', 'Follow a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'unfollow', 'Unfollow an already-followed user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'mute', 'Mute a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'news', 'Fetch your own affiliate news feed'
      )
      .command(
        'moderation', 'Fetch your list of comments for moderation'
      );

    return this;
  }
};

/* Export symbols */
module.exports = Arguments;

