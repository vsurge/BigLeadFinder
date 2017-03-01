var module = require('./dashboard');

describe('settings', function() {

    var ctrl;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function($controller){

            ctrl = $controller('DashboardCtrl',{});
        });
    });

    it("has a controller", function() {
        expect(ctrl).toBeObject();
    });
});