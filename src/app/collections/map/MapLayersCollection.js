define([
  'underscore',
  'backbone',
  'models/map/LayerModel',
  'models/map/CategoryLayerModel'
], function(_, Backbone, LayerModel, CategoryLayerModel) {

  var MapLayersCollection = Backbone.Collection.extend({
    model: LayerModel,

    defaults : {
    },

    initialize: function(models, params){  
      this.city = params.city;
        
      this.cartoClient = new cartodb.SQL({ user: 'cityenergyproject' });
      this.listenTo(this.city, 'cityLoaded', function(){
        this.initWithCity();
      })

    },

    initWithCity: function(){
      this.update();

      this.listenTo(this.city, 'change:cartoDbUser', function(){
        this.cartoClient.options.user = this.city.get('cartoDbUser');
      });

      this.listenTo(this.city, 'change:map_layers', this.update);
      this.listenTo(this.city, 'change:table_name', this.update);
      this.listenTo(this, 'change:filter', this.updateCurrentBuildingSet);
    },

    interactivity: function(){
      return "cartodb_id, " + _.values(this.city.get('building_info_fields')).join(', ');
    },

    filtersSQL: function(){
      var sql = this.map(function(layer){
        if(layer.get('filter')===undefined){return "";}
        return layer.filterSQL();
      });
      return _.compact(sql).join(' AND ');
    },

    update: function(){
      this.reset(null);

      this.dataSQLBase = "SELECT * FROM " + this.city.get('table_name');

      var layers = this.city.get('map_layers').map(function(layer){
        _.extend(layer, {table_name: this.city.get('table_name')});
        if (layer.display_type=='category'){
          return new CategoryLayerModel(layer);
        }else{
          return new LayerModel(layer);
        }
      }, this);
      this.add(layers);
      this.fetch();
    },

    fetch: function(){
      var self = this;

      this.cartoClient.execute(this.dataSQLBase)
      .done(function(data) {
        self.city.set('currentBuildingSet', data.rows);

        self.each(function(layer){
          var data = _.pluck(this, layer.get('field_name'));
          layer.set('data', data);
        }, data.rows);
        self.trigger('updateLayers');
      });
    },


    updateCurrentBuildingSet: function(){
      var self = this;
      var filtersSQL = this.filtersSQL();
      var sql = this.dataSQLBase + ((filtersSQL == '') ? "" : " WHERE " + filtersSQL);

      this.cartoClient.execute(sql)
      .done(function(data) {
        var currentBuildingSet = data.rows;
        currentBuildingSet.__proto__.sortedBy = {};
        self.city.set('currentBuildingSet', currentBuildingSet);
      });

    }

  });

  return MapLayersCollection;

});