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

    require('directives/posts/posts.directive');

    angular.module(MODULE_NAME,[
        'ui.router',
        'datatables',
        'app.posts.directive'
    ]).config(Config).controller('PostsCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log, AppServices, DTOptionsBuilder, DTColumnDefBuilder) {

        $scope.refreshPosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.find().then(function(result){

                //$log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs) {
                    //$log.debug('found posts: ' + result.docs.length);
                    $scope.posts = result.docs;
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