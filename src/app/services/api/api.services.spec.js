var module = require('./api.services');

describe('ApiServices', function() {

    var ApiServices = null;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function(_ApiServices_){
            ApiServices = _ApiServices_;
        });
    });

    it("instantiates", function() {

        expect(ApiServices).toBeObject();
        expect(ApiServices.eta_users).toBeFunction();
        expect(ApiServices.scacs).toBeFunction();
        expect(ApiServices.shipment_rules).toBeFunction();
        expect(ApiServices.shipments).toBeFunction();
        expect(ApiServices.shortfuse_configs).toBeFunction();
        expect(ApiServices.user_scacs).toBeFunction();
    });

});