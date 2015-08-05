define([
  'jquery',
  'underscore',
  'backbone',
  'models/map/MapModel',
  'models/map/LayerModel',
  'collections/CityBuildings',
  'models/building_color_bucket_calculator',
  'text!/app/templates/map/BuildingInfoTemplate.html'
], function($, _, Backbone, MapModel, LayerModel, CityBuildings, BuildingColorBucketCalculator, BuildingInfoTemplate){

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

  var LayerView = Backbone.View.extend({
    model: LayerModel,

    initialize: function(options){
      this.city = options.city;
      this.allBuildings = new CityBuildings(null, {city: options.city});
      this.listenTo(this.allBuildings, 'sync', this.onBuildings, this);
      this.allBuildings.fetch();

      this.mapView = options.mapView;
      this.leafletMap = options.mapView.leafletMap;

      this.listenTo(this.model.collection, 'change:filter', this.render);
      this.listenTo(this.mapView.model, 'change:current_layer', this.showCurrentLayer);
      this.listenTo(this.mapView.model, 'yearChange', this.yearChange);
    },

    toCartoSublayer: function(){
      var buildings = this.allBuildings,
          currentLayer = this.mapView.model.get('current_layer'),
          fieldName = currentLayer,
          city = this.city,
          cityLayer = _.findWhere(city.get('map_layers'), {field_name: fieldName}),
          buckets = cityLayer.range_slice_count
          colorStops = cityLayer.color_range;
      var calculator = new BuildingColorBucketCalculator(buildings, fieldName, buckets, colorStops);
      var stylesheet = new CartoStyleSheet(this.allBuildings.table_name, calculator);

      return {
        sql: this.allBuildings.toSql(),
        cartocss: stylesheet.toCartoCSS()
      }
    },

    onBuildings: function(){
      var newLayer = cartodb.createLayer(this.leafletMap, {
        user_name: 'cityenergyproject',
        type: 'cartodb',
        sublayers: [this.toCartoSublayer()]
      }).addTo(this.leafletMap).on('done', this.onCartoLoad, this);
    },

    onCartoLoad: function(layer) {
      var sub = layer.getSubLayer(0);

      this.leafletLayer = layer;
      sub.setInteraction(true);
      sub.on('featureClick', function(e, latlng, pos, data) {
        this.showBuildingInfo(e, latlng, pos, data);
      }, this)
      .on('featureOver', function(e, latlng, pos, data) {
        $('#map').css('cursor', "help");
      })
      .on('featureOut', function(e, latlng, pos, data) {
        $('#map').css('cursor', "auto");
      });
    },

    render: function(){
      this.leafletLayer.getSubLayer(0).set(this.toCartoSublayer()).show();
      return this;
    },

    showBuildingInfo: function(e, latlng, pos, data){
      var popupFields = this.model.collection.city.get('popup_fields');
      var populatedLabels = _.reduce(popupFields, function(labels, field){
        labels.push({label: field.label, value: data[field.field]});
        return labels;
      }, []);

      template = _.template(BuildingInfoTemplate);

      info = L.popup()
        .setLatLng(latlng)
        .setContent(template({labels: populatedLabels}))
        .openOn(this.leafletMap);
    }
  });

  return LayerView;

});
