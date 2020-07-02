
Parlance
========

Parlance is a client library for Parler – a "free speech" social network that
accepts real money to buy "influence" points to boost organic non-advertising
content. The authors will refrain from commenting on this business model.



Installation and Configuration
------------------------------

First, run `npm install @castlelemongrab/parlance` to fetch the software and
all required dependencies.

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

Once you've completed the above, use Node v14 or higher to run `bin/parlance`.

Usage
-----

```
parlance <command>

Commands:
  parlance feed        Fetch your own feed of posts
  parlance feedechoes  Fetch your own feed of echoed posts
  parlance profile     Fetch a user profile
  parlance post        Fetch a single post by identifier
  parlance posts       Fetch all posts for a user
  parlance echoes      Fetch all echoes for a user
  parlance following   Fetch all users followed by a user
  parlance followers   Fetch all followers of a user
  parlance comments    Fetch all comments for a user or post
  parlance votes       Fetch all votes made by a user
  parlance write       Post a new message to your account
  parlance delete      Delete an existing message from your account

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
parlance posts

Fetch all posts for a user

Options:
  -u, --username         The name of the user                           [string]
```
```
parlance comments

Fetch all comments for a user or post

Options:
  -u, --username         The name of the user                           [string]
  -i, --identifier       The unique identifier of the post              [string]
```
```
parlance write

Post a new message to your account

Options:
  -t, --text             The textual content to post         [string] [required]
```
```
parlance delete

Delete an existing message from your account

Options:
  -i, --identifier       The unique identifier of the post   [string] [required]

```

If the `username` parameter is omitted for any subcommand where it is relevant,
Parlance will default to using your own account's username.

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

Parlance
An MIT-licensed client library and open-source intelligence tool for Parler

Copyright 2020, The Parlance Team
Copyright 2020, Baby Britain, Ltd.

GPG contact: 04BDC713FF16FE315E58CC5028B4EB3E98787367
-----BEGIN PGP SIGNATURE-----

iQIzBAEBCgAdFiEEBL3HE/8W/jFeWMxQKLTrPph4c2cFAl796YgACgkQKLTrPph4
c2eW5A/+Pbw17ilhoNWgAZYzMAvgJngS/VO0QtHlmAdKDRtyt14x3VeHw59XE5PW
iOAzM0yUG28vwflBp9ZCml+6eFw1jsLXuXOS/+X/zfuWZtHCVKal/FTYiKY/foHY
VUsjdwCUlbOZKdrUHAgloRRoc6aQlIIzJzmn+FHT0OOos3n28fNjqToGsVXWeg5y
CqJuSAIP+BLbao38vH5X/xg0rBJMUVYWaoX2TswGK7dJoY94Np6nJbiRIrU3iit4
Xnji7yvt5yaWbaYJNptoycrKcm9rJ9QsP9hcOES32TMYAvke6j8GkrhiyDX5tspe
eLR2kK3AUXHJ8EnpuBCknqyRn6GO/abUnoaL9iTNWfP2nknPgShtxbtChGydQCfs
/HJx1h3FDwONBIDlrZaUWJ6CQlxF7dnFf3R4nsa43UNqry+5Np/GLWTlg7Srbjw8
FMx0PBv4dHYq+2CCJQT9YSseP1J5y57aC0w2t1XUtsdiWUG4K4NsZV03pN4KyK0k
yIK5bAc9GJGK/gXM7kr9x+oZJUfeYawt3pPuloQqcRn8HZxVn+GF90C0q6lfaQ+0
QwRaVkvCOBMZFDtcUhXhO973bIhxlbKr2jfD/2peIpMYSG+dgh2KC/5W8xlPFGgD
sy0M0gwlV6AZLw0SiuAgQ6/vEAXMn2oyjZukP56+5gx75wXz/4U=
=hDiH
-----END PGP SIGNATURE-----
```

License
-------

MIT

