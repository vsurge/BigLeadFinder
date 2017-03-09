(function(){
    'use strict';

    var MODULE_NAME = 'app.views.searches';

    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('material-design-lite/material.css');
    require('dataTables.material');
    require('dataTables.material.css');

    require('./searches.scss');

    require('./search/search.js');

    angular.module(MODULE_NAME,[
        'ui.router',
        'datatables'
    ]).config(Config).controller('SearchesCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log, AppServices, DTOptionsBuilder, DTColumnDefBuilder) {

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
        ];

        $scope.refreshSearches = function(){
            $rootScope.ngProgress.start();
            AppServices.api.searches.find().then(function(result){

                //$log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs) {
                    //$log.debug('found searches: ' + result.docs.length);
                    $scope.data = result.docs;
                }

                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            });
        };

        function Init() {

            $scope.refreshSearches();
        }

        Init();


    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.searches', {
                url: '/searches',
                views: {
                    'container@': {
                        template: require('./searches.html'),
                        controller: 'SearchesCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Searches',
                    parent:'app.dashboard'
                },
                resolve:{
                }
            });
    };

    module.exports = MODULE_NAME;

})();