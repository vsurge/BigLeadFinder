(function(){
    'use strict';

    var MODULE_NAME = 'app.views.settings';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('SettingsCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,AppServices) {

        var Init = function () {

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