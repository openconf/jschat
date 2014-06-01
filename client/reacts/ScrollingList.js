/** @jsx React.DOM */
var ContactFactory = require('../models/ContactFactory');
module.exports = function(itemClass){
  return React.createClass({
    displayName: 'Scrolling',
    mixins: [require('../models/ModelMixin')],
    _edge: 100,
    scrollToBottom: function(){
      var node = this.getDOMNode();
      node.scrollTop = node.scrollHeight;
    },
    onScroll: function(){
      this.controlEdges(true);
    },
    injectModels: function(){
      if(this.props.renderedItems){
        this.injectModel(this.props.renderedItems);

        //prepare user model ontop of each message
        this.controlEdges();
        // populate User model inside object
        this.props.renderedItems.models.forEach(function(model){
          populateUser(model,this);
        }.bind(this));
        this.props.renderedItems.on('change add remove', function(){
          this.props.renderedItems.models.forEach(function(model){
            if(model.__user && !model.__user.injected) populateUser(model, this);
          }.bind(this));
        }.bind(this));
        this.props.renderedItems.fetch({
          success: function(){
            this.scrollToBottom();
          }.bind(this)
        });
      }
      function populateUser(message, component){
        message.__user.injected = true;
        component.injectModel(message.__user);
      }
    },
    componentWillUpdate: function() {
      var node = this.getDOMNode();
      this._scrollHeight = node.scrollHeight;
      this._scrollTop = node.scrollTop;
      this.shouldStayTop = this._scrollTop <= this._edge;
      this.shouldScrollBottom = (this._scrollTop + node.offsetHeight) >= node.scrollHeight - this._edge;
    },
    //  hold items on adding top and bottom
    componentDidUpdate: function() {
      var node = this.getDOMNode();
      var bottom = this.refs.inner.getDOMNode().offsetHeight - this.getDOMNode().offsetHeight;
      if(this.shouldScrollBottom){
        node.scrollTop = bottom - this._edge;
      }
      if(this.shouldStayTop){
        node.scrollTop = this._scrollTop + (node.scrollHeight - this._scrollHeight);
      }
    },
    controlEdges: function(update){
      var list = this.getDOMNode();
      var scrolledFromTop = list.scrollTop;
      var bottom = this.refs.inner.getDOMNode().offsetHeight - list.offsetHeight;

      processUnreadMessages(list, this);

      if(scrolledFromTop < this._edge) {
        //fix jumping of chat when getting to a full viewport
        if(scrolledFromTop > bottom/2 - this._edge) return;
        this.getDOMNode().scrollTop = this._edge;
        return update && this.props.renderedItems.addToTop();
      }
      if(scrolledFromTop > bottom - this._edge) {
        this.getDOMNode().scrollTop = bottom - this._edge;
      }
    },
    render : function(){
      return <div className="messagesList" onScroll={this.onScroll} >
        <div style={{'padding-top': this._edge,'padding-bottom':this._edge }} ref='inner' >
          {this.props.renderedItems && this.props.renderedItems.models.map(itemClass)}
          <div className="writingBar">{writingStatus(this.props.renderedItems && this.props.renderedItems.writing_users)}</div>
        </div>
    </div>;
    }
  });
}

function processUnreadMessages(list, that){
  var visibleBottom = list.scrollTop + list.offsetHeight;
  var messagesList = list.querySelectorAll('.message');
  for(var i = 0; i < messagesList.length; i++){
        var elem = messagesList[i];
        var elemBottom = elem.offsetTop + elem.offsetHeight;
        if (elemBottom >= list.scrollTop && elemBottom  <= visibleBottom){
           var message = that.props.renderedItems.models.filter(function(model){
             return model.get('id') === +elem.id;
           })[0];

          if (message.get('is_new')){
            var room = that.props.room;
            var new_messages = room.get('new_messages');
            if (new_messages){
              room.set('new_messages', new_messages > 1 ? --new_messages : null);  
            }
            message.set('is_new', false);
          }
        } else if (elemBottom > visibleBottom){
          // don't travers invisible messages
          break;
        }
      }
}

function writingStatus(usersWrite){
  return <span>
    {usersWrite && usersWrite.map(renderUserWrite)}
    {usersWrite && !_(usersWrite).isEmpty() && " typing ..."}
  </span>
}

function renderUserWrite(user, i){
  return <span>{i !== 0 && ','}{user.name}</span>
}
