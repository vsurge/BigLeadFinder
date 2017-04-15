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

    angular.module(MODULE_NAME, [
    ]).directive('posts', Directive);

    /* @ngInject */
    function Link(scope, element, attrs, controller) {

    }

    /* @ngInject */
    function Controller($rootScope, $scope, $log, $timeout, AppServices, DTOptionsBuilder, DTColumnDefBuilder, _) {

        $scope.posts = [];

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
            DTColumnDefBuilder.newColumnDef(3).withOption('className', 'mdl-data-table__cell--numeric').withOption('width', '280px')

        ];

        $scope.rejectPost = function(item){

            $scope.updateState(item,AppServices.api.posts.states.rejected);

        };

        $scope.archivePost = function(item){

            $scope.updateState(item,AppServices.api.posts.states.archived);

        };

        $scope.setCreatedPost = function(item){

            $scope.updateState(item,AppServices.api.posts.states.created);

        };

        $scope.updateState = function(item,state){

            AppServices.api.posts.updateState(item._id,state).then(function(result){
                //$log.debug('$scope.rejectPost: ' + JSON.stringify(result,null,2));

                $scope.removePost(item);

            }).catch(function(error){
                $log.error('$scope.updateState: ' +state + ' - ' + error);
            });

        };

        $scope.respondPost = function(item){

            $log.debug('$scope.respondPost: ' + JSON.stringify(item,null,2));

        };

        $scope.openPost = function (item) {

            //$log.debug('$scope.openPost: ' + JSON.stringify(item,null,2));
            AppServices.api.posts.openPost(item.link);
        };

        $scope.removePost = function (item) {

            $scope.posts = _.reject($scope.posts,function(post){
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

        function Init() {

           // $scope.refreshPosts();
        }

        Init();


    }

    function Directive() {
        return {
            restrict: 'E',
            template: require('./posts.directive.html'),
            controller: Controller,
            scope: {
                posts: '='
            },
            link: Link
        };
    }

    module.exports = MODULE_NAME;

})();