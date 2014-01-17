var emoticons = require('./skypeEmoticons');
var emos = Object.keys(emoticons);
var emoHash = {};
for(var i = 0; i < emos.length; i++){
  var shorts = emoticons[emos[i]];
  for(var j = 0; j < shorts.length; j++){
    shorts[j] = escapeRegExp(shorts[j]);
  }
  emoHash[emos[i]] = new RegExp("(" + emoticons[emos[i]].join("|") + ")", 'g');
}
var exps = Object.keys(emoHash);

module.exports = function(text){
  return bringEmoticons(text);
}

function bringEmoticons(text) {
  var result = text;
  for(var i = 0; i < exps.length; i++){
    if(emoHash[exps[i]].test(text)){
      result = result.replace(emoHash[exps[i]], function (title) {
        return injectEmotic(exps[i], title)
      });
    }
  }
  return result;
}

function injectEmotic(name, title){
  title = title || name;
  return "<img title='"+ title + "'  src='/JSChat/images/emoticons/emoticon-" + name + ".gif'/>";
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
