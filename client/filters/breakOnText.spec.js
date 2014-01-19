var breakOnText = require('./breakOnText');

describe('skipPre', function(){
  beforeEach(function(){
    skipPre = breakOnText('pre')
  })
  it('should be defined', function () {
    expect(skipPre).to.be.a('function');
  })
  it('should return regular string if no pre present', function () {
    expect(skipPre('No pre here')).to.eql(['No pre here'])
  })
  describe('should return array of string, pre & not separated', function () {
    it('Given string starts with pre', function () {
      expect(skipPre('<pre>Text here</pre>Lol')).to.eql(['<pre>Text here</pre>', 'Lol'])
    })
    it('Given string starts & ends with pre', function () {
      expect(skipPre('<pre>Text here</pre>Lol<pre>Text here</pre>')).to.eql(['<pre>Text here</pre>', 'Lol', '<pre>Text here</pre>'])
    })
    it('Given string has one occurence in the middle', function () {
      expect(skipPre('asdf s<pre>Text here</pre> Lol<pre>Text here</pre>')).to.eql(['asdf s', '<pre>Text here</pre>', ' Lol', '<pre>Text here</pre>'])
    })
    it('Given multiple occurencies in the middle', function () {
      expect(skipPre('asdf s<pre>Text here</pre> Lol<pre>Text here</pre> asdfasdf ')).to.eql(['asdf s', '<pre>Text here</pre>', ' Lol', '<pre>Text here</pre>', ' asdfasdf '])
    })
  })

})

describe('skipCode', function(){
  beforeEach(function(){
    skipCode = breakOnText('code')
  })
  it('should be defined', function () {
    expect(skipCode).to.be.a('function');
  })
  it('should return regular string if no code codesent', function () {
    expect(skipCode('No code here')).to.eql(['No code here'])
  })
  describe('should return array of string, code & not separated', function () {
    it('Given string starts with code', function () {
      expect(skipCode('<code>Text here</code>Lol')).to.eql(['<code>Text here</code>', 'Lol'])
    })
    it('Given string starts & ends with code', function () {
      expect(skipCode('<code>Text here</code>Lol<code>Text here</code>')).to.eql(['<code>Text here</code>', 'Lol', '<code>Text here</code>'])
    })
    it('Given string has one occurence in the middle', function () {
      expect(skipCode('asdf s<code>Text here</code> Lol<code>Text here</code>')).to.eql(['asdf s', '<code>Text here</code>', ' Lol', '<code>Text here</code>'])
    })
    it('Given multiple occurencies in the middle', function () {
      expect(skipCode('asdf s<code>Text here</code> Lol<code>Text here</code> asdfasdf ')).to.eql(['asdf s', '<code>Text here</code>', ' Lol', '<code>Text here</code>', ' asdfasdf '])
    })
  })

})