(function () {
    'use strict';

    var MODULE_NAME = 'app.posts.directive';

    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('datatables-select/css/select.dataTables.scss');
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

        $scope.dtInstance = false;
        $scope.AppServices = AppServices;

        $scope.dtIntanceCallback = function (instance) {

            //$log.debug('$scope.dtIntanceCallback');

            if (!$scope.dtInstance) {
                $log.debug($scope.state + ' $scope.dtInstance');
                $scope.dtInstance = instance;
                $scope.setSelectedPostWithTimeout();
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


                    defer.resolve(result.docs);

                    //$scope.setSelectedPostWithTimeout();
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

            $scope.setSelectedPost(item._id,false);
        };

        $scope.setSelectedPostWithTimeout = function(post_id,skip_open) {

            $timeout(function(){
                $scope.setSelectedPost(post_id,skip_open);
            },500);

        };

        $scope.setSelectedPost = function(post_id,skip_open) {

            //$log.debug('setSelectedPost _id: ' + post_id);

            if (!post_id) {
                var row = $scope.dtInstance.DataTable.row(':eq(0)', { page: 'current' });
                row.select();
                post_id = row.id();
            }

            if (!skip_open && post_id) {
                $scope.openPost(post_id)
            }

        };

        $scope.selectedPost = function() {

            if ($scope.dtInstance) {
                var row = $scope.dtInstance.DataTable.row({ selected: true });
                var data = row.data();
                if (data) {
                    //console.dir(row.data());

                    //$log.debug('selectedPost row.data(): ' + JSON.stringify(data,null,2));
                    //$log.debug('selectedPost: ' + row.data());
                    return data;
                } else {
                    //$log.debug('selectedPost: ' + null);
                    return null;
                }
            } else {
                return null;
            }
        };

        $scope.updateRow = function (item) {

            if ($scope.dtInstance) {

                //$log.debug('item: ' + JSON.stringify(item,null,2));
                var row = $scope.dtInstance.DataTable.row('#' + item._id);
                var existing = row.data();
                var rowData = _.extend(existing,item);
                //$log.debug('rowData: ' + JSON.stringify(rowData,null,2));
                //$scope.dtInstance.DataTable.row(item._id).data(rowData).draw();
                row.data(rowData).draw();

            }
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
            DTColumnBuilder.newColumn('_id'),
            DTColumnBuilder.newColumn('email'),
            DTColumnBuilder.newColumn('publish_date'),
            DTColumnBuilder.newColumn('link'),
            DTColumnBuilder.newColumn('title','TITLE')
        ];

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(1).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(2).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(3).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(4).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'),
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

            return AppServices.api.posts.findByID(_id).then(function(item){

                //$log.debug('AppServices.api.posts.findByID: ' + JSON.stringify(item,null,2));
                return AppServices.api.posts.updateState(item._id,state).then(function(result){
                    //$log.debug('$scope.rejectPost: ' + JSON.stringify(result,null,2));

                    //$scope.refreshPosts()
                    $scope.refreshTable(true);

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

        $scope.respondPost = function(_id){

            if (_id) {
                $scope.updateState(_id,AppServices.api.posts.states.responded);
                AppServices.api.responses.respondPost(_id,$scope.search.default_response).then(function(post){
                    $scope.refreshTable(true);

                });
            }
        };

        $scope.openPost = function (_id,newWindow) {

            AppServices.api.posts.findByID(_id).then(function(item){

                AppServices.api.posts.openPost(item.link,newWindow,function(result){

                    AppServices.api.posts.findByID(_id).then(function(updated){
                        //$log.debug('$scope.openPost updated email result: ' + JSON.stringify(updated,null,2));

                        $scope.updateRow(updated);
                    });

                    //$scope.refreshTable(false,true);
                    /*
                    var updatedPost =  AppServices.api.posts.find({_id:item._id}).then(function(result){
                        //$log.debug('$scope.openPost email result: ' + JSON.stringify(result,null,2));



                        $scope.$apply(function(){
                            $scope.refreshTable();
                        });


                    })
                    */
                });

            });


        };

        $scope.refreshTable = function(clear_selected,skip_open){

            // TODO: Potentially retain the selected post ID here to reset it after refresh

            var selected_id = $scope.selectedPost()._id;

            //$log.debug('$scope.refreshTable.selected_id: ' + selected_id);

            $scope.dtInstance.reloadData(function(){

                if (clear_selected) {
                    $scope.setSelectedPost();
                }
                else if (selected_id) {
                    $scope.setSelectedPost(selected_id,skip_open);
                }

            },false);
        };

        $scope.isReloading = false;

        function Init() {


            $scope.$on('event:dataTableLoaded',function(id,dt){

                //$log.debug('event:dataTableLoaded');
                //$scope.dtAPI = $(dt.id).dataTable().api();
            });


            if ($scope.state == AppServices.api.posts.states.created) {
                $rootScope.$on($scope.search._id + '-found',function(event,info){

                    if (!$scope.isReloading) {
                        $scope.isReloading = true;
                        $timeout(function(){
                            $scope.refreshTable();
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