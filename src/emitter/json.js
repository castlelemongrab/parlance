// ✊🏿

'use strict';

const Emitter = require('./base');

/**
  A simple result emitter that prints JSON arrays to stdout.
  @extends Emitter
**/
const JSONEmitter = class extends Emitter {

  /**
    Begin emittng results.
  **/
  start (_options) {

    super.start(_options);
    this.io.stdout("[\n");

    return this;
  }

  /**
    Stop emittng results.
  **/
  finish (_options) {

    super.finish(_options);
    this.io.stdout("\n]\n");

    return this;
  }

  /**
    Emit the array of result objects in `_result` to stdout.
  **/
  emit (_results, _is_first_page, _is_final_page) {

    super.emit(_results, _is_first_page, _is_final_page);

    for (let i = 0, len = _results.length; i < len; ++i) {

      if (!(_is_first_page && i <= 0)) {
        this.io.stdout(",");
      }

      this.io.stdout(
        JSON.stringify(_results[i]).trim()
      );
    }

    return this;
  }
};


/* Export symbols */
module.exports = JSONEmitter;

