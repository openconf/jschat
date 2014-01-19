var filterUtils = require('./filterUtils')
var breakOnPreText = require('./breakOnText')('pre');
var breakOnCodeText = require('./breakOnText')('code');
describe('breakIntoString', function () {
  it('should be splitting string by given splitters', function () {
    var splitters = [
      breakOnPreText,
      breakOnCodeText
    ]
    var string = '<p>Code is:</p>\n<pre><code>:3\n</code></pre>'
    expect(filterUtils.breakIntoString(string, splitters)).to.eql([
      '<p>Code is:</p>\n',
      '<pre>',
      '<code>:3\n</code>',
      '</pre>'
    ])
  })
})
describe('makeSkipCodeAndPreformatted', function () {
  it('should not be applying filter to code and pre strings', function () {
    var dummyFilter = filterUtils.makeSkipCodeAndPreformatted(function(str){return 'X'})
    var string = '<p>Code is:</p>\n<pre><code>:3\n</code></pre>'
     expect(dummyFilter(string)).to.eql([
      'X',
      '<pre>',
      '<code>:3\n</code>',
      '</pre>'
    ].join(''))
  })
})