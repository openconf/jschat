var nl = /\n/g;
module.exports = function(text){
  return text.replace(nl, "<br/>");
}
