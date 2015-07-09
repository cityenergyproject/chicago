define([
  'underscore',
  'backbone',
  'd3',
  'models/map/LayerModel'
], function(_, Backbone,d3,LayerModel) {

  // look at making a LayerModel that gets subclassed here
  var CategoryLayerModel = Backbone.Model.extend({

    defaults : {
        
        baseCSS : [
            '{marker-fill: #CCC;',
            'marker-fill-opacity: 0.9;',
            'marker-line-color: #FFF;',
            'marker-line-width: 0.5;',
            'marker-line-opacity: 1;',
            'marker-placement: point;',
            'marker-multi-policy: largest;',
            'marker-type: ellipse;',
            'marker-allow-overlap: true;',
            'marker-clip: false;}'
        ],
        categories_to_show : 10
    },

    initialize: function(){
      this.on('change:data', this.setDataFields);
    },

    setDataFields: function(){
      this.setColorRampValues();
      this.trigger('dataReady');
    },

    getFilter: function(){
      return this.get('filter');   
    },

    filterSQL: function(){
      var field_name = this.get('field_name');
      var categories = _.values(this.get('filter'))[0];
      var key = _.keys(this.get('filter'))[0]
      op = (key == 'exclude') ? '!=' : '=';
      sql = categories.map(function(category){
        return  field_name + op + "'" + category + "'";
      });
      var sqlJoin = (key == 'exclude') ? ' AND ' : ' OR ';
      return "(" + sql.join(sqlJoin) + ")";
    },

    cartoProperties: function(){
      var base_sql = "SELECT * FROM " + this.get('table_name');
      
      var filtersSQL = this.collection.filtersSQL();
      var sql = base_sql + ((filtersSQL == '') ? "" : " WHERE " + filtersSQL);
      return {
          sql: sql,
          cartocss: this.cartoCSS(),
          interactivity: this.collection.interactivity()
        };
    },

    cartoCSS: function(){
      var table_name = this.get('table_name');
      var field_name = this.get('field_name');
      var baseCSS = this.get('baseCSS');
      var dataCSS = [];
      var self = this;

      // may want to put a linear option in LayerModel, will need to rework this if so
      if (this.get('data')){
        dataCSS = this.colorRampValues.map(function(value){
          return "#" + table_name + "[" + field_name + "='" + value.name + "']{marker-fill:" + value.color + ";}";
        });
      }
      return '#' + table_name + baseCSS.join(['\n']) +'\n' + dataCSS.join(['\n']);

    },

    colorRamp: function(domain){ 
      // todo: figure out how to use the nicer colorbrewer lib here
      return d3.scale.category10().domain(domain)
    },

    setColorRampValues: function(){
      var self = this;
      var category_counts = this.distributionData();
      var displayed_categories = _.reject(category_counts, function(category){
        return category.name == "Other";
      }).slice(0,this.get('categories_to_display'))
      this.colorRampValues = displayed_categories
        .map(function(category){
          var names = _.pluck(displayed_categories,'name');
          category.color = self.colorRamp(names)(category.name);
          return category;
        });

      return this;
    },

    distributionData: function(){
      if (this.get('data') === undefined) {return undefined;}
      var self = this;

      var data = this.get('data');
      var categories = _.uniq(data).map(function(category){
        return {name: category, count: 0};
      });

      _.each(data, function(value){
        if (value === null) {return;}

        var category = _.findWhere(categories, {name: value});
        category.count += 1;

      });
      return _.sortBy(categories, 'count').reverse();
    },

  });

  return CategoryLayerModel;

});