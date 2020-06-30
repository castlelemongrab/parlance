// ✊🏿

/**
  A static class for parsing Set-Cookie headers.
**/
const Cookie = {

  /**
    Parse a single Set-Cookie header as defined by IETF RFC 6265
    ("HTTP State Management Mechanism"). Returned results may be URI
    encoded, as RFC 6265 does not specifically require it. This function
    returns an object that acts as an associative array. Any Set-Cookie
    fields that do not contain a right-hand-side value are set to true.
    @arg _header {string} - The Set-Cookie header to parse.
    @returns {Object} - An object-based associative array of cookie fields.
  **/
  parse: (_header) => {

    let rv = {};
    let fields = _header.split(/\s*;\s*/);

    for (let i = 0, len = fields.length; i < len; ++i) {
      let field = fields[i].split(/\s*=\s*/);
      rv[field[0]] = (field[1] || true);
    }

    return rv;
  },

  /**
    Call `parse for each element of the `_headers` array. Return an array
    of objects, each matching the format returned by the `parse` method.
    @arg _headers {Array} - An array of Set-Cookie strings.
    @returns {Array} - An array of results returned by `parse`.
  **/
  parse_array: (_headers) => {

    let rv = [];

    for (let i = 0, len = _headers.length; i < len; ++i) {
      rv.push(Cookie.parse(_headers[i]));
    }

    return rv;
  }
};

/* Export */
module.exports = Cookie;

