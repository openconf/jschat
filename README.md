[travis-badge]: https://travis-ci.org/openconf/jschat.png
[travis-link]: https://travis-ci.org/openconf/jschat

[gemnasium-badge]: https://gemnasium.com/openconf/jschat.png
[gemnasium-link]: https://gemnasium.com/openconf/jschat

# JSChat

[![Build Status][travis-badge]][travis-link]
[![Dependency Status][gemnasium-badge]][gemnasium-link]

The JavaScript community chat.

## Installation
Prerequisites:
  - `redis-server` ([Installation instructions](http://redis.io/topics/quickstart))
  - `node` ~ `0.10.17`
  - `npm` ~ `1.3.8`

Five steps to start developing:
  - `npm install`
  - `npm run setup`
  - `npm run compile` or `npm run compilemob`
  - `npm run watch` or `npm run watchmob`
  - Go to [http://localhost:8080](http://localhost:8080)

If you have any troubles, try to do the same with administrator permissions.

## Dependencies management
For server-side dependencies, [npm](https://github.com/isaacs/npm) is used.
For client-side dependencies, [compy](https://github.com/edjafarov/compy) is used. In case you need to update all dependencies, be sure to
1. `cd client/`
2. `compy install -f` to update every package or just do install of single component with -f flag.
i.e: `compy install -f paulmillr/exoskeleton@master` (be sure to check, whether package.json changed to accidentally not modify it)

## Scripts
  - `npm start` - just starts server
  - `npm test` - runs server tests
  - `npm run compile` - compiles client folder
  - `npm run compilemob` - same for mobile
  - `npm run watch` - watches client folder changes and refresh browser (server is also running)
  - `npm run watchmod` - same for mobile

## Contributors
Ordered by date of first contribution.
[Auto-generated](http://github.com/dtrejo/node-authors) on Thu Oct 10 2013 05:59:08 GMT-0300 (BRT).

- [Eldar Djafarov aka `edjafarov`](https://github.com/edjafarov)
- [Dmitriy Kulichkin aka `dkulichkin`](https://github.com/dkulichkin)
- [Dmytro Nemoga aka `DreamTheater`](https://github.com/DreamTheater)
