define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'views/map/LayerView',
  'views/map/MapControlView',
  'views/map/MapCategoryControlView',
  'text!/app/templates/map_controls/MapControlCategoryTemplate.html',
  'text!/app/templates/layout/HeaderTemplate.html',
  'collections/CityBuildings',
], function($, _, Backbone,CityModel,MapModel,LayerModel,LayerView,MapControlView,MapCategoryControlView, MapControlCategoryTemplate, HeaderTemplate, CityBuildings){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(options){
      this.state = options.state;
      this.listenTo(this.state, 'change:city', this.onCityChange);
    },

    onCityChange: function(){
      this.listenTo(this.state.get('city'), 'sync', this.onCitySync)
    },

    onCitySync: function(){
      var city = this.state.get('city'),
          title = city.get('title'),
          url_name = city.get('url_name');

      this.allBuildings = this.state.asBuildings();
      this.listenTo(this.allBuildings, 'sync', this.onBuildings, this);
      this.allBuildings.fetch();

      this.render();
      return this;

    },
    render: function(){
      var city = this.state.get('city'),
          title = city.get('title'),
          url_name = city.get('url_name'),
          template = _.template(HeaderTemplate);

      document.title = title;
      $('#title').html(template({title: title, url_name: url_name}))

      if (!this.leafletMap){
        this.leafletMap = new L.Map(this.el, {
          center: city.get('center'),
          zoom: city.get('zoom'),
          scrollWheelZoom: false
        });
        L.tileLayer(city.get('tileSource')).addTo(this.leafletMap);
        this.leafletMap.zoomControl.setPosition('topright');
        this.currentLayerView = new LayerView({leafletMap: this.leafletMap, state: this.state});
      }
    },

    onBuildings: function(){
      var state = this.state,
          city = state.get('city'),
          layers = city.layers,
          allBuildings = this.allBuildings,
          state = this.state;

      $('#map-category-controls').empty();
      var layers = city.get('map_layers');
      var views = _.map(layers, function(layer){
        var View = {
          range: Backbone.View,
          category: MapCategoryControlView
        }[layer.display_type];
        return new View({layer: layer, allBuildings: allBuildings, state: state});
      });
      _.each(views, function(v) { v.render(); })
    }
  });

  return MapView;

});
