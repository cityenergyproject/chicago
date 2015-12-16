define([
  'jquery',
  'underscore',
  'backbone',
  'collections/city_buildings',
  'models/building_color_bucket_calculator',
  'text!templates/map/building_info.html'
], function($, _, Backbone, CityBuildings, BuildingColorBucketCalculator, BuildingInfoTemplate){

  var baseCartoCSS = [
    '{marker-fill: #CCC;' +
    'marker-fill-opacity: 0.9;' +
    'marker-line-color: #FFF;' +
    'marker-line-width: 0.5;' +
    'marker-line-opacity: 1;' +
    'marker-placement: point;' +
    'marker-multi-policy: largest;' +
    'marker-type: ellipse;' +
    'marker-allow-overlap: true;' +
    'marker-clip: false;}'
  ];

  var CartoStyleSheet = function(tableName, bucketCalculator) {
    this.tableName = tableName;
    this.bucketCalculator = bucketCalculator;
  }

  CartoStyleSheet.prototype.toCartoCSS = function(){
    var bucketCSS = this.bucketCalculator.toCartoCSS(),
        styles = baseCartoCSS.concat(bucketCSS),
        tableName = this.tableName;
    styles = _.reject(styles, function(s) { return !s; });
    styles = _.map(styles, function(s) { return "#" + tableName + " " + s; });
    return styles.join("\n");
  };

  var BuildingInfoPresenter = function(city, allBuildings, buildingId){
    this.city = city;
    this.allBuildings = allBuildings;
    this.buildingId = buildingId;
  };

  BuildingInfoPresenter.prototype.toLatLng = function() {
    return {lat: this.toBuilding().get('lat'), lng: this.toBuilding().get('lng')};
  };

  BuildingInfoPresenter.prototype.toBuilding = function() {
    return this.allBuildings.find(function(building) {
      return building.get(this.city.get('property_id')) == this.buildingId
    }, this);
  };

  BuildingInfoPresenter.prototype.toPopulatedLabels = function()  {
    return _.map(this.city.get('popup_fields'), function(field) {
      return _.extend({
        value: (this.toBuilding().get(field.field) || 'N/A').toLocaleString()
      }, field);
    }, this);
  };

  var LayerView = Backbone.View.extend({
    initialize: function(options){
      this.state = options.state;
      this.leafletMap = options.leafletMap;
      this.allBuildings = new CityBuildings(null, {});

      this.listenTo(this.state, 'change:layer', this.onStateChange);
      this.listenTo(this.state, 'change:filters', this.onStateChange);
      this.listenTo(this.state, 'change:categories', this.onStateChange);
      this.listenTo(this.state, 'change:tableName', this.onStateChange);
      this.listenTo(this.state, 'change:building', this.onBuildingChange);
      this.listenTo(this.allBuildings, 'sync', this.render);
      this.onStateChange();
    },

    onBuildingChange: function() {
      var template = _.template(BuildingInfoTemplate),
          presenter = new BuildingInfoPresenter(this.state.get('city'), this.allBuildings, this.state.get('building'));
      L.popup()
       .setLatLng(presenter.toLatLng())
       .setContent(template({labels: presenter.toPopulatedLabels()}))
       .openOn(this.leafletMap);
    },

    onFeatureClick: function(event, latlng, _unused, data){
      var propertyId = this.state.get('city').get('property_id'),
          buildingId = data[propertyId];
      this.state.set({building: buildingId});
    },
    onFeatureOver: function(){
      $('#map').css('cursor', "help");
    },
    onFeatureOut: function(){
      $('#map').css('cursor', '');
    },

    onStateChange: function(){
      _.extend(this.allBuildings, this.state.pick('tableName', 'cartoDbUser'));
      this.allBuildings.fetch();
    },

    toCartoSublayer: function(){
      var buildings = this.allBuildings,
          state = this.state,
          city = state.get('city'),
          fieldName = state.get('layer'),
          cityLayer = _.findWhere(city.get('map_layers'), {field_name: fieldName}),
          buckets = cityLayer.range_slice_count
          colorStops = cityLayer.color_range,
          calculator = new BuildingColorBucketCalculator(buildings, fieldName, buckets, colorStops),
          stylesheet = new CartoStyleSheet(buildings.tableName, calculator);
      return {
        sql: buildings.toSql(state.get('categories'), state.get('filters')),
        cartocss: stylesheet.toCartoCSS(),
        interactivity: this.state.get('city').get('property_id')
      }
    },

    render: function(){
      if(this.cartoLayer) {
        this.cartoLayer.getSubLayer(0).set(this.toCartoSublayer()).show();
        return this;
      }
      cartodb.createLayer(this.leafletMap, {
        user_name: this.allBuildings.cartoDbUser,
        type: 'cartodb',
        sublayers: [this.toCartoSublayer()]
      }).addTo(this.leafletMap).on('done', this.onCartoLoad, this);

      return this;
    },
    onCartoLoad: function(layer) {
      var sub = layer.getSubLayer(0);
      this.cartoLayer = layer;
      sub.setInteraction(true);
      sub.on('featureClick', this.onFeatureClick, this);
      sub.on('featureOver', this.onFeatureOver, this);
      sub.on('featureOut', this.onFeatureOut, this);
      this.onBuildingChange();
    }
  });

  return LayerView;

});
