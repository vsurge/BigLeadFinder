(function(){
    'use strict';

    var MODULE_NAME = 'app.views.app-settings';
    require('angular-ui-router');
    require('angular-file-saver');

    angular.module(MODULE_NAME,[
        'ui.router',
        'ngFileSaver'
    ]).config(Config).controller('AppSettingsCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log,$q, $timeout, $state,$filter,AppServices,FileSaver, Blob, $) {

        $scope.refreshDefaultSettings = function (){
            return AppServices.api.app_settings.refreshDefaultSettings().then(function(settings){

                //$log.debug('settings: ' + JSON.stringify(settings,null,2))
                $scope.settings = settings;

            }).catch(function(error){
                $log.error(error)
            });
        };

        $scope.updateSettings = function (settings) {
            //$log.debug('settings: ' + JSON.stringify(settings,null,2));
            AppServices.api.app_settings.create(settings).then(function(result){
                AppServices.api.app_settings.refreshDefaultSettings();
            });

        };

        $scope.clearAllData = function () {

            $scope.removeAllData().then(function(){

                $timeout(function(){

                    $scope.seedAllData();

                },2000);

                $state.go('app.dashboard');

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

        $scope.exportData = function (){
            AppServices.exportAll().then(function (blob) {

                var date = new Date();
                var filename = 'LeadFinderExport_' + $filter('date')(date, 'yyyy-MM-dd_HH-mm-ss_Z') + '.zip'
                FileSaver.saveAs(blob, filename);
            });
        };

        $scope.importData = function (){

            $("#fileInput").trigger('click');

        };

        $scope.fileNameChanged = function (element) {

            AppServices.importAll(element.files['0']).then(function (result) {
                $rootScope.showToast('Settings Imported!')
            });
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
            .state('app.app-settings', {
                url: '/app-settings',
                views: {
                    'container@': {
                        template: require('./app-settings.html'),
                        controller: 'AppSettingsCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'App Settings',
                    parent:'app.dashboard'
                }
            });
    };

    module.exports = MODULE_NAME;

})();