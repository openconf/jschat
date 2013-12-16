module.exports = function(text){
  var result = youtube_parser(text);
  if(result) text += embed(result);
  return text;
}


function embed(id){
  return '<iframe id="ytplayer" type="text/html" width="640" height="390" src="http://www.youtube.com/embed/' + id + '?autoplay=0" frameborder="0"></iframe>'
}
function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  if (match&&match[7].length==11){
    return match[7];
  }else{
    return false;
  }
}
