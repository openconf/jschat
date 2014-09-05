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
  - `npm run compile`
  - `npm run watch` 
  - Go to [http://localhost:8080](http://localhost:8080)

To build desktop app:

  - `npm run build-app`

To package desktop app:

  - `npm run package`

To publish desktop app:

  - *update version* for client, build and package an app
  - commit and push new desktop packages to git@github.com:openconf/jschatapp.git
  - update version in package.json
  - commit and push into repo

If you have any troubles, try to do the same with administrator permissions.

## Scripts
  - `npm start` - just starts server
  - `npm test` - runs server tests
  - `npm run compile` - compiles client folder
  - `npm run watch` - watches client folder changes and refresh browser (server is also running)

## Contributors
Ordered by date of first contribution.
[Auto-generated](http://github.com/dtrejo/node-authors) on Thu Oct 10 2013 05:59:08 GMT-0300 (BRT).

- [Eldar Djafarov aka `edjafarov`](https://github.com/edjafarov)
- [Dmitriy Kulichkin aka `dkulichkin`](https://github.com/dkulichkin)
- [Dmytro Nemoga aka `DreamTheater`](https://github.com/DreamTheater)
