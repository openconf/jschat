var breakOnPreText = require('./breakOnText')('pre');
var breakOnCodeText = require('./breakOnText')('code');
function isPreString(str) {
  return str.substr(0,5) === '<pre>' || str.substr(-6) === "</pre>"
}
function isCodeString(str) {
  return str.substr(0,6) === '<code>' || str.substr(-7) === "</code>"
}
function breakIntoString(text, listOfFuns) {
  var result = text
  listOfFuns.forEach(function (splitFn) {
    if (result instanceof Array ) {
      result.forEach(function(str, index){
        [].splice.apply(result, [index, 1].concat(splitFn(str)) )
      })
    } else {result = splitFn(result)}
  })
  return result
}
function makeSkipCodeAndPreformatted(filter) {
  var splitters = [
    breakOnPreText,
    breakOnCodeText
  ]
  return function (string) {
    var filteredStrings = breakIntoString(string, splitters).map(function (str) {
      if (isPreString(str) || isCodeString(str)) {
        return str;
      }
      return(filter(str));
    })
    return filteredStrings.join('')
  }
}
function logify(filter) {
  return function (str) {
    console.log('filtering: ', str)
    return filter(str)
  }
}
module.exports = {
  makeSkipCodeAndPreformatted: makeSkipCodeAndPreformatted,
  breakIntoString: breakIntoString,
  isCodeString: isCodeString,
  isPreString: isPreString,
  logify: logify
}