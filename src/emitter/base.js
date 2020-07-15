// ✊🏿

'use strict';

const Base = require('../base');

/**
  An abstract result emitter that produces no output.
  @extends Base
**/
const BaseEmitter = class extends Base {

  constructor (_options) {

    super(_options);

    this._is_started = false;
    return this;
  }

  /**
    Begin emittng results. This can only be called once without
    an intervening call to `finish`.
  **/
  start (_options) {

    if (this._is_started) {
      throw('Result output has already started');
    }

    this._is_started = true;
    return this;
  }

  /**
    Finish emittng results. This can only be called once without
    an intervening call to `start`.
  **/
  finish (_options) {

    if (!this._is_started) {
      throw('Result output has not yet started');
    }

    this._is_started = false;
    return this;
  }

  /**
    Emit the array of result objects in `_result`.
    @arg _results {Array} - An array of plain JSON-compatble objects
    @arg _is_first_page {boolean} - This is the first set of emitted objects
    @arg _is_final_page {boolean} - This is the last set of emitted objects
  **/
  emit (_results, _is_first_page, _is_final_page) {

    if (!this._is_started) {
      throw('Result output has not yet started');
    }

    return this;
  }
};


/* Export symbols */
module.exports = BaseEmitter;

