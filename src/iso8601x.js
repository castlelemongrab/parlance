// ✊🏿

/**
  A static class for parsing and comparing numeric timestamps
  that have higher-resolution sequence numbers attached to them.
  These types of timestamps are used by some databases – such as
  CouchDB - to provide keys for time-series data and/or provide
  higher resolution than ISO 8601 is able to provide natively.
  We represent these as a two-tuple of numbers, each of which must
  be (and for the time being is) below `Number.MAX_SAFE_INTEGER`.
**/
const ISO8601X = {

  /**
    Parse an ISO 8601 *or* numeric/string timestamp containing milliseconds
    since the epoch. Return the number of milliseconds since the epoch. If
    a numeric argument is provided, we tolerate it and return it as-is.
    @arg _ts {string|number} - The string to parse.
    @returns {number}
  */
  parse: (_ts) => {

    if (typeof(_ts) === 'number') {
      return _ts;
    }

    let n = Date.parse(_ts);

    if (isNaN(n)) {
      throw new Error('Invalid ISO 8601 timestamp');
    }

    return n.valueOf();
  },

  /**
    Convert a single parsed numeric timestamp to its ISO 8601 representation.
    You can technically pass an extended timestamp array to this function and
    it'll work due to type corecion insanity, but please, please don't do it.
    @arg _number {number|string} - The timestamp's numeric representation.
    @returns {string}
  */
  unparse: (_number) => {

    let rv;

    try {
      let d = new Date(parseInt(_number, 10)); /* Array ultrahack */
      rv = d.toISOString();
    } catch (_e) {
      throw new Error('Invalid numeric date representation');
    }

    return rv;
  },

  /**
    Parse a high-resolution ISO 8601 and/or numeric timestamp string, and
    return a two-tuple of numbers - an "extended" parsed timestamp suitable
    for use with the unparse_extended and compare_extended methods.
    @arg _string {string} - The string to parse.
    @returns {Array}
  */
  parse_extended: (_string) => {

    let rv = [];
    let pair = _string.split(/_/);

    if (pair.length < 1 || pair.length > 2) {
      throw new Error('Invalid extended timestamp');
    }

    let ts = (
      pair[0].match(/^\d+$/) ?
        parseInt(pair[0], 10) : ISO8601X.parse(pair[0])
    );

    if (isNaN(ts)) {
      throw new Error('Invalid timestamp millisecond count');
    }

    let seq = (
      pair[1] ? parseInt(pair[1], 10) : 0
    );

    if (isNaN(seq)) {
      throw new Error('Invalid timestamp extended sequence number');
    }

    /* May throw */
    rv.push(ISO8601X.parse(ts)); /* Parse is currently unecessary */
    rv.push(seq);

    return rv;
  },

  /**
    Convert a two-tuple extended parsed timestamp to an ISO 8601 string.
    This *will* lose precision (namely, any extended sequence number),
    unless you set the `_keep_precision` argument to `true`. In the latter
    case, this will return a non-standard variant of an ISO 8601 timestamp,
    treating the extended sequence number as a number of nanoseconds, which
    is probably incorrect by a factor of ten in most cases, but... whatever.
    @arg _pair {Array} - A parsed two-tuple extended timestamp.
    @returns {string}
  */
  unparse_extended: (_pair, _keep_precision) => {

    let rv = ISO8601X.unparse(_pair[0]);

    if (_keep_precision) {

      let ns = parseInt(_pair[1], 10);

      if (isNaN(ns)) {
        throw new Error('Invalid extended sequence number format');
      }

      rv = rv.replace(/Z$/, `Z@${ns}`);
    }

    return rv;
  },

  /**
    Compare two numeric timestamps. Return -1 if `_p1` is strictly
    greater than `_p2`. Return 1 if `_p2` is strictly greater than `_p1`.
    Otherwise, the two quantities are equal, and we return zero. As with
    `unparse`, type coercion insanity makes this partially work (on the
    the millisecond portion) of extended timestamps too, but... just don't.
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
    Compare two extended numeric timestamps. Return -1 if `_p1` is strictly
    greater than `_p2`. Return 1 if `_p2` is strictly greater than `_p1`.
    Otherwise, the two quantities are equal, and we return zero.
    @arg _p1 {Array} - A two-tuple of numbers produced by `parse_extended`.
    @arg _p2 {Array} - A two-tuple of numbers produced by `parse_extended`.
    @returns {number}
  */
  compare_extended: (_p1, _p2) => {

    /* Inlined from `compare` */
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

