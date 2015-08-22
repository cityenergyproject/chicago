var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

describe('Building Comparison', function() {
  var driver;

  beforeEach(function(done) {
    driver = new webdriver.Builder().forBrowser('chrome').build();
    done();
  });

  afterEach(function(done) {
    driver.quit().then(done);
  });

  describe("when the layer is malformed", function(){
    beforeEach(function(done) {
      driver.get('http://localhost:8080/#los_angeles/2014?layer=weather_normalized_source').then(done);
    });

    it('renders the building comparison table', function(done) {
      driver.wait(until.elementLocated(By.css('.building')), 3500).then(done);
    });
  })
});
