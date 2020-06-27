
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

Legal
-----

> "Communication does not lose constitutional protection as 'speech' simply because it is expressed in the language of computer code. Mathematical formulae and musical scores are written in 'code,' i.e. symbolic notations not comprehensible to the uninitiated, and yet both are covered by the First Amendment. If someone chose to write a novel entirely in computer object code by using strings of 1’s and 0’s for each letter of each word, the resulting work would be no different for constitutional purposes than if it had been written in English." – DMCA, Universal City Studios v. Corley, FN191: 273 F.3d 429, 60 USPQ2d 1953 (2nd Cir. 2001)

> Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.

License
-------

MIT

