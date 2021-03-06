
0.7.12 / 2013-11-11
===================

 * engine.io: updated build to fix WebSocket constructor issue
 * package: move browserify into devDeps

0.7.11 / 2013-11-06
===================

 * AMD support
 * Makefile: build now smaller thanks to browserify
 * add browserify support

0.7.10 / 2013-10-28
===================

 * fixed issue which prevented IE9 and under to pass Cookies to server during handshake
 * package: update "ws" to v0.4.31
 * fixed - there is no host property only hostname
 * fixed - flash socket creation
 * fixed - emit errors thrown by xhr.send()

0.7.9 / 2013-08-30
==================

 * websocket: pass `undefined` as the WebSocket "protocols"

0.7.8 / 2013-08-30
==================

 * package: update "ws"

0.7.7 / 2013-08-30
==================

 * package: bump ws to 0.4.30
 * websocket: no more env sniffing, just require `ws` [TooTallNate]
 * websocket: remove the "bufferedAmount" checking logic [TooTallNate]

0.7.6 / 2013-08-30
==================

 * package: revert ws to avoid upgrade fail now

0.7.5 / 2013-08-30
==================

 * package: bump ws to 0.4.30

0.7.4 / 2013-08-25
==================

 * package: rolling back to `ws` `0.4.25` due to disconnection bug

0.7.3 / 2013-08-23
==================

 * noop bump

0.7.2 / 2013-08-23
==================

 * transports: fix WebSocket transport in the web browser (again)

0.7.1 / 2013-08-23
==================

 * transports: fix WebSocket transport in the web browser
 * package: upgrade "ws" to v0.4.29

0.7.0 / 2013-08-23
==================

 * socket: add `agent` option
 * package: point "xmlhttprequest" to our LearnBoost fork for agent support
 * package: specify a newer version of "ws" that includes `agent` support
 * util: use "component/has-cors"
 * transport: fix whitespace
 * util: use "component/global"
 * package: Add repository field to readme
 * socket: Don't lose packets writen during upgrade after a re-open
 * socket: use a consistent "debug" name for socket.js
 * package: Update emitter dep to 1.0.1 for old IE support

0.6.3 / 2013-06-21
==================

  * fix check readyState in polling transport (Naoyuki Kanezawa)
  * use http url in npm dependencies for emitter (Eric Schoffstall)

0.6.2 / 2013-06-15
==================

  * transports: improve polling orderly close (fixes #164)
  * socket: ignore further transport communication upon `onClose`
  * socket: added missing `socket#onerror` support
  * socket: don't call `socket#onclose` if previous state was not `open`
  * transports: fix iOS5 crash issue
  * Makefile: extra precaution when building to avoid 0.6.0 build problem

0.6.1 / 2013-06-06
==================

  * engine.io: fixed build

0.6.0 / 2013-05-31
==================

  * does not emit close on incorrect socket connection
  * use indexof component for ie8 and below
  * improved x-domain handling
  * introduce public `ping` api
  * added drain event
  * fix `flush` and `flushComplete` events
  * fixed `drain` bug splicing with upgrading
  * add support for callbacks with socket.send()

0.5.0 / 2013-03-16
==================

  * socket: implement qs support for `string`
  * added query.EIO to take protocol version from parser
  * use istanbul for code coverage
  * integrated engine.io-protocol 0.3.0
  * updated ws
  * fixed JSONPPolling iframe removal error
  * changed error message to match xhr error message on jsonp transport script tag
  * Added onerror handler for script tag in jsonp transport
  * remove uid qs
  * Added missing colon in payload. Thanks @lsm

0.4.3 / 2013-02-08
==================

  * package: removed unusued `parser.js`

0.4.2 / 2013-02-08
==================

  * polling-jsonp: fix ie6 JSONP on SSL
  * close also if socket.readyState is on "opening"
  * parser.js: removed the file package.json: added the engine.io-parser dependency everything else: switched to engine.io-parser
  * fix "TypeError: Object #<Object> has no method 'global'"
  * client now ignores unsupported upgrades

0.4.1 / 2013-01-18
==================

  * do not shadow global XMLHttpRequest
  * socket: added `data` event (as synonym to `message`)
  * socket: remove `resource` and fix `path`
  * socket: fixed access to `opts`
  * test: fixed transports tests
  * socket: constructor can accept uri/opts simultaneously
  * SPEC: simplified: removed resource from SPEC
  * socket: proper `host`/`hostname` support
  * socket: ensure `onclose` idempotency
  * socket: added `onerror` instrumentation
  * socket: fix style
  * use window to detect platform and fix global reference
  * *: fix references to `global` (fixes #79)

0.4.0 / 2012-12-09
==================

  * *: now based on `component(1)`
  * *: module now exports `Socket`
  * socket: export constructors, utils and `protocol`
  * *: implemented `emitter` component
  * *: removed browserbuild and preprocessor instructions

0.3.10 / 2012-12-03
===================

  * socket: fix closing the socket in an `open` listener [mmastrac]
  * socket: perform ping interval/timer cleanup [mmastrac]
  * fix SPEC (packages -> packets) [jxck]
  * socket: handle probe's transport errors [indutny]

0.3.9 / 2012-10-23
==================

  * socket: fix `hostname` instead of `host`
  * socket: avoid duplicate `port` defaults

0.3.8 / 2012-10-23
==================

  * socket: introduce introspection hooks
  * socket: introduced `host` and `port` `location` defaults
  * flashsocket: obfuscate activex (fixes #31)
  * README: documented reconnect (closes #45)
  * socket: unset `id` upon close
  * socket: clear transport listeners upon force close

0.3.7 / 2012-10-21
==================

  * fix `version` [quackingduck]
  * ping timeout gets reset upon any packet received [indutny]
  * timeout fixes [cadorn, indutny]
  * transport: fix xdomain detection in absence of location.port (GH-38)
  * socket: fix passing `false` as secure getting overridden
  * socket: default `secure` to `true` for SSL-served pages
  * socket: fix default port for SSL when `secure` is not supplied

0.3.6 / 2012-10-16
==================

  * socket: reset timeout on any incoming data [indutny]

0.3.5 / 2012-10-14
==================

  * new build

0.3.4 / 2012-10-14
==================

  * package: fix `component` exports

0.3.3 / 2012-10-10
==================

  * socket: fix `secure` default value discovery [quackingduck]

0.3.2 / 2012-10-08
==================

  * Bump

0.3.1 / 2012-10-08
==================

  * socket: added `write` alias for `send`
  * package: added `component`

0.3.0 / 2012-09-04
==================

  * IE's XDomainRequest cannot do requests that go from HTTPS to HTTP or HTTP to HTTPS [mixu]
  * Switch to client-initiated ping, and set interval in handshake [cadorn]

0.2.2 / 2012-08-26
==================

  * polling-jsonp: allow unneeded global leak (fixes #41)
  * polling-jsonp: allow for multiple eio's in the same page

0.2.1 / 2012-08-13
==================

  * Bump

0.2.0 / 2012-08-06
==================

  * polling: introduced `poll` and `pollComplete` (formerly `poll`) events

0.1.2 / 2012-08-02
==================

  * Bump

0.1.1 / 2012-08-01
==================

  * Added options for request timestamping
  * Made timestamp query param customizable
  * Added automatic timestamping for Android

0.1.0 / 2012-07-03
==================

  * Initial release.
