module.exports = function(text){
  return  urlify(text);
}

function urlify(text) {
  var urlRegex = /([^'">]|^)(https?:\/\/[^\s<]+)/g;
  var result = text.replace(urlRegex, function(url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
  return result;
}
