(function(){
    'use strict';

    var MODULE_NAME = 'app.views.search';
    require('angular-ui-router');
    require('./search.scss');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('SearchCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,$log,$state,AppServices,search,responses) {

        $scope.search = search;
        $scope.responses = responses.docs;

        //$log.debug('$scope.responses: ' + JSON.stringify($scope.responses,null,2));

        // TODO: Add more categories or make them dynamic for things other than computers and software
        $scope.categories = ['sof', 'cpg'];

        $scope.updateSearch = function (search) {
            AppServices.api.searches.create(search).then(function(){
                $rootScope.showToast(search.name + ' Search Updated.')
            })
        };

        $scope.deleteSearch  = function (search) {
            AppServices.api.searches.remove({_id:search._id}).then(function(){
                $rootScope.showToast(search.name + ' Search Removed.');
                $state.go('app.searchlist');
            })
        };
        var Init = function () {

        };

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.search', {
                url: '/search:search_id',
                views: {
                    'container@': {
                        template: require('./search.html'),
                        controller: 'SearchCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Search',
                    parent:'app.searchlist'
                },
                resolve:{
                    search: function ($rootScope,AppServices,$stateParams) {

                        if ($stateParams.search_id) {
                            return AppServices.api.searches.findByID($stateParams.search_id);
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