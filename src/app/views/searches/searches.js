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
        'datatables',
        'app.views.search'
    ]).config(Config).controller('SearchesCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log,$state, AppServices, DTOptionsBuilder, DTColumnDefBuilder) {

        $scope.searches = [];

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('simple_numbers')
            .withOption('searching', false)
            .withOption('order', [[ 0, "asc" ]]);
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('className', 'mdl-data-table__cell--non-numeric'),
            DTColumnDefBuilder.newColumnDef(1).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '280px'),
        ];

        $scope.refreshSearches = function(){
            $rootScope.ngProgress.start();
            AppServices.api.searches.find({}).then(function(result){

                //$log.debug('AppServices.api.searches.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs) {
                    //$log.debug('found searches: ' + result.docs.length);
                    $scope.searches = result.docs;
                }

                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            });
        };

        $scope.gotoPosts = function (search) {
            $state.go('app.posts',{search_id:search._id})
        }

        $scope.editSearch = function (search) {
            $state.go('app.search',{search_id:search._id})
        }

        function Init() {

            $scope.refreshSearches();
        }

        Init();


    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.searchlist', {
                url: '/slist',
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