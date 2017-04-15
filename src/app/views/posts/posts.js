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
    function Controller($rootScope, $scope, $log, $q, AppServices, DTOptionsBuilder, DTColumnDefBuilder,$stateParams,search_data) {

        $scope.posts = {};
        $scope.search = search_data.docs[0];

        $scope.refreshPosts = function(){
            $rootScope.ngProgress.start();
            var chain = $q.when();

            for(var key in AppServices.api.posts.states) {

                (function(state) {
                    //var state = JSON.parse(JSON.stringify(input));
                    //$log.debug(state);

                    chain.then(function(){

                        return $scope.refreshPostState(state);
                    });

                })(key)

            }

            chain.then(function(){
                //$log.debug('complete');
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();
            });
        };

        $scope.refreshPostState = function (state) {
            AppServices.api.posts.find({state:state,search_id:$stateParams.search_id}).then(function(result){

                //$log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs) {
                    //$log.debug('found posts: ' + result.docs.length);
                    $scope.posts[state] = result.docs;

                    //$log.debug('$scope.posts[' + state + ']: ' + JSON.stringify($scope.posts[state],null,2) );
                }

            }).catch(function(error){
                $log.debug('$scope.posts[' + state + ']: ERROR: ' + error );
            });
        };

        $scope.updatePosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.updatePosts($scope.search).then(function(result){

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

        $scope.clearRejectedPosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.remove({state:AppServices.api.posts.states.rejected}).then(function(result){

                $scope.posts[AppServices.api.posts.states.rejected] = [];
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            },function(){})
        };


        function Init() {

            //$scope.refreshPostState(AppServices.api.posts.states.created);

        }

        Init();


    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.posts', {
                url: '/posts/:search_id',
                views: {
                    'container@': {
                        template: require('./posts.html'),
                        controller: 'PostsCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Posts',
                    parent:'app.searches'
                },
                resolve:{
                    search_data: function (AppServices,$stateParams) {
                        return AppServices.api.searches.find({_id:$stateParams.search_id});
                    }
                }
            });
    };

    module.exports = MODULE_NAME;

})();