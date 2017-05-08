(function () {
    'use strict';

    var MODULE_NAME = 'app.posts.directive';

    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('material-design-lite/material.css');
    require('dataTables.material');
    require('dataTables.material.css');

    require('./posts.directive.scss');

    angular.module(MODULE_NAME, []).directive('posts', Directive);

    /* @ngInject */
    function Link(scope, element, attrs, controller) {

    }

    /* @ngInject */
    function Controller($rootScope, $scope, $log, $timeout, AppServices, DTOptionsBuilder, DTColumnDefBuilder, _) {

        $scope.posts = [];

        var vm = this;

        /*
         $scope.$watch('cities',function(){
         $scope.data = $rootScope.cities;
         },true)
         */

        $scope.dtInstance = {};

        $scope.AppServices = AppServices;

        $scope.refreshPosts = function (limit,offset,callback) {

            $log.debug('$scope.refreshPosts:limit,offset ' + limit + ' ' + offset + ' ');
            //$log.debug('$scope.search: ' + JSON.stringify($scope.search,null,2));

            $rootScope.ngProgress.start();

            AppServices.api.posts.find({state:$scope.state,search_id:$scope.search._id},{fields:['_id','link','title','state','email', 'description', 'search_id'],limit:limit,offset:offset}).then(function(result){



                if (result != undefined && result.docs != undefined && result.docs.length > 0) {
                    //$log.debug('found posts: ' + result.docs.length);
                    $log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                    /*
                    $scope.$apply(function(){

                    });
                    */

                    $scope.posts = result.docs;
                    /*
                    if (callback) {
                        callback({data:$scope.posts})
                    }
                    */


                    //$log.debug('$scope.posts[' + state + ']: ' + JSON.stringify($scope.posts[state],null,2) );
                }

                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            }).catch(function(error){
                $log.debug('$scope.posts[' + $scope.state + ']: ERROR: ' + error );
                /*
                if (callback) {
                    callback($scope.posts)
                }
                */
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();
            });
        };

        $scope.refreshPostsCallback = function (data, callback, settings) {
            $log.debug('data: ' + JSON.stringify(data, null, 2));

            $scope.refreshPosts(25,0,callback);

        };

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('simple_numbers')
            //.withOption('rowCallback', rowCallback)
            .withOption('searching', true)
            .withOption('order', [[1, "desc"]])
            //.withOption('ajax', $scope.refreshPostsCallback)
            .withOption('processing', true)
            .withOption('serverSide', false);
        $scope.dtInstance = {};


        $('#posts_datatable').on('draw.dt', function() {
            var table = $('#posts_datatable').DataTable();
            var info = table.page.info();
            $log.debug('Showing page: '+info.page+' of '+info.pages );
        });

        /*
        $scope.dtOptions = {
            pagingType:'simple_numbers',
            searching:true,
            order:[[1, "desc"]],
            ajax:function (data, callback, settings) {
                console.log('data: ' + JSON.stringify(data, null, 2));
                console.log('settings: ' + JSON.stringify(settings, null, 2));
                callback({})
            },
            serverSide:true
        };

        $scope.dtInstance = {};
*/

        /*
         $('#posts-table').dataTable( {
         "ajax": function (data, callback, settings) {
         $log.debug('data: ' + JSON.stringify(data,null,2));
         $log.debug('settings: ' + JSON.stringify(settings,null,2));
         callback($scope.posts)
         }
         } );

         */

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(1).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(2).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'), DTColumnDefBuilder.newColumnDef(3).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'),
            DTColumnDefBuilder.newColumnDef(4).withOption('className', 'mdl-data-table__cell--numeric').withOption('width', '320px')

        ];



        $scope.rejectPost = function (item) {

            $scope.updateState(item, AppServices.api.posts.states.rejected);

        };

        $scope.archivePost = function (item) {

            $scope.updateState(item, AppServices.api.posts.states.archived);

        };

        $scope.setCreatedPost = function (item) {

            $scope.updateState(item, AppServices.api.posts.states.created);

        };

        $scope.updateState = function (item, state) {

            AppServices.api.posts.updateState(item._id, state).then(function (result) {
                //$log.debug('$scope.rejectPost: ' + JSON.stringify(result,null,2));

                $scope.removePost(item);

            }).catch(function (error) {
                $log.error('$scope.updateState: ' + state + ' - ' + error);
            });

        };

        $scope.respondPost = function (item) {

            //$log.debug('$scope.respondPost: ' + JSON.stringify(item,null,2));

            $scope.removePost(item);

            AppServices.api.searches.find({_id: item.search_id}).then(function (search) {

                // TODO: Change this to an instance of the default response or let it get set per post...
                AppServices.api.responses.find({_id: search.default_response}).then(function (result) {

                    //$log.debug('result: ' + JSON.stringify(result,null,2));
                    var response = result.docs[0];
                    AppServices.api.responses.sendResponse(item, response, function (err, result, post) {

                        if (err) {
                            $log.error(err)
                        }

                        if (result) {
                            //$log.debug('$scope.respondPost: ' + JSON.stringify(result,null,2));
                        }

                        if (post) {
                            $log.debug('post: ' + JSON.stringify(post, null, 2));


                        }

                    })
                });
            });


        };

        $scope.openPost = function (item, newWindow) {

            //$log.debug('$scope.openPost: ' + JSON.stringify(item,null,2));
            AppServices.api.posts.openPost(item.link, newWindow, function (result) {
                //$log.debug('$scope.openPost email result: ' + JSON.stringify(result,null,2));

                var updatedPost = AppServices.api.posts.find({_id: item._id}).then(function (result) {
                    //$log.debug('$scope.openPost email result: ' + JSON.stringify(result,null,2));

                    $scope.$apply(function () {
                        $scope.updatePost(result.docs[0]);
                    });

                })
            });
        };

        $scope.removePost = function (item) {

            $scope.posts = _.reject($scope.posts, function (post) {
                return post._id == item._id;
            });
            /*
             $timeout(function(){
             $scope.$apply(function(){
             $scope.posts = _.reject($scope.posts,function(post){
             return post._id == item._id;
             });

             $log.debug('$scope.rejectPost/$scope.posts: ' + JSON.stringify($scope.posts,null,2));
             });
             });
             */
        };

        $scope.updatePost = function (item) {

            $scope.posts = _.map($scope.posts, function (post) {

                if (post._id == item._id) {

                    post = item;
                }
                return post;
            });
            /*
             $timeout(function(){
             $scope.$apply(function(){
             $scope.posts = _.reject($scope.posts,function(post){
             return post._id == item._id;
             });

             $log.debug('$scope.rejectPost/$scope.posts: ' + JSON.stringify($scope.posts,null,2));
             });
             });
             */
        };

        function Init() {

            $timeout(function(){
                $scope.refreshPosts(100,0);
            });

        }

        Init();


    }

    function Directive() {
        return {
            restrict: 'E',
            template: require('./posts.directive.html'),
            controller: Controller,
            scope: {
                state: '@',
                search: '='
            },
            link: Link
        };
    }

    module.exports = MODULE_NAME;

})();