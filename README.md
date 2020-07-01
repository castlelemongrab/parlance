
Parlaid
=======

Parlaid is a client library for Parler – a "free speech" social network that
accepts real money to buy "influence" points to boost organic non-advertising
content. The authors will refrain from commenting on this business model.

Installation and Configuration
------------------------------

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

Usage
-----

```
parlaid <command>

Commands:
  parlaid feed        Fetch your own feed of posts
  parlaid feedechoes  Fetch your own feed of echoed posts
  parlaid profile     Fetch a user profile
  parlaid post        Fetch a single post by identifier
  parlaid posts       Fetch all posts for a user
  parlaid echoes      Fetch all echoes for a user
  parlaid following   Fetch all users followed by a user
  parlaid followers   Fetch all followers of a user
  parlaid comments    Fetch all comments for a user or post
  parlaid votes       Fetch all votes made by a user
  parlaid write       Post a new message to your account
  parlaid delete      Delete an existing message from your account

Options:
  --version              Show version number                           [boolean]
  -h, --help             Show help                                     [boolean]
  -c, --credentials      Credentials file [string] [default: "config/auth.json"]
  -o, --credentials-out  Credentials output file                        [string]
  -l, --ignore-last      Rely solely upon time comparisons             [boolean]
  -n, --no-delay         Disable the failsafe rate-limiter             [boolean]
  -p, --page-limit       Set the page size limit                        [number]
  -v, --verbose          Print debug information to stderr             [boolean]
  -q, --quiet            Print less information to stderr              [boolean]
  -s, --silent           Print absolutely no information to stderr     [boolean]
```
```
parlaid posts

Fetch all posts for a user

Options:
  -u, --username       The name of the user                             [string]
```
```
parlaid comments

Fetch all comments for a user or post

Options:
  -u, --username       The name of the user                             [string]
  -i, --identifier     The unique identifier of the post                [string]
```
```
parlaid write

Post a new message to your account

Options:
  -c, --content        The content of the message            [string] [required]
```

If the `username` parameter is omitted for any subcommand where it is relevant,
Parlaid will default to using your own account's username.

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

Credits
-------
```
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

Parlaid
Copyright 2020 Parlaid Team
Copyright 2020 Baby Britain, Ltd.

GPG contact: EEE05391661B310E10F5044C509D06B28C724903
-----BEGIN PGP SIGNATURE-----

iQIzBAEBCgAdFiEE7uBTkWYbMQ4Q9QRMUJ0GsoxySQMFAl76V0IACgkQUJ0Gsoxy
SQMPuQ/9HTGaJnxUUAVaFKNu55JX6bCdr8/2ugkYwHRWG+zWY96q1LEF4r1rRlIz
OB9FcMZIFe0xi17PL3emwvfVxILI82ku1q6Zo8Qma6VrS7LoRrqvVY6YFwK0JNOS
f2a72BuNIDN4S0G/kZG2mEprBxfb/tWIa4pG084nSg35ACwe740D53EoPwzgfBBb
9b/Caav83WE/P4RGf2lYbhYUvPHt7w7xLQyFOX9efJjw9SyDsFdzlnpGcEA6HOJ9
aIKRqejS2iXhTiKmpmWIR1Z8rBrfNv8f7zcT/oVQtOKWWsrUcURTvgB+rCnvAXyx
ZGMav+QerDlHWTRnntpbfTdJcPeU6OsVu3IZ7qNo1aCipRg9ZF6fKt08c8kUMTlA
PvQR9uMlx4mQgjTGANR8Xa4lnxHJ+3GHSVKpMCYFVLOD+7Tca9Vkc8Jzng20VfoH
qhjnE5pwOvAbc7HeuBEVU2bnJyQvaR+033zyKD6J7A0x3y/xqfhaP/v1p+9462lL
HEvoKYSQS8xUs+ZcfxW4JEQJf5SX7Is4y6szG3hjibSwtbxJx2dh3iRXz8qL263b
8cCt3FnqP+Z/sqQxYAHX1IBxBsa4xFy+xpxX4Q3VjEQ/9knNqKmDaJAN/IBdOeON
UOctS9ierhkWxuAx9h2kNueqOVJmqVWj+WW5hYPUfoUPLuO2XeQ=
=Ow2p
-----END PGP SIGNATURE-----
```

License
-------

MIT

