(function(){
    'use strict';

    var MODULE_NAME = 'app.views.settings';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('SettingsCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log,$q, $timeout,AppServices) {

        $scope.refreshDefaultSettings = function (){
            return AppServices.api.settings.refreshDefaultSettings().then(function(settings){

                //$log.debug('settings: ' + JSON.stringify(settings,null,2))
                $scope.settings = settings;

            }).catch(function(error){
                $log.error(error)
            });
        };

        $scope.updateSettings = function (settings) {
            //$log.debug('settings: ' + JSON.stringify(settings,null,2));
            AppServices.api.settings.create(settings)
        };

        $scope.clearAllData = function () {

            $scope.removeAllData().then(function(){

                $timeout(function(){

                    $scope.seedAllData();

                },2000);

            });
        };


        $scope.removeAllData = function () {

            var chain = $q.when();

            for(var key in AppServices.api) {

                (function(service) {
                    //var state = JSON.parse(JSON.stringify(input));
                    //$log.debug(state);

                    chain.then(function(){

                        return AppServices.api[service].remove({});
                    });

                })(key)

            }

            return chain;

        };

        $scope.seedAllData = function () {

            var chain = $q.when();

            for(var key in AppServices.api) {

                (function(service) {
                    //var state = JSON.parse(JSON.stringify(input));
                    //$log.debug(state);

                    chain.then(function(){

                        return AppServices.api[service].seed();
                    });

                })(key)

            }

            chain.then(function(){

                $timeout(function(){
                    $scope.refreshDefaultSettings();
                    AppServices.api.cities.updateCities();
                });
            });

            return chain;

        };

        $scope.settings = {};

        var Init = function () {
            $scope.refreshDefaultSettings();
        }

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.settings', {
                url: '/settings',
                views: {
                    'container@': {
                        template: require('./settings.html'),
                        controller: 'SettingsCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Settings'
                }
            });
    };

    module.exports = MODULE_NAME;

})();