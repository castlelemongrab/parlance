// ✊🏿

'use strict';

/**
  A simple console output base class.
  @extends Base
**/
const Output = class {

  /**
    Write a string to standard output with no added linefeed.
    Override this implementation; it is almost certainly not what you want.
    @arg _message {string} - The message to emit.
  **/
  stdout (_message) {

    console.log(_message);
    return this;
  }

  /**
    Write a string to standard error with no added linefeed.
    Override this implementation; it is almost certainly not what you want.
    @arg _message {string} - The message to emit.
  **/
  stderr (_message, _is_critical) {

    if (_is_critical) {
      console.error(_message);
    } else {
      console.log(_message);
    }

    return this;
  }

  /**
    Terminate execution.
    @arg _status {number} - The process exit code. Defaults to non-zero.
  **/
  exit (_status) {

    throw new Error(`Process exited with status ${_status || 127}\n`);
  }

  /**
    Raise a fatal error and terminate execution.
    @arg _message {string} - The message to emit.
    @arg _status {number} - The process exit code. Defaults to non-zero.
  **/
  fatal (_message, _status) {

    this.log('fatal', `${_message}`, true);
    throw new Error(`Process exited with status ${_status || 127}\n`);
  }

  /**
    Warn the user of an exigent circumstance
    @arg _message {string} - The message to emit.
  **/
  warn (_message) {

    this.log('warn', `${_message}`, true);
    return this;
  }

  /**
    Log a message to standard error.
    @arg {_type} {string} - The type of message being logged.
    @arg {_message} {string} - The message to log to standard error.
  **/
  log (_type, _message) {

    this.stderr(`[${_type}] ${_message}\n`);
    return this;
  }

  /**
    Log a network request.
  **/
  log_network (_url) {

    return this.log('network', `Fetching ${_url}`);
  }
};

/**
  A Node.js specialization of the `Output` base class.
**/
const OutputNode = class extends Output {

  constructor (_options) {

    super(_options);

    /* To do: this probably isn't ideal */
    this._process = require('process');

    return this;
  }

  /**
    Write a string to standard output.
  **/
  stdout (_message) {

    this._process.stdout.write(_message);
    return this;
  }
  /**
    Write a string to standard error.
  **/
  stderr (_message, _is_critical) {

    this._process.stderr.write(_message);
    return this;
  }

  /**
    Terminate execution.
    @arg _status {number} - The process exit code. Defaults to non-zero.
  **/
  exit (_status) {

    this._process.exit(_status);
  }

  /**
    Raise a fatal error and terminate execution.
  **/
  fatal (_message, _status) {

    try {
      super.fatal(_message, _status);
    } catch (_e) {
      /* Ignore exception */
    }

    this.exit(_status);
  }
};

/**
  All available output classes.
**/
const Out = {
  Default: OutputNode,
  Base: Output, Node: OutputNode
};

/* Export symbols */
module.exports = Out;

