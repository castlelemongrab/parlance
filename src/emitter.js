// ✊🏿

'use strict';

const BaseEmitter = require('./emitter/base');
const JSONEmitter = require('./emitter/json');

/* Export symbols */
module.exports = {
  Default: JSONEmitter,
  Base: BaseEmitter, JSON: JSONEmitter
};

