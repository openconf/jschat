/** @jsx React.DOM */
module.exports = function(item, i, items){
  var user = function(message, previous){
    function shouldNotDisplayAuthor(previousMsg, currentMsg) {
      return previousMsg && currentMsg && previousMsg.__user && currentMsg.__user &&
        currentMsg.__user === previousMsg.__user && previousMsg.get('action') != "JOIN"
    }
    
    if(shouldNotDisplayAuthor(previous, message)) {
        return;
    }
    var userData = message.__user;
    var avatar = userData.get('gh_avatar');
    var cn = "nick text " + (parseInt(userData.get('online'))?"online":"");
    return <div className="msg user">
      <div className="avatar">
        <img src={avatar} />
      </div>
      <div className={cn}>
        <span className="status"></span>
        <a href={"#user/"+userData.get('id')}>{userData.name}</a>:
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
