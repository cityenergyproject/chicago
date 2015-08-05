describe("CityBuildings", function(){
  var CityBuildingQuery = function(city, categories, ranges) {
    this.city = city;
    this.categories = categories;
    this.ranges = ranges;
  };

  CityBuildingQuery.prototype.toRangeSql = function() {
    return this.ranges.map(function(range){
      return range.field + " BETWEEN " + range.min + " AND " + range.max;
    });
  };

  CityBuildingQuery.prototype.toCategorySql = function() {
    return this.categories.map(function(category){
      var operation = category.other ? "NOT IN" : "IN";
      return category.field + " " + operation + " (" + category.values.join(', ') + ")";
    });
  };

  CityBuildingQuery.prototype.toSql = function() {
    var table = this.city.get('table_name');
    var rangeSql = this.toRangeSql();
    var categorySql = this.toCategorySql();
    var filterSql = rangeSql.concat(categorySql).join(' AND ');
    var output = ["SELECT * FROM " + table].concat(filterSql).filter(function(e) { return e.length > 0; });
    return output.join(" WHERE ");
  };

  CityBuildingQuery.prototype.toBuildingSet = function() {
    return new CityBuildings(null, {
      city: this.city,
      query: this.toSql()
    });
  };

  it("renders category queries when there are no unknown categories selected", function(){
    var city = {get: function(){ return 'city'; }},
        categories = [{field: 'some_field', values: [1, 2, 3], other: false}],
        ranges = [];

    var query = new CityBuildingQuery(city, categories, ranges);
    expect(query.toSql()).toEqual(
      "SELECT * FROM city WHERE some_field IN (1, 2, 3)"
    );
  });

  it("renders category queries when there are unknown categories selected", function(){
    var city = {get: function(){ return 'city'; }},
        categories = [{field: 'some_field', values: [1, 2, 3], other: true}],
        ranges = [];

    var query = new CityBuildingQuery(city, categories, ranges);
    expect(query.toSql()).toEqual(
      "SELECT * FROM city WHERE some_field NOT IN (1, 2, 3)"
    );
  });

  it("renders range queries", function(){
    var city = {get: function(){ return 'city'; }},
        categories = [],
        ranges = [{field: 'other_field', min: 0, max: 20}];

    var query = new CityBuildingQuery(city, categories, ranges);
    expect(query.toSql()).toEqual(
      "SELECT * FROM city WHERE other_field BETWEEN 0 AND 20"
    );
  })

  it("renders combined category and range queries", function(){
    var city = {get: function(){ return 'city'; }},
        categories = [{field: 'some_field', values: [1, 2, 3], other: false}],
        ranges = [{field: 'other_field', min: 0, max: 20}];

    var query = new CityBuildingQuery(city, categories, ranges);
    expect(query.toSql()).toEqual(
      "SELECT * FROM city WHERE other_field BETWEEN 0 AND 20 AND some_field IN (1, 2, 3)"
    );
  })

  it("renders empty queries", function(){
    var city = {get: function(){ return 'city'; }},
        categories = [],
        ranges = [];

    var query = new CityBuildingQuery(city, categories, ranges);
    expect(query.toSql()).toEqual(
      "SELECT * FROM city"
    );
  })
});
