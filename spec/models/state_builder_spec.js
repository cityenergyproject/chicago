var Backbone = require('backbone'),
    _ = require('underscore');

describe("StateBuilder", function(){
  var StateBuilder = function(city, year, layer) {
    this.city = city;
    this.year = year;
    this.layer = layer;
  };

  StateBuilder.prototype.toYear = function() {
    var currentYear = this.year;
    var availableYears = _.chain(this.city.years).keys().sort();
    var defaultYear = availableYears.last().value();
    return availableYears.contains(currentYear).value() ? currentYear : defaultYear;
  }

  StateBuilder.prototype.toLayer = function(year) {
    var currentLayer = this.layer;
    var availableLayers = _.chain(this.city.map_layers).pluck('field_name');
    var defaultLayer = this.city.years[year].default_layer;
    return availableLayers.contains(currentLayer).value() ? currentLayer : defaultLayer;
  }

  StateBuilder.prototype.toState = function() {
    var year = this.toYear(),
        layer = this.toLayer(year);
    return {
      year: year,
      cartoDbUser: this.city.cartoDbUser,
      tableName: this.city.years[year].table_name,
      layer: layer,
      sort: layer,
      order: 'desc'
    }
  };

  var subject, city, year;

  beforeEach(function(){
    layer = "guacamole";
    year = "2010";
    city = {
      cartoDbUser: "alan",
      map_layers: [
        {field_name: "beans"},
        {field_name: "guacamole"},
      ],
      years: {
        "2010": {table_name: "granite", default_layer: "beans"},
        "2013": {table_name: "mango", default_layer: "guacamole"}
      }
    };
    subject = new StateBuilder(city, year, layer);
  });

  describe("#toYear", function(){
    describe("when the requested year is valid", function(){
      it("returns the year", function(){
        expect(subject.toYear()).toEqual("2010");
      });
    });

    describe("when the request year is not valid", function(){
      beforeEach(function(){
        year = "1999";
        subject = new StateBuilder(city, year, layer);
      });

      it("returns the latest year", function(){
        expect(subject.toYear()).toEqual("2013");
      });
    });
  });

  describe("#toLayer", function(){
    describe("when requested layer exists for the year", function(){
      it("returns the layer", function(){
        expect(subject.toLayer(2013)).toEqual("guacamole");
      });
    });

    describe("when requested layer exists for the year", function(){
      beforeEach(function(){
        layer = "ham";
        subject = new StateBuilder(city, year, layer);
      });

      it("returns the default layer for the year", function(){
        expect(subject.toLayer(2013)).toEqual("guacamole");
      });
    });
  });

  describe("#toState", function(){
    describe("when the requested year and layer exist", function(){
      it("returns the proper year", function(){
        expect(subject.toState()).toEqual(jasmine.objectContaining({
          year: "2010"
        }));
      });

      it("returns the requested layer", function(){
        expect(subject.toState()).toEqual(jasmine.objectContaining({
          layer: "guacamole"
        }));
      });

      it("returns the table name", function(){
        expect(subject.toState()).toEqual(jasmine.objectContaining({
          tableName: "granite"
        }));
      });

      it("returns the carto db user", function(){
        expect(subject.toState()).toEqual(jasmine.objectContaining({
          cartoDbUser: "alan"
        }));
      });
    });

    describe("when the requested year does not exist", function(){
      beforeEach(function(){
        year = "1999";
        subject = new StateBuilder(city, year, layer);
      });

      it("returns the latest year", function(){
        expect(subject.toState()).toEqual(jasmine.objectContaining({
          year: "2013"
        }));
      });
    });

    describe("when the requested layer does not exist", function(){
      beforeEach(function(){
        year = "horrible";
        subject = new StateBuilder(city, year, layer);
      });

      it("returns the default layer", function(){
        expect(subject.toState()).toEqual(jasmine.objectContaining({
          layer: "guacamole"
        }));
      });
    });
  });
});
