
Parlaid
=======

Parlaid is a client library for Parler – a "free speech" social network that
accepts real money to buy "influence" points to boost organic non-advertising
content. The authors will refrain from commenting on this business model.

Usage
-----

First, run `npm install` to fetch all required dependencies.

Then, log in to Parler using an ordinary web browser. Use that browser's
development tools and/or cookie storage interface to capture the `MST` (Master
Session Token) and `JST` (a shorter-lived session token). Replace the empty
strings in `config/auth.json` with these values. If your browser supplies you
with URI-encoded versions of these values, you must decode them prior to use –
the utility expects them in their raw, unencoded form. Future automation of this
process is unlikely to be feasible.

If you don't know what this means or how to accomplish it, please do not use
this software at this time. This early version is currently intended for
research purposes and law enforcement.

Once you've completed the above, use Node v14 or higher to run `bin/parlaid`.

```
parlaid <command>

Commands:
  parlaid feed        Fetch your own feed of posts
  parlaid feedechoes  Fetch your own feed of echoed posts
  parlaid profile     Fetch a user profile
  parlaid posts       Fetch all posts for a user
  parlaid echoes      Fetch all echoes for a user
  parlaid following   Fetch all users followed by a user
  parlaid followers   Fetch all followers of a user
  parlaid comments    Fetch all comments for a user or post
  parlaid votes       Fetch all votes made by a user

Options:
  --help               Show help                                       [boolean]
  --version            Show version number                             [boolean]
  -a, --authorization  Authorization file [string] [default: "config/auth.json"]
  -v, --verbose        Print debug information to stderr               [boolean]
  -q, --quiet          Print less information to stderr                [boolean]
  -s, --silent         Print absolutely no information to stderr       [boolean]
```

Legal
-----

This repository seeks to document the design of Parler as accurately and
concisely as possible. Parler is of interest to researchers, political
campaigns, civic engagement groups, law enforcement, anti-discrimination groups,
and the public at large. The free speech conveyed in this repository is of
timely and widespread public interest.

If you choose to use this speech as part of an activity, please ensure your
activity is ethical and legal within your jurisdiction. The author of this work
of speech cannot, will not, and has no responsibility to control the behavior of
others – in any jurisdiction, on any of Jupiter's mighty moons, or anywhere
within the known universe – past, present, or future.

Due to the specific nature and quality of Parler's engineering design, the
speech contained within this repository is the sole product of unrelated
industry experience and third-party documentation. No act of disassembly,
decompilation, reverse engineering, trade secret violation – nor any other
prohibited act – was necessary to create the work contained herein.

> "Communication does not lose constitutional protection as 'speech' simply because it is expressed in the language of computer code. Mathematical formulae and musical scores are written in 'code,' i.e. symbolic notations not comprehensible to the uninitiated, and yet both are covered by the First Amendment. If someone chose to write a novel entirely in computer object code by using strings of 1’s and 0’s for each letter of each word, the resulting work would be no different for constitutional purposes than if it had been written in English." – DMCA, Universal City Studios v. Corley, FN191: 273 F.3d 429, 60 USPQ2d 1953 (2nd Cir. 2001)

> Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.

License
-------

MIT

