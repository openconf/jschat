var emojis = require('./emoji.dictionary');

module.exports = function(text){
  return emojifyText(text);
}

function emojifyText(text) {
  var emojiPresent = /:(.+):/g
  if (!text.match(emojiPresent)) {return text}
  var result = text;
  var matchName;
  result = result.replace(emojiPresent, function (match) {
    matchName = match.slice(1, -1);
    return injectEmoji(matchName, match) || match;
  })
  return result;
}

function injectEmoji(name, title){
  if (!emojis[name]) return null;
  title = title || name;
  return "<img class='emoji' title='"+ title + "'  src='/JSChat/images/emojis/" + name + ".png'/>";
}
