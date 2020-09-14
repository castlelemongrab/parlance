// ✊🏿

'use strict';

const Emitter = require('./base');

/**
  A simple result emitter that prints JSONL lines to stdout.
  @extends Emitter
**/
const JSONLEmitter = class extends Emitter {

  /**
    Emit the array of result objects in `_result` to stdout.
  **/
  emit (_results, _is_first_page, _is_final_page) {

    super.emit(_results, _is_first_page, _is_final_page);

    for (let i = 0, len = _results.length; i < len; ++i) {
      this.io.stdout(JSON.stringify(_results[i]).trim() + "\n");
    }

    return this;
  }
};


/* Export symbols */
module.exports = JSONLEmitter;

