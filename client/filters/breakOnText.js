// returns arrays of strings, break on pairs of %tag%s
module.exports = function (tag) {
  var openning = "<" + tag + ">"
  var closing = "</" + tag + ">"
  return function (text) {
    if (!text || !text.match(openning)) { return [text]; }
    var strings = []
    var keyPoints = getOccurences(RegExp(openning), text).concat(getOccurences(RegExp(closing), text, true)).sort(function (self, other) {return self - other});
    if (keyPoints[0] !== 0) {strings.push(text.slice(0, keyPoints[0]))}
    for (var i = 0; i < keyPoints.length - 1; i += 1) {
      strings.push(text.slice(keyPoints[i], keyPoints[i+1]))
    }
    if (keyPoints[i] !== text.length) { strings.push(text.slice(keyPoints[keyPoints.length - 1])) }
    return strings;
  }
}

/**
 * Function to get indexes of certain regexp occurences
 * @param  {RegExp}     regexp    RegExp to match against
 * @param  {String}     text      String to be searched
 * @param  {Booleanish} lastIndex Whether first or last index should be returned
 * @return {Array}                Array of indexes
 */
function getOccurences(regexp, text, lastIndex) {
  var localRegExp = new RegExp(regexp.source, 'g')
  var res = [], match;
  while ((match = localRegExp.exec(text)) !== null) {
    res.push(lastIndex ? localRegExp.lastIndex : localRegExp.lastIndex - match[0].length)
  }
  return res;
}
