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
    function Controller($rootScope, $scope, $log, $q, $timeout, $interpolate, $compile, AppServices, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, _) {

        //$scope.posts = [];

        /*
         $scope.$watch('cities',function(){
         $scope.data = $rootScope.cities;
         },true)
         */

        $scope.refreshPosts = function () {
            $rootScope.ngProgress.start();

            var defer = $q.defer();

            //$log.debug('$scope.state: ' + $scope.state);
            //$log.debug('$scope.search: ' + JSON.stringify($scope.search,null,1));

            AppServices.api.posts.find({state:$scope.state,search_id:$scope.search._id},{fields:['_id','publish_date','link','email','title','description','search_id','state']}).then(function(result){

                //$log.debug('AppServices.api.posts.find(): ' + JSON.stringify(result,null,2));

                if (result && result.docs) {
                    //$log.debug('found posts: ' + result.docs.length);
                    //$scope.posts = result.docs;

                    defer.resolve(result.docs);

                    //$log.debug('$scope.posts[' + state + ']: ' + JSON.stringify($scope.posts[state],null,2) );
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

        $scope.AppServices = AppServices;

        $scope.dtOptions = DTOptionsBuilder
            .fromFnPromise($scope.refreshPosts)
            .withPaginationType('simple_numbers')
            //.withOption('rowCallback', rowCallback)
            .withOption('searching', true)
            .withOption('order', [[ 1, "desc" ]])
            .withOption('createdRow', createdRow);

        var buttonColumnFn = $interpolate(require('./button_column.html'));

        $scope.dtColumns = [
            DTColumnBuilder.newColumn('_id','ID'),
            DTColumnBuilder.newColumn('publish_date','DATE'),
            DTColumnBuilder.newColumn('link','LINK'),
            DTColumnBuilder.newColumn('title','TITLE'),
            DTColumnBuilder.newColumn('description','DESCRIPTION'),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable()
                .renderWith(actionsHtml)
        ];

        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(1).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(2).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(3).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'),
            DTColumnDefBuilder.newColumnDef(4).withOption('className', 'mdl-data-table__cell--non-numeric').withOption('width', '250px'),
            DTColumnDefBuilder.newColumnDef(5).withOption('width', '250px')
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        function actionsHtml(data, type, item, meta) {

            var has_email = item.email != undefined;
            var created_state = item.state == 'created';
            var rejected_state = item.state == 'rejected';
            var archived_state = item.state == 'archived';

            var interpol = {
                _id:item._id,
                has_email:has_email,
                created_state:created_state,
                rejected_state:rejected_state,
                archived_state:archived_state
            };

            // TODO: Replace offending characters in the item, ' & "
            var column_markup = buttonColumnFn(interpol);

            //$log.debug(column_markup);

            return column_markup;
        }

        $scope.dtInstance = {};

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

        $scope.respondPost = function(_id){

            //$log.debug('$scope.respondPost: ' + JSON.stringify(item,null,2));

            AppServices.api.posts.findByID(_id).then(function(item){

                AppServices.api.searches.find({_id:item.search_id}).then(function(search){

                    // TODO: Change this to an instance of the default response or let it get set per post...
                    AppServices.api.responses.find({_id:search.default_response}).then(function(result){

                        //$log.debug('result: ' + JSON.stringify(result,null,2));
                        var response = result.docs[0];
                        AppServices.api.responses.sendResponse(item,response,function(err,result,post){

                            if (err) {
                                $log.error(err)
                            }

                            if (result) {
                                //$log.debug('$scope.respondPost: ' + JSON.stringify(result,null,2));
                            }

                            if (post) {
                                $log.debug('post: ' + JSON.stringify(post,null,2));
                                $scope.dtInstance.reloadData();
                            }

                        })
                    });
                });

            });
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


        function Init() {

            if ($scope.state == AppServices.api.posts.states.created) {
                $rootScope.$on($scope.search._id + '-found',function(event,info){

                    $scope.dtInstance.reloadData();
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
            scope: {
                posts: '=',
                search: '=',
                state: '@'
            },
            link: Link
        };
    }

    module.exports = MODULE_NAME;

})();