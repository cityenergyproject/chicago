describe("CityBuildings", function(){
  var _ = {
    map: function(collection, operation) {
      var result = [];
      if(collection) {
        for (var i = 0; i < collection.length; i++) {
          result.push(operation.call(this, collection[i]));
        }
      }
      return result;
    }
  }

  var CityBuildingQuery = function(table_name, categories, ranges) {
    this.tableName = table_name;
    this.categories = categories;
    this.ranges = ranges;
  };

  CityBuildingQuery.prototype.toRangeSql = function() {
    return _.map(this.ranges, function(range){
      return range.field + " BETWEEN " + range.min + " AND " + range.max;
    });
  };

  CityBuildingQuery.prototype.toWrappedValue = function(value) {
    return "'" + value + "'";
  };

  CityBuildingQuery.prototype.toCategorySql = function() {
    var self = this;
    return _.map(this.categories, function(category){
      var operation = (category.other === 'false' || category.other === false) ? "IN" : "NOT IN",
          values = _.map(category.values, self.toWrappedValue);
      if (values.length === 0) return "";
      return category.field + " " + operation + " (" + values.join(', ') + ")";
    });
  };

  CityBuildingQuery.prototype.toSql = function() {
    var table = this.tableName;
    var rangeSql = this.toRangeSql();
    var categorySql = this.toCategorySql();
    var filterSql = rangeSql.concat(categorySql).join(' AND ');
    var output = ["SELECT * FROM " + table].concat(filterSql).filter(function(e) { return e.length > 0; });
    return output.join(" WHERE ");
  };

  describe("#toSql", function(){
    var tableName, categories, ranges;

    beforeEach(function(){
      tableName = 'city';
      categories = [];
      ranges = [];
    });

    it("renders category queries when there are no unknown categories selected", function(){
      categories = [{field: 'some_field', values: ['taco', 'loco', 'vida'], other: false}];
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city WHERE some_field IN ('taco', 'loco', 'vida')"
      );
    });

    it("renders category queries when the other value is a string", function(){
      categories = [{field: 'some_field', values: ['taco', 'loco', 'vida'], other: "false"}];
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city WHERE some_field IN ('taco', 'loco', 'vida')"
      );
    });

    it("renders category queries when the other value is a string", function(){
      categories = [{field: 'some_field', values: ['taco', 'loco', 'vida'], other: "true"}];
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city WHERE some_field NOT IN ('taco', 'loco', 'vida')"
      );
    });

    it("renders category queries when there are unknown categories selected", function(){
      categories = [{field: 'some_field', values: ['taco', 'loco', 'vida'], other: true}];
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city WHERE some_field NOT IN ('taco', 'loco', 'vida')"
      );
    });

    it("renders category queries when there are no values selected", function(){
      categories = [{field: 'some_field', values: [], other: false}];
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city"
      );
    });

    it("renders range queries", function(){
      ranges = [{field: 'other_field', min: 0, max: 20}];
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city WHERE other_field BETWEEN 0 AND 20"
      );
    })

    it("renders combined category and range queries", function(){
      categories = [{field: 'some_field', values: ['taco', 'loco', 'vida'], other: false}],
      ranges = [{field: 'other_field', min: 0, max: 20}];

      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city WHERE other_field BETWEEN 0 AND 20 AND some_field IN ('taco', 'loco', 'vida')"
      );
    })

    it("renders empty queries", function(){
      var query = new CityBuildingQuery(tableName, categories, ranges);
      expect(query.toSql()).toEqual(
        "SELECT * FROM city"
      );
    })
  });
});
