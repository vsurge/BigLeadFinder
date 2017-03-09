(function(){
    'use strict';

    var MODULE_NAME = 'app.views.cities';

    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('material-design-lite/material.css');
    require('dataTables.material');
    require('dataTables.material.css');

    require('./cities.scss');

    angular.module(MODULE_NAME,[
        'ui.router',
        'datatables'
    ]).config(Config).controller('CitiesCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log, AppServices, DTOptionsBuilder, DTColumnDefBuilder,ngProgress) {

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
            $('td', nRow).unbind('click');
            $('td', nRow).bind('click', function () {
                $scope.$apply(function () {
                    $scope.onRowSelect(aData);
                });
            });
            return nRow;
        }

        $scope.onRowSelect = function (item) {

        };

        $scope.data = [];

        /*
        $scope.$watch('cities',function(){
            $scope.data = $rootScope.cities;
        },true)
        */

        $scope.AppServices = AppServices;

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('simple_numbers')
            .withOption('rowCallback', rowCallback)
            .withOption('searching', false)
            .withOption('order', [[ 0, "asc" ]]);
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('className', 'mdl-data-table__cell--non-numeric'),
            DTColumnDefBuilder.newColumnDef(1).withOption('className', 'mdl-data-table__cell--non-numeric'),
            DTColumnDefBuilder.newColumnDef(2).withOption('className', 'mdl-data-table__cell--non-numeric'),
        ];

        $scope.refreshCities = function(){
            $rootScope.ngProgress.start();
            AppServices.api.cities.find().then(function(result){

                //$log.debug('AppServices.api.cities.find(): ' + JSON.stringify(result,null,2));

                if (result) {
                    $scope.$apply(function () {
                        $scope.data = result.docs;
                    });

                }
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            });
        };

        $scope.updateCities = function(){
            $rootScope.ngProgress.start();
            AppServices.api.cities.updateCities().then(function(result){

                $scope.refreshCities();

                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            },function(){})
        };


        $scope.clearCities = function(){
            $rootScope.ngProgress.start();
            AppServices.api.cities.remove().then(function(result){

                $scope.data = [];
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            },function(){})
        };

        function Init() {

            $scope.refreshCities();

        }

        Init();


    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.cities', {
                url: '/cities',
                views: {
                    'container@': {
                        template: require('./cities.html'),
                        controller: 'CitiesCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Cities',
                    parent:'app.dashboard'
                },
                resolve:{
                }
            });
    };

    module.exports = MODULE_NAME;

})();