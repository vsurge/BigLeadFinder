(function(){
    'use strict';

    var MODULE_NAME = 'app.views.settings';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('SettingsCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,AppServices) {

        $scope.refreshDefaultSettings = function (){
            return AppServices.api.settings.getDefaultSettings().then(function(settings){

                //$log.debug('settings: ' + JSON.stringify(settings,null,2))
                $scope.settings = settings;

            }).catch(function(error){
                $log.error(error)
            });
        };

        $scope.updateSettings = function (settings) {
            //$log.debug('settings: ' + JSON.stringify(settings,null,2));
            AppServices.api.settings.create(settings)
        }

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