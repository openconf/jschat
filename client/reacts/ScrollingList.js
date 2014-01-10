/** @jsx React.DOM */
var ContactFactory = require('../models/ContactFactory');


module.exports = function(itemClass){
  return React.createClass({
    __name: "Scrolling",
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
        this.props.renderedItems.fetch({
          success: function(){
            this.scrollToBottom()
          }.bind(this)
        })
        //prepare user model ontop of each message
        this.controlEdges();
        // populate User model inside object
        this.props.renderedItems.models.forEach(function(model){
          populateUser(model,this)
        }.bind(this));
        this.props.renderedItems.on('change add remove', function(){
          this.props.renderedItems.models.forEach(function(model){
            if(model.__user && !model.__user.injected) populateUser(model, this);
          }.bind(this));
        }.bind(this));
      }
      function populateUser(message, component){
        message.__user.injected = true;
        component.injectModel(message.__user);
      };
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
      if(this.shouldScrollBottom){
        node.scrollTop = node.scrollHeight;
      }
      if(this.shouldStayTop){
        node.scrollTop = this._scrollTop + (node.scrollHeight - this._scrollHeight);
      }
    },
    controlEdges: function(update){
      var scrolledFromTop = this.getDOMNode().scrollTop;
      var bottom = this.refs.inner.getDOMNode().offsetHeight - this.getDOMNode().offsetHeight;
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
          <div className="writingBar">{this.props.writingStatus}</div>
        </div>
    </div>;
    }
  });
}
