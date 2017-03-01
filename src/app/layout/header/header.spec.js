var module = require('./header');

describe('header', function() {

    var ctrl;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function($controller,$rootScope){

            var scope = $rootScope.$new();
            ctrl = $controller('HeaderCtrl',{$scope:scope});
        });
    });

    it("has a controller", function() {
        expect(ctrl).toBeObject();
    });
});