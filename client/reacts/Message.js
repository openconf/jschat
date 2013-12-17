/** @jsx React.DOM */
module.exports = function(item, i, items){
  var user = function(message, previous){
    // if message is from same user as previous message
    if(previous && previous.__user && message.__user && previous.__user 
       && message.__user === previous.__user) {
        return;
       }
    if(!message.__user) return;
    var data = message.__user;
    var avatar = data.get('gh_avatar');
    return <div className="msg user">
      <div className="avatar">
        <img src={avatar}/>
      </div>
      <div className="nick text">
        {message.__user.name}:
      </div>
    </div>
  }
  if(item.get('action') == "JOIN" || item.get('action') == "LEAVE"){
    return <div>
       <div className="nick text">
        {item.__user.name + ' '} <span dangerouslySetInnerHTML={{__html:item.get('text')}}></span>
       </div>
    </div>;
  }
  if(!item.get('id')) return;
  var date = {
    hh:item.date.getHours(),
    mm:item.date.getMinutes()
  }
  if(date.hh < 10) date.hh = '0' + date.hh;
  if(date.mm < 10) date.mm = '0' + date.mm;
  return <div>
    {user(item, items[i-1])}
    <div className='msg'>
      <div className="time">
        {item.date && ([date.hh, date.mm].join(":"))}
      </div>
      <div className="text" dangerouslySetInnerHTML={{__html:item.text}}>
      </div>
    </div>
  </div>
}
