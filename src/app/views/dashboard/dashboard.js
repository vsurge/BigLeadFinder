(function(){
    'use strict';

    var MODULE_NAME = 'app.views.dashboard';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('DashboardCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,AppServices) {

        $scope.cities = function() {

            AppServices.cl.cities.updateCities();

        };

        var Init = function () {

        }

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.dashboard', {
                url: '/dashboard',
                views: {
                    'container@': {
                        template: require('./dashboard.html'),
                        controller: 'DashboardCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    };

    module.exports = MODULE_NAME;

})();