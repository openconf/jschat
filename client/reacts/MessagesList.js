/** @jsx React.DOM */
var ContactFactory = require('../models/ContactFactory');

var IScroll = require('IScroll');
var GETTING_TO_CONST = 5;
module.exports = function(itemClass){
  return React.createClass({
    mixins: [require('../models/ModelMixin')],
    getBackboneModels: function(){
      return [this.props.messages]
    },
    lastScrollPosition: null,
    iscroll: null,
    scrollDirectionDown: true,
    scroll: function(e){
      if(this.autoscrolling) return;
      this.scrollDirectionDown = e.y < this.lastScrollPosition

      if(this.props.onTop && e.y == 0 ){
        this.props.onTop(e);
      };
      if(this.props.onBottom && e.y == e.maxScrollY ){
        this.props.onBottom(e);
      };
      if(this.props.onGetToBottom && this.scrollDirectionDown &&
          e.y < e.maxScrollY - e.wrapperHeight * GETTING_TO_CONST){
        this.props.onGetToBottom(e);
      }

      if(this.props.onGetToTop && !this.scrollDirectionDown && 
          e.y > -e.wrapperHeight * GETTING_TO_CONST){
        this.props.onGetToTop(e);
      }
    },
    scrollToBottom: function(time){
      this.autoscrolling = true;
      this.iscroll.scrollTo(0, this.iscroll.maxScrollY, time);
    },
    componentDidMount: function(){
      this.iscroll = new IScroll(this.getDOMNode(), {
        mouseWheel: true,
        scrollbars: true
      });
      // populate User model inside object
      this.props.messages.models.forEach(function(model){
        populateUser(model,this)
      }.bind(this));
      this.props.messages.on('change add remove', function(){
        this.props.messages.models.forEach(function(model){
          if(!model.__user || !model.__user.get('id')) populateUser(model, this);
        }.bind(this));
      }.bind(this))
      function populateUser(message, component){
        var user = ContactFactory.getContactModel(message.get('uid'));
        message.bindUser(user);
        component.injectModel(user);
      };
      /*
      this.lastScrollHeight = this.iscroll.scrollerHeight;
      /*var checkPosition = setInterval(function(){
        if(this.iscroll.y !== this.lastScrollPosition && !this.autoscrolling){
          //this.scroll.call(this, this.iscroll);
          this.lastScrollPosition = this.iscroll.y;
        }
      }.bind(this), 30);
      this.iscroll.on('scrollEnd', function(){
        if(!this.autoscrolling) return;
        this.autoscrolling = false;
        this.lastScrollPosition = this.iscroll.y;
      }.bind(this));*/
    },
    lastScrollHeight: null,
    componentDidUpdate:function(){
      this.iscroll.refresh();
      if(!this.scrollDirectionDown){
        var diff = this.iscroll.scrollerHeight - this.lastScrollHeight;
        setTimeout(function(){
          this.iscroll.scrollTo(0, this.lastScrollPosition - diff, 0);
        }.bind(this), 0)
      }
      this.lastScrollHeight = this.iscroll.scrollerHeight;
    },
    render: function() {
      return <div className="messagesList">
        <div onScroll ={this.notify}>
          <div id="scroller" >
            {this.props.messages && this.props.messages.models.map(itemClass)}
          </div>
        </div>
      </div>;
    }
  });
}
