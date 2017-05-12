(function(){
    'use strict';

    var MODULE_NAME = 'app.views.post-edit';
    require('angular-ui-router');


    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('PostEditCtrl',Controller);

    /* @ngInject */
    /* @ngInject */
    function Controller($rootScope,$scope,$log,$state,AppServices,post,responses,search){

        $scope.post = post;
        $scope.responses = responses.docs;
        $scope.search = search;
        $scope.post.response_id = $scope.search.default_response

        $scope.updatePost = function (post) {

            AppServices.api.posts.create(post).then(function(){
                $state.go('app.posts');
            });

        };

        $scope.cancel = function(){
            $state.go('app.posts');
        }

        $scope.respondPost = function(_id){

            AppServices.api.responses.respondPost(_id,$scope.post.response_id).then(function(post){
                $scope.dtInstance.reloadData();
            })
        };



    }

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.post-edit', {
                url: '/post-edit:_id',
                views: {
                    'container@': {
                        template: require('./post-edit.html'),
                        controller: 'PostEditCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Post',
                    parent:'app.posts'
                },
                resolve:{
                    post: function ($rootScope,AppServices,$stateParams) {

                        if ($stateParams._id) {
                            return AppServices.api.posts.findByID($stateParams._id);
                        } else {
                            return {};
                        }

                    },
                    search: function ($rootScope,$q,AppServices,$stateParams) {

                        if ($stateParams._id) {

                            var deferred = $q.defer();
                            AppServices.api.posts.findByID($stateParams._id).then(function(post){
                                AppServices.api.searches.findByID(post.search_id).then(function(search){

                                    deferred.resolve(search);
                                });
                            });
                            return deferred.promise;
                        } else {
                            return {};
                        }

                    },
                    responses: function ($rootScope,AppServices) {

                        return AppServices.api.responses.find({});
                    }
                }
            });
    };

    module.exports = MODULE_NAME;

})();