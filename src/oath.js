// ✊🏿

/**
  A static class for dealing with Promises. Much of this availability
  is available in various versions of Node.js, but the logic is simple.
  Just implement it instead of increasing our dependency count.
**/
const Oath = {

  /**
    A method for converting `(_err, _callback)` style
    asynchronous functions to functions that return promises
    and can be used with await. "Do not swear, merely say yea or nay".
    @arg _fn {Function} - A function accepting a Node-style callback.
    @returns {Function}
  */
  promisify: (_fn) => {

    return (async (..._args) => {
      return new Promise((_resolve, _reject) => {
        return _fn(..._args, (_err, ..._rv) => {
          return (_err ? _reject(_err) : _resolve(..._rv));
        });
      });
    });
  }
};

/* Export */
module.exports = Oath;

