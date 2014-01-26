var storagesPresent = {}
var Storage = function (roomId, storageMechanism) {
  if (!storageMechanism) {storageMechanism = localStorage}
  var key = 'room:' + roomId
  storagesPresent[key] = storagesPresent[key] || 0;
  var dataFromStorage = JSON.parse(storageMechanism.getItem(key) || '[]')
  function free() {
    var toTruncate,
        keys = Object.keys(storagesPresent).sort(function(a, b){return storagesPresent[a] - storagesPresent[b]})
    if (keys.length <= 1) return false
    toTruncate = (keys[0] == key) ? keys[1] : keys[0]
    persist(trim(JSON.parse(storageMechanism.getItem(toTruncate) || '[]')), toTruncate)
    return true
  }
  function trim(data) {
    return data.slice(data.length / 2)
  }
  function persist(data, roomKey) {
    if (!roomKey) roomKey = key
    try {
      storageMechanism.setItem(roomKey, JSON.stringify(data))
    } catch (e) {
      console.warn('Storage limit reached')
      if (free()) {
        storageMechanism.setItem(roomKey, JSON.stringify(data))
      } else {
        data = trim(data)
        storageMechanism.setItem(roomKey, JSON.stringify(data))
      }
    }
    storagesPresent[roomKey] = data.length
    return data
  }
  function byId(id) {
    return dataFromStorage.filter(function (msg) {return msg.id == id})[0]
  }
  function indexById(id) {
    return dataFromStorage.indexOf(byId(id))
  }
  return {
    get: function(params) {
      var startIndex = indexById(params.attrs.from)
      var qty = Math.abs(params.attrs.count) || 20
      return dataFromStorage.slice(Math.max(startIndex - qty, 0), startIndex);
    },
    unshift: function(data) {
      dataFromStorage.unshift(data)
      return dataFromStorage = persist(dataFromStorage)
    },
    getLast: function (n) {
      return dataFromStorage.slice(-Math.min(n, dataFromStorage.length));
    },
    range: function (startId, endId, inclusive) {
      var startIndex = startId && indexById(startId) || 0
      var endIndex = endId && indexById(endId) + 1 || dataFromStorage.length
      if (!inclusive) {
        startIndex += 1
        endIndex -= 1
      }
      return dataFromStorage.slice(startIndex, endIndex)
    },
    push: function (data) {
      if (!(data instanceof Array)) {data = [data]}
      [].push.apply(dataFromStorage, data)
      return dataFromStorage = persist(dataFromStorage)
    }
  }
}

module.exports = Storage