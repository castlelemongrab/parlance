// ✊🏿

'use strict';

const Base = require('./base');

/**
  A mutable in-memory credential/token store.
  @extends Base
**/
const Credentials = class extends Base {

  constructor (_mst, _jst, _options) {

    super(_options);

    this.mst = (_mst || '');
    this.jst = (_jst || '');

    return this;
  }

  get mst () {

    return this._mst;
  }

  get jst () {

    return this._jst;
  }

  set mst (_mst) {

    this._mst = _mst.toString().replace(/^mst=/, '');
    return this;
  }

  set jst (_jst) {

    this._jst = _jst.toString().replace(/^jst=/, '');
  }

  toObject () {

    return {
      mst: this.mst, jst: this.jst
    };
  }
};

/* Export symbols */
module.exports = Credentials;

