(function(){
    'use strict';

    require('./header.scss');

    var MODULE_NAME = 'app.layout.header';

    angular.module(MODULE_NAME,[
    ]).controller('HeaderCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope) {

        $scope.logout = function () {
            $rootScope.authenticated = false;
        };

    };

    module.exports = MODULE_NAME;

})();