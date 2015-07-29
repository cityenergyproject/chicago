define([
  'jquery',
  'underscore',
  'backbone',
  'text!/app/templates/map/YearControlTemplate.html'
], function($, _, Backbone, YearControlTemplate){

  var AddressSearchView = Backbone.View.extend({
    $container: $('#year-select'),
    className: "year-control",

    initialize: function(options){
      this.mapView = options.mapView;
      this.city = this.mapView.model.get('city')
      this.render();
    },

    render: function(){
      this.$el.appendTo(this.$container);

      var template = _.template(YearControlTemplate);
      this.$el.html(
        template({years: _.keys(this.city.get('years')), current_year: this.city.get('year')})
      );

      return this;
    },

    events: {
      'click span' : 'selectYear'
    },

    selectYear: function(event){
      var year = $(event.target).html().trim();
      Backbone.history.navigate(this.city.get('url_name') + '/' + year + '/' + this.mapView.model.get('current_layer'), {trigger: true})
    }


  });

  return AddressSearchView;

});