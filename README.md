
Parlaid
=======

Parlaid is a client library for Parler - a "free speech" social network that
accepts real money to buy "influence" points to boost organic non-advertising
content. The authors will refrain from commenting on this business model.

Usage
-----

First, run `npm install` to fetch all required dependencies.

Then, log in to Parler using an ordinary web browser. Use that browser's
development tools and/or cookie storage interface to capture the `MST` (Master
Session Token) and `JST` (a shorter-lived session token). Replace the empty
strings in `config/auth.json` with these values. Future automation of this
process is unlikely to be feasible.

If you don't know what this means or how to accomplish it, please do not use
this software at this time. This early version is currently intended for
research purposes and law enforcement.

Once you've completed the above, use Node v14 or higher to run `src/main.js`.

License
-------

MIT

