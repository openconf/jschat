var fixture = require('./storage.fixture.spec')
var Storage = require('./storage')


var roomId = 12
var recordKey = 'room:' + roomId
beforeEach(function(){
  localStorage.setItem(recordKey, JSON.stringify(fixture))
  storage = new Storage(roomId)
})
afterEach(function(){
  localStorage.removeItem(recordKey)
})
describe('Storage', function(){
  it('should be defined', function(){
    expect(Storage).to.be.a('function')
    expect(storage).to.be.an('object')
  })
  it('#getLast(n) should retrive n last messages', function() {
    expect(storage.getLast(10)).to.eql(fixture.slice(-10))
  })
  describe('#get(params)', function() {
    it('will take %attrs.count% messages if possible ', function(){
      var lastId = fixture[fixture.length - 1].id
      var n = -10
      var result = storage.get({attrs: {from: lastId, count: n}})
      expect(result.length).to.equal(Math.abs(n))
    })
    it('will start just before %attrs.from% id ', function(){
      var lastId = fixture[fixture.length - 1].id
      var n = -10
      var result = storage.get({attrs: {from: lastId, count: n}})
      expect(result).to.eql(fixture.slice(n - 1, -1))
    })
    it('will return nothing if storage is drained ', function() {
      var firstId = fixture[0].id
      var n = -10
      var result = storage.get({attrs: {from: firstId, count: n}})
      expect(result).to.eql([])
      expect(result.length).to.equal(0)
    })
    it('will return all left if %attrs.count% is too big ', function(){
      var sevenId = fixture[6].id
      var n = -10
      var result = storage.get({attrs: {from: sevenId, count: n}})
      // getting everything before 7th msg
      expect(result).to.eql(fixture.slice(0, 6))
      expect(result.length).to.equal(6)
    })
    // TODO: #unshift tests
  })
  describe('#push(data)', function () {
    it('should make it available for read and persist single record ', function(){
      var dummy = {"text":"Message#37","uid":"4","tms":1389547975483,"id":240,"rid":"2"}
      storage.push(dummy)
      expect(storage.getLast(1)).to.eql([dummy])
      expect((new Storage(roomId)).getLast(1)).to.eql([dummy])
    })
    it('should make it available for read and persist multiple records ', function(){
      var dummy = [
        {"text":"Message#38","uid":"4","tms":1389547975483,"id":240,"rid":"2"},
        {"text":"Message#38","uid":"4","tms":1389547975483,"id":240,"rid":"2"}
      ]
      storage.push(dummy)
      expect(storage.getLast(2)).to.eql(dummy)
      expect((new Storage(roomId)).getLast(2)).to.eql(dummy)
    })
  })
  describe('#range(id1, id2)', function () {
    it('should return array of messages between 2 ids non-inclusive', function () {
      var subarray = fixture.slice(5, 10)
      expect(storage.range(subarray[0].id, subarray[subarray.length - 1].id)).to.eql(subarray.slice(1,4))
    })
    it('should return array of messages between 2 ids inclusive', function () {
      var subarray = fixture.slice(5, 10)
      expect(storage.range(subarray[0].id, subarray[subarray.length - 1].id, true)).to.eql(subarray)
    })
    it('should return all up to last message for (id1, null) non-inclusive', function () {
      var subarray = fixture.slice(5, -1)
      expect(storage.range(subarray[0].id, null)).to.eql(subarray.slice(1))
    })
    it('should return all up to first message for (null, id2) non-inclusive', function () {
      var subarray = fixture.slice(0, 10)
      expect(storage.range(null, subarray[subarray.length - 1].id)).to.eql(subarray.slice(1, -1))
    })
    it('should return all up to last message for (id1, null, true) inclusive', function () {
      var subarray = fixture.slice(5)
      expect(storage.range(subarray[0].id, null, true)).to.eql(subarray)
    })
    it('should return all up to first message for (null, id2, true) inclusive', function () {
      var subarray = fixture.slice(0, 10)
      expect(storage.range(null, subarray[subarray.length - 1].id, true)).to.eql(subarray)
    })
    it('should return all messages between second and second to last (null, null) inclusively', function () {
      var subarray = fixture.slice(1, -1)
      expect(storage.range(null, null)).to.eql(subarray)
    })
    it('should return all messages for (null, null, true)', function () {
      expect(storage.range(null, null, true)).to.eql(fixture)
    })
  })
  describe('given one more record to overflow situations (@slow)', function () {
    // this is awkward setup because we need it to be one more to overflow localstorage
    beforeEach(function(done) {
      for (x = 0; x < 10e8; x++) {
        try {
          var already = JSON.parse(localStorage.getItem(recordKey)) || fixture.map(function (el) {return el.id = 888})
          localStorage.setItem(recordKey, JSON.stringify(already.concat(fixture)))

        } catch (e) {
            for (x = 0; x < fixture.length * 2; x++) {
              var already = JSON.parse(localStorage.getItem(recordKey))
              var randomItem = JSON.parse(JSON.stringify(fixture[~~((fixture.length - 1) * Math.random())]))
              randomItem.id = 888
              already = already.concat(randomItem)
              try {
                localStorage.setItem(recordKey, JSON.stringify(already))
              } catch (e) {
                console.log('overflowed localstorage');
                [].splice.apply(already, [- fixture.length - 1 , fixture.length + 1].concat(fixture))
                localStorage.setItem(recordKey, JSON.stringify(already))
                return done()
              }
            }
        }
      }
    })
    it('should persist data in any case', function () {
      var storage2 = new Storage(roomId)
      var randomItem = {"text":"Message#199","uid":"4","tms":1389548133787,"id":999,"rid":"2"}
      var fixtureFragment = fixture.slice(-9)
      fixtureFragment.push(randomItem)
      storage2.push(randomItem)
      expect(storage2.getLast(10)).to.eql(fixtureFragment)
    })
    it('should trim longest data first', function () {
      var storage2 = new Storage(15)
      var randomItem = {"text":"Message#199","uid":"4","tms":1389548133787,"id":999,"rid":"2"}
      storage2.push(randomItem)
      expect(storage.range(null, null, true).length).to.be.below(20000)
      expect(storage2.getLast(10)).to.eql([randomItem])
    })
  })
})