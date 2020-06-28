// ✊🏿

/**
  A static class for parsing and comparing ISO8601 timestamps
  that have higher-resolution sequence numbers attached to them.
  These types of timestamps are used by some databases – such as
  CouchDB - to provide keys for time-series data and/or provide
  higher resolution than ISO 8601 is able to provide natively.
  We represent these as a two-tuple of numbers, each of which must
  be (and for the time being is) below `Number.MAX_SAFE_INTEGER`.
**/
const ISO8601X = {

  /**
    Parse an ISO 8601 timestamp and return its numeric representation.
    @arg _string {string} - The string to parse.
    @returns {Number}
  */
  parse: (_string) => {

    let n = Date.parse(_string);

    if (isNaN(n)) {
      throw new Error('Invalid ISO8601 timestamp');
    }

    return n;
  },

  /**
    Parse an extended ISO 8601 timestamp and return a two-element array.
    @arg _string {string} - The string to parse.
    @returns {Array}
  */
  parse_extended: (_string) => {

    let rv = [];
    let pair = _string.split(/_/);

    if (pair.length !== 2) {
      throw new Error('Invalid ISO8601 extended timestamp');
    }

    let seq = parseInt(pair[1], 10);

    if (isNaN(seq)) {
      throw new Error('Invalid CouchDB ISO8601 extended sequence number');
    }

    /* May throw */
    rv.push(ISO8601X.parse(pair[0]));
    rv.push(seq);

    return rv;
  },

  /**
    Compare two parsed numeric timestamps. Return -1 if `_p1` is strictly
    greater than `_p2`. Return 1 if `_p2` is strictly greater than `_p1`.
    Otherwise, the two quantities are equal, and we return zero.
    @arg _p1 {number} - A numeric result returned from `parse`.
    @arg _p2 {number} - A numeric result returned from `parse`.
    @returns {number}
  */
  compare: (_p1, _p2) => {

    if (_p1 < _p2) {
      return 1;
    } else if (_p1 > _p2) {
      return -1;
    }

    return 0;
  },

  /**
    Compare two extended ISO 8601 timestamps. Return -1 if `_p1` is strictly
    greater than `_p2`. Return 1 if `_p2` is strictly greater than `_p1`.
    Otherwise, the two quantities are equal, and we return zero.
    @arg _p1 {Array} - A two-tuple of numbers produced by `parse_extended`.
    @arg _p2 {Array} - A two-tuple of numbers produced by `parse_extended`.
    @returns {number}
  */
  compare_extended: (_p1, _p2) => {

    for (let i = 0; i <= 1; ++i) {
      if (_p1[i] < _p2[i]) {
        return 1;
      } else if (_p1[i] > _p2[i]) {
        return -1;
      }
    }

    return 0;
  }
};

/* Export */
module.exports = ISO8601X;

