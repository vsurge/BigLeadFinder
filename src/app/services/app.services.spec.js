var module = require('./app.services');

describe('AppServices', function() {

    var AppServices = null;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function(_AppServices_){
            AppServices = _AppServices_;
        });
    });

    it("instantiates", function() {
        expect(AppServices).toBeObject();
    });

    it("has an auth object", function() {
        expect(AppServices.auth).toBeObject();
    });

    it("has an api object", function() {
        expect(AppServices.api).toBeObject();
    });
});