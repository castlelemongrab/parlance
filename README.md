
Parlance
========

Parlance is a client library for Parler – a "free speech" social network that
accepts real money to buy "influence" points to boost organic non-advertising
content. The authors will refrain from commenting on this business model.

Installation and Configuration
------------------------------

You'll need at least Node.js v8.17.0 (Carbon LTS) to run Parlance – although
we recommend using the latest available stable version (currently v15.3.0).

First, run `npm install -g @castlelemongrab/parlance` to fetch the software
and all required dependencies. After installation completes, run `parlance`
to see usage information.

Then, log in to Parler using an ordinary web browser. Use your browser's
development tools and/or cookie storage interface to find Parler's `MST`
(Master Session Token) and `JST` (a short-lived session token). Use the
`init` subcommand to create an authorization file using the MST and JST values
from your browser. If your browser supplies you with URI-encoded versions of
these values, you should decode them prior to use to avoid duplicate HTTPS
requests and/or warning messages from the tool.  Any automation of the above
login process is unlikely to be accepted.

Results for all subcommands are printed to standard output as a JSON-encoded
array of objects.

Usage
-----

```
parlance <command>

Commands:
  parlance init        Create an authorization file
  parlance feed        Fetch your own feed of posts
  parlance profile     Fetch a user profile
  parlance post        Fetch a single post by identifier
  parlance posts       Fetch all posts for a user
  parlance following   Fetch all users followed by a user
  parlance followers   Fetch all followers of a user
  parlance comments    Fetch all comments for a user, post, or comment
  parlance tags        Fetch all posts mentioning a hashtag
  parlance votes       Fetch all votes made by a user
  parlance write       Post a new message to your account
  parlance delete      Delete an existing message from your account
  parlance follow      Follow a user
  parlance unfollow    Unfollow an already-followed user
  parlance mute        Mute a user
  parlance news        Fetch your own affiliate news feed
  parlance moderation  Fetch your list of comments for moderation

Options:
  --help                 Show help                                     [boolean]
  --version              Show version number                           [boolean]
  --show-hidden          Show hidden options                           [boolean]
  --format-options       Provide format/type-specific options           [string]
  -c, --credentials      MST/JST tokens   [string] [default: "config/auth.json"]
  -o, --credentials-out  Output file for client credentials             [string]
  -S, --start-key        Specify a time-series start/resume key         [string]
  -E, --end-key          Specify a time-series end/halt key             [string]
  -l, --ignore-last      Rely solely upon time comparisons             [boolean]
  -n, --no-delay         Disable the failsafe rate-limiter             [boolean]
  -p, --page-size        Request a specific page size                   [number]
  -d, --debug            Print all debug information to stderr         [boolean]
  -v, --verbose          Print verbose information to stderr           [boolean]
  -q, --quiet            Print less information to stderr              [boolean]
  -s, --silent           Print absolutely no information to stderr     [boolean]
  -e, --expand           Expand specific UUID types     [array] [default: "all"]
  -f, --format           Select output format/type    [string] [default: "json"]
```
```
parlance init

Create an authorization file

Options:
  -o, --credentials-out  Output file for client credentials             [string]
  --mst                  The MST master session token        [string] [required]
  --jst                  The shorter-lived JST session token [string] [required]
```
```
parlance posts

Fetch all posts for a user

Options:
  -u, --username         The name of the user                           [string]
```
```
parlance comments

Fetch all comments for a user, post, or comment

Options:
  -u, --username         The name of the user                           [string]
  -i, --identifier       The unique identifier of the post              [string]
  -r, --replies          The unique identifier of the comment           [string]
```
```
parlance tag

Fetch all posts mentioning a hashtag

Options:
  -t, --tag              The hashtag, without the hash sign  [string] [required]
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

Output Formats
--------------

Currently, Parlance supports both a JSON array-of-objects output target, as
well as a JSONL target (one JSON object per line). These targets will be
expanded in the future. To use JSONL now, specify the `-f jsonl` option when you
run Parlance. By default, a JSON array suitable for use with tools like `jq`
will be emitted.

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

