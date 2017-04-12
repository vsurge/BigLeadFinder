(function(){
    'use strict';

    var MODULE_NAME = 'app.views.posts';

    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('material-design-lite/material.css');
    require('dataTables.material');
    require('dataTables.material.css');

    require('./posts.scss');

    require('directives/post-detail/post-detail.directive');

    angular.module(MODULE_NAME,[
        'ui.router',
        'datatables',
        'app.post-detail.directive'
    ]).config(Config).controller('PostsCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log, AppServices, DTOptionsBuilder, DTColumnDefBuilder) {
        $scope.post = {}
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

            //AppServices.api.posts.openPost(item[0]);

            /*
            AppServices.api.posts.getPostDetails(item[1]).then(function(post){
                $scope.post = post;
                $log.debug('$scope.post: ' + JSON.stringify($scope.post,null,2))
            }) */

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
            //.withOption('rowCallback', rowCallback)
            .withOption('searching', true)
            .withOption('order', [[ 1, "desc" ]]);
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(1).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(2).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '500px'),
            DTColumnDefBuilder.newColumnDef(3).withOption('className', 'mdl-data-table__cell--numeric').withOption('width', '200px')

        ];

        $scope.rejectPost = function(item){

            $log.debug('$scope.rejectPost: ' + JSON.stringify(item,null,2));

        };

        $scope.respondPost = function(item){

            $log.debug('$scope.respondPost: ' + JSON.stringify(item,null,2));

        };

        $scope.openPost = function (item) {

            //$log.debug('$scope.openPost: ' + JSON.stringify(item,null,2));
            AppServices.api.posts.openPost(item.link);
        };

        $scope.refreshPosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.find().then(function(result){

                //$log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs) {
                    //$log.debug('found posts: ' + result.docs.length);
                    $scope.data = result.docs;
                }

                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            });
        };

        $scope.updatePosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.updatePosts().then(function(result){

                $log.debug('update posts: ' + result.length);

                $scope.refreshPosts();
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            },function(){})
        };

        $scope.clearPosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.remove().then(function(result){

                $scope.data = [];
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            },function(){})
        };

        function Init() {

            $scope.refreshPosts();
        }

        Init();


    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.posts', {
                url: '/posts',
                views: {
                    'container@': {
                        template: require('./posts.html'),
                        controller: 'PostsCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Posts',
                    parent:'app.dashboard'
                },
                resolve:{
                }
            });
    };

    module.exports = MODULE_NAME;

})();