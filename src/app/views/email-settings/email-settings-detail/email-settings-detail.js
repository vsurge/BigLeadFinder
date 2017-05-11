(function(){
    'use strict';

    var MODULE_NAME = 'app.views.email-settings-detail';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('EmailSettingsDetailCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log,$q, $timeout, $state, AppServices, settings) {

        $scope.updateSettings = function (settings) {
            //$log.debug('settings: ' + JSON.stringify(settings,null,2));
            AppServices.api.email_settings.create(settings)
        };

        $scope.settings = settings;

        $scope.deleteSettings  = function (item) {
            AppServices.api.email_settings.remove({_id:item._id}).then(function(){
                $rootScope.showToast(item.name + ' Email Setting Removed.');
                $state.go('app.email-settings');
            })
        };

        var Init = function () {

        };

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.email-settings-detail', {
                url: '/email-settings-detail:_id',
                views: {
                    'container@': {
                        template: require('./email-settings-detail.html'),
                        controller: 'EmailSettingsDetailCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve:{
                    settings:Settings
                },
                ncyBreadcrumb: {
                    label: 'Detail',
                    parent:'app.email-settings'
                }
            });
    };

    /* @ngInject */
    function Settings (AppServices,$stateParams) {

        if ($stateParams._id) {
            return AppServices.api.email_settings.findByID($stateParams._id);
        } else {
            return {};
        }

    }


    module.exports = MODULE_NAME;

})();