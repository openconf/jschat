module.exports = function(text){
  var result = vimeo_parser(text);
  if(result) text += embed(result);
  return text;
}


function embed(id){
  return '<iframe src="//player.vimeo.com/video/'+id+'" width="640" height="390"  frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
}
function vimeo_parser(url){
  var regExp = /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;

  var match = url.match(regExp);

  if (match&&match[2]){
    return match[2];
  }else{
    return false;
  }
}
