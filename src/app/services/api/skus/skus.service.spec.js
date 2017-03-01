var module = require('./eta-users.service');

describe('EtaUsersService', function() {

    var EtaUsersService = null;
    beforeEach(function() {
        angular.mock.module(module);

        angular.mock.inject(function(_EtaUsersService_){
            EtaUsersService = _EtaUsersService_;
        });
    });

    it("instantiates", function() {
        expect(EtaUsersService).toBeFunction();
    });

});