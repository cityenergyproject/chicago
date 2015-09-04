define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/layout/header.html'
], function($, _, Backbone, HeaderTemplate){
  var Header = Backbone.View.extend({
    initialize: function(options){
      this.state = options.state;
      this.template = _.template(HeaderTemplate);
      this.listenTo(this.state, 'change:city', this.onCityChange);
    },
    onCityChange: function(){
      this.listenTo(this.state.get('city'), 'sync', this.render);
    },
    render: function(){
      var city = this.state.get('city'),
          name = city.get('name'),
          url_name = city.get('url_name');
      document.title = name;
      $('#title').html(this.template({url_name: url_name, title: name}));
      return this;
    }
  });

  return Header;
});
