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

    return this._setup();
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
        'a', {
          type: 'string',
          alias: 'authorization',
          default: 'config/auth.json',
          describe: 'Credentials'
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
      .command(
        'feed', 'Fetch your own feed of posts'
      )

      .command(
        'feedechoes', 'Fetch your own feed of echoed posts'
      )
      .command(
        'profile', 'Fetch a user profile', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'posts', 'Fetch all posts for a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'echoes', 'Fetch all echoes for a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'following', 'Fetch all users followed by a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'followers', 'Fetch all followers of a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'comments', 'Fetch all comments for a user or post', {
          u: {
            type: 'string',
            conflicts: 'i',
            alias: 'username',
            describe: 'The name of the user'
          },
          i: {
            type: 'string',
            conflicts: 'u',
            alias: 'identifier',
            describe: 'The unique identifier of the post'
          }
        }
      )
      .command(
        'votes', 'Fetch all votes made by a user', {
          u: {
            type: 'string',
            alias: 'username',
            demandOption: true,
            describe: 'The name of the user'
          }
        }
      )
      .command(
        'post', 'Post a new message to your account', {
          c: {
            type: 'string',
            alias: 'content',
            demandOption: true,
            describe: 'The content of the message'
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
      );

    return this;
  }
};

/* Export symbols */
module.exports = Arguments;

