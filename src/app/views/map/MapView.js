define([
  'jquery',
  'underscore',
  'backbone',
  'models/city/CityModel',
  'models/map/MapModel',
  'models/map/LayerModel',
  'views/map/LayerView',
  'views/map/AddressSearchView',
  'views/map/MapControlView',
  'views/map/MapCategoryControlView',
  'views/map/YearControlView',
  'text!/app/templates/map_controls/MapControlCategoryTemplate.html',
  'text!/app/templates/layout/HeaderTemplate.html',
  'collections/CityBuildings',
], function($, _, Backbone,CityModel,MapModel,LayerModel,LayerView,AddressSearchView,MapControlView,MapCategoryControlView,YearControlView, MapControlCategoryTemplate, HeaderTemplate, CityBuildings){

  var MapView = Backbone.View.extend({
    el: $("#map"),

    initialize: function(options){
      this.state = options.state;
      document.title = this.model.get('title');

      this.listenTo(this.model, 'change:city', this.changeCity);
      this.listenTo(this.model, 'cityChange', this.initWithCity);
      this.listenTo(this.model, 'yearChange', this.yearChange);
    },

    initWithCity: function(){
      document.title = this.model.get('title');
      var template = _.template(HeaderTemplate);
      $('#title').html(template({title: this.model.get('title'), url_name: this.model.get('url_name')}))

      this.allBuildings = new CityBuildings(null, {city: this.model.get('city')});
      this.listenTo(this.allBuildings, 'sync', this.onBuildings, this);

      if (!this.leafletMap){
        this.leafletMap = new L.Map(this.el, {
          center: this.model.get('center'),
          zoom: this.model.get('zoom'),
          scrollWheelZoom: false
        });
        L.tileLayer(this.model.get('city').get('tileSource')).addTo(this.leafletMap);
        this.leafletMap.zoomControl.setPosition('topright');
      }

      this.addressSearchView = this.addressSearchView || new AddressSearchView({mapView: this});
      this.yearControlView = this.yearControlView || new YearControlView({mapView: this});
      this.allBuildings.fetch();

      this.render();
      return this;
    },

    onBuildings: function(){
      var map = this.model,
          city = map.get('city'),
          layers = city.layers,
          allBuildings = this.allBuildings,
          state = this.state;

      var layers = city.get('map_layers');
      var views = _.map(layers, function(layer){
        var View = {
          range: Backbone.View,
          category: MapCategoryControlView
        }[layer.display_type];
        return new View({layer: layer, allBuildings: allBuildings, state: state});
      });
      _.each(views, function(v) { v.render(); })

      this.currentLayerView = new LayerView({mapView: this, city: city, allBuildings: allBuildings, state: state});
    },

    render: function(){
      this.renderMapControls();
      return this;
    },

    renderMapControls: function(){
      return this;
    },
    yearChange: function(){
      $('#map-controls').empty();
      $('#map-category-controls').empty();
      this.initWithCity();
    }




  });

  return MapView;

});
