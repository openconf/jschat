module.exports = function(text){
  return escapeHTML(text);
}

function escapeHTML(string){
  var pre = document.createElement('pre');
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}
