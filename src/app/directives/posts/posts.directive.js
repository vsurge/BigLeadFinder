(function () {
    'use strict';

    var MODULE_NAME = 'app.posts.directive';

    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('datatables-select/css/select.dataTables.scss');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('material-design-lite/material.css');
    require('dataTables.material');
    require('dataTables.material.css');

    require('datatables-select');
    require('angular-datatables/dist/plugins/select/angular-datatables.select');

    require('./posts.directive.scss');

    var PostEdit = require('./post-edit/post-edit');

    angular.module(MODULE_NAME, [
        'app.views.post-edit',
        'datatables',
        'datatables.select'
    ]).directive('posts', Directive);

    /* @ngInject */
    function Link(scope, element, attrs, controller) {

    }

    /* @ngInject */
    function Controller($rootScope, $scope, $log, $q, $timeout, $window, $state, $interpolate, $compile, AppServices, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, _, $) {


        $scope.posts = [];
        $scope.selected_post = false;
        $scope.dtInstance = false;
        $scope.AppServices = AppServices;

        $scope.dtIntanceCallback = function (instance) {

            //$log.debug('$scope.dtIntanceCallback');

            if (!$scope.dtInstance) {
                $log.debug($scope.state + ' $scope.dtInstance');
                $scope.dtInstance = instance;
            }

            if (!$scope.selected_post) {
                var row = $scope.dtInstance.DataTable.row(':eq(0)', { page: 'current' }).select();
                $scope.setSelectedPost(row.id());
            }
        };

        $scope.refreshPosts = function () {
            $rootScope.ngProgress.start();

            var defer = $q.defer();

            //$log.debug('$scope.state: ' + $scope.state);
            //$log.debug('$scope.search: ' + JSON.stringify($scope.search,null,1));

            AppServices.api.posts.find({state:$scope.state,search_id:$scope.search._id},{fields:['_id','publish_date','link','email','title','description','search_id','state']}).then(function(result){

                //$log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs && result.docs.length > 0) {
                    //$log.debug('found posts: ' + result.docs.length);
                    //$scope.posts = result.docs;

                    $scope.posts = result.docs;

                    defer.resolve(result.docs);

                    //$log.debug('$scope.posts[' + state + ']: ' + JSON.stringify($scope.posts[state],null,2) );
                } else {
                    $scope.posts = [];
                    defer.resolve([]);
                }

                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();

            }).catch(function(error){
                $log.debug('$scope.posts[' + state + ']: ERROR: ' + error );
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();
            });

            return defer.promise;


        };

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

            $scope.setSelectedPost(item._id);
        };

        $scope.setSelectedPost = function(post_id){

            $log.debug('post_id: ' + post_id);
            $scope.selected_post = _.find($scope.posts,{_id:post_id});
            $scope.openPost(post_id,true);

            var row_id =  '#' + post_id.toString();

            //var row = $scope.dtInstance.row(row_id);
            //$log.debug('row: ' + JSON.stringify(row.data(),null,2));
            //row.select();

        };

        $scope.dtOptions = DTOptionsBuilder
            .fromFnPromise($scope.refreshPosts)
            .withPaginationType('simple_numbers')
            .withOption('rowCallback', rowCallback)
            .withOption('searching', true)
            .withOption('order', [[ 1, "desc" ]])
            .withOption('rowId', '_id')
            .withOption('select','single')
            .withOption('initComplete', function(settings, json) {
                //$log.debug('#posts-table init complete!');
            });
            /*
            .withSelect({
                style:    'single'
            });
            */
            //.withOption('select',{style:'single'});

        var buttonColumnFn = $interpolate(require('./button_column.html'));

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('_id','ID'),
            DTColumnBuilder.newColumn('publish_date','DATE'),
            DTColumnBuilder.newColumn('link','LINK'),
            DTColumnBuilder.newColumn('title','TITLE')
        ];

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(1).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(2).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(3).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'),
        ];


        /*
        $scope.dtColumnDefs = [
            DTColumnBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnBuilder.newColumnDef(1).withOption('visible', false),
            DTColumnBuilder.newColumnDef(2).withOption('visible', false),
            DTColumnBuilder.newColumnDef(3).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'),
            DTColumnDefBuilder.newColumnDef(4).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px')
        ]; */

        $scope.rejectPost = function(_id){

            $scope.updateState(_id,AppServices.api.posts.states.rejected);

        };

        $scope.archivePost = function(_id){

            $scope.updateState(_id,AppServices.api.posts.states.archived);

        };

        $scope.setCreatedPost = function(_id){

            $scope.updateState(_id,AppServices.api.posts.states.created);

        };

        $scope.updateState = function(_id,state){

            //$log.debug('$scope.updateState: ' + _id + ' ' + state);

            AppServices.api.posts.findByID(_id).then(function(item){

                //$log.debug('AppServices.api.posts.findByID: ' + JSON.stringify(item,null,2));
                AppServices.api.posts.updateState(item._id,state).then(function(result){
                    //$log.debug('$scope.rejectPost: ' + JSON.stringify(result,null,2));

                    //$scope.refreshPosts()
                    $scope.dtInstance.reloadData();

                }).catch(function(error){
                    //$log.error('$scope.updateState: ' +state + ' - ' + error);
                });

            });
        };

        $scope.clearPosts = function(){
            $rootScope.ngProgress.start();
            AppServices.api.posts.remove({state:$scope.state}).then(function(result){

                $scope.data = [];
                $rootScope.ngProgress.complete();
                $rootScope.ngProgress.reset();


                $state.go('app.searchlist');

            },function(){})
        };

        $scope.respondPost = function($event,_id){


            $event.currentTarget.disabled = true;
            AppServices.api.responses.respondPost(_id,$scope.search.default_response).then(function(post){
                $scope.dtInstance.reloadData();

            })
        };

        $scope.openPost = function (_id,newWindow) {

            AppServices.api.posts.findByID(_id).then(function(item){

                AppServices.api.posts.openPost(item.link,newWindow,function(result){
                    //$log.debug('$scope.openPost email result: ' + JSON.stringify(result,null,2));

                    var updatedPost =  AppServices.api.posts.find({_id:item._id}).then(function(result){
                        //$log.debug('$scope.openPost email result: ' + JSON.stringify(result,null,2));

                        $scope.$apply(function(){
                            $scope.dtInstance.reloadData();
                        });

                    })
                });

            });


        };

        $scope.reloadTable = function(){
            //$scope.refreshPosts().then()
            $scope.dtInstance.reloadData();
        }

        $scope.isReloading = false;

        function Init() {


            $scope.$on('event:dataTableLoaded',function(id,dt){

                $log.debug('event:dataTableLoaded');
                //$scope.dtAPI = $(dt.id).dataTable().api();
            });


            if ($scope.state == AppServices.api.posts.states.created) {
                $rootScope.$on($scope.search._id + '-found',function(event,info){

                    if (!$scope.isReloading) {
                        $scope.isReloading = true;
                        $timeout(function(){
                            $scope.dtInstance.reloadData();
                            $scope.isReloading = false;
                        },10000);
                    }

                });

            }




        }

        Init();




    }

    function Directive() {
        return {
            restrict: 'E',
            template: require('./posts.directive.html'),
            controller: Controller,
            controllerAs: 'dirVm',
            scope: {
                posts: '=',
                search: '=',
                state: '@',
                limit: '@',
            },
            link: Link
        };
    }

    module.exports = MODULE_NAME;

})();