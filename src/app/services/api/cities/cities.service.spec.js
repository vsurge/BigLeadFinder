var module = require('./cities.service');

describe('lfCitiesService', function() {

    var lfCitiesService = null;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function(_lfCitiesService_){
            lfCitiesService = _lfCitiesService_;
        });
    });

    it("instantiates", function() {
        expect(lfCitiesService).toBeFunction();
    });

});