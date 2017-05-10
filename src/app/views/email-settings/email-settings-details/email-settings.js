(function(){
    'use strict';

    var MODULE_NAME = 'app.views.email-settings';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('SettingsCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log,$q, $timeout,AppServices) {

        $scope.updateSettings = function (settings) {
            //$log.debug('settings: ' + JSON.stringify(settings,null,2));
            AppServices.api.app_settings.create(settings)
        };

        $scope.settings = {};

        var Init = function () {

        }

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.email-settings', {
                url: '/email-settings',
                views: {
                    'container@': {
                        template: require('./email-settings.html'),
                        controller: 'EmailSettingsCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Email Settings',
                    parent:'app.dashboard'
                }
            });
    };

    module.exports = MODULE_NAME;

})();