var module = require('./sign-in');

describe('sign-in', function() {

    var ctrl;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function($rootScope,$controller, _AppServices_){

            var scope = $rootScope.$new();
            ctrl = $controller('SignInCtrl',{$scope:scope,AppServices:_AppServices_});
        });
    });

    it("has a controller", function() {
        expect(ctrl).toBeObject();
    });
});