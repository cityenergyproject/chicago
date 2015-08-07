describe("ReportTranslator", function(){
  var _ = {
    isObject: function(obj) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
    },
    has: function(obj, key) {
      return obj != null && hasOwnProperty.call(obj, key);
    },
    keys: function(obj) {
      if (!_.isObject(obj)) return [];
      if (Object.keys) return Object.keys(obj);
      var keys = [];
      for (var key in obj) if (_.has(obj, key)) keys.push(key);
      if (hasEnumBug) collectNonEnumProps(obj, keys);
      return keys;
    },
    values: function(obj) {
      var keys = _.keys(obj);
      var length = keys.length;
      var values = Array(length);
      for (var i = 0; i < length; i++) {
        values[i] = obj[keys[i]];
      }
      return values;
    }
  };

  var ReportTranslator = function(buildingFields, metrics, buildings) {
    this.fields = buildingFields;
    this.metrics = metrics;
    this.buildings = buildings;
  };

  ReportTranslator.prototype.toBuildingRow = function(building) {
    var result = {
      fields: _.values(building.pick(this.fields)),
      metrics: building.pick(this.metrics)
    };
    return result;
  };

  ReportTranslator.prototype.toBuildingReport = function() {
    return this.buildings.map(this.toBuildingRow, this);
  };

  var subject, building;

  beforeEach(function(){
    building = {pick: function(set) { return set; }};
    var buildingsStub = {map: function(transformer, context){ return [transformer.apply(context, [building])] }};
    subject = new ReportTranslator(['grass', 'wheat'], ['#winning'], buildingsStub);
  });

  describe("#toBuildingRow", function(){
    it("returns fields and metrics from a building", function(){
      expect(subject.toBuildingRow(building)).toEqual({
        fields: [ 'grass', 'wheat' ],
        metrics: [ '#winning' ]
      });
    });
  });

  describe("#toBuildingReport", function(){
    it("returns fields and metrics from a building", function(){
      expect(subject.toBuildingReport()).toEqual([{
        fields: [ 'grass', 'wheat' ],
        metrics: [ '#winning' ]
      }]);
    });
  });
});
