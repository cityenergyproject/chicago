var Backbone = require('backbone'),
    _ = require('underscore');

describe("BuildingInfoPresenter", function(){
  var BuildingInfoPresenter = function(city, allBuildings, buildingId){
    this.city = city;
    this.allBuildings = allBuildings;
    this.buildingId = buildingId;
  };

  BuildingInfoPresenter.prototype.toLatLng = function() {
    return {lat: this.toBuilding().get('lat'), lng: this.toBuilding().get('lng')};
  }

  BuildingInfoPresenter.prototype.toBuilding = function() {
    return this.allBuildings.find(function(building) {
      return building.get(this.city.get('property_id')) == this.buildingId
    }, this);
  }

  BuildingInfoPresenter.prototype.toPopulatedLabels = function()  {
    return _.map(this.city.get('popup_fields'), function(field) {
      return _.extend({
        value: this.toBuilding().get(field.field)
      }, field);
    }, this);
  }

  var subject, building, city;

  beforeEach(function(){
    building = new Backbone.Model({property_id: 123, lat: 1, lng: 2, property_coolness: 'ok, fine'});
    city = new Backbone.Model({
      'property_id': 'property_id',
      "popup_fields": [
        {"field": "property_coolness", "label": "Buildings Are Cool"}
      ]
    });
    var allBuildings = new Backbone.Collection([building]),
        buildingId = 123;
    subject = new BuildingInfoPresenter(city, allBuildings, buildingId);
  });

  describe("#toBuilding", function(){
    it("returns the building with the provided id", function(){
      expect(subject.toBuilding()).toEqual(building);
    });

    describe("when the building id searched as a string but provided as an integer", function(){
      beforeEach(function(){
        var allBuildings = new Backbone.Collection([building]),
          buildingId = '123';
        subject = new BuildingInfoPresenter(city, allBuildings, buildingId);
      });

      it("returns the building with the provided id", function(){
        expect(subject.toBuilding()).toEqual(building);
      });
    });

    describe("when the building id is a string in both cases", function(){
      beforeEach(function(){
        building = new Backbone.Model({property_id: 'tacos', lat: 1, lng: 2, property_coolness: 'ok, fine'});
        var allBuildings = new Backbone.Collection([building]),
          buildingId = 'tacos';
        subject = new BuildingInfoPresenter(city, allBuildings, buildingId);
      });

      it("returns the building with the provided id", function(){
        expect(subject.toBuilding()).toEqual(building);
      });
    });

    describe("when in another city", function(){
      beforeEach(function(){
        building = new Backbone.Model({'property_id_different': 1234, 'lat': 3, 'lng': 4});
        city = new Backbone.Model({'property_id': 'property_id_different'});
        var allBuildings = new Backbone.Collection([building]),
            buildingId = 1234;
        subject = new BuildingInfoPresenter(city, allBuildings, buildingId);
      });

      it("returns the building from another city", function(){
        expect(subject.toBuilding()).toEqual(building);
      })
    });
  });

  describe("#toPopulatedLabels", function() {
    it("returns populated popup labels for a building", function() {
      expect(subject.toPopulatedLabels()).toEqual([
        {field: "property_coolness", label: "Buildings Are Cool", value: "ok, fine"}
      ]);
    })
  });

  describe("#toLatLng", function(){
    it("returns the latlng pair for the building", function(){
      expect(subject.toLatLng()).toEqual({lat: 1, lng: 2});
    });
  });
});
