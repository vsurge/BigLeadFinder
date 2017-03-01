(function () {
    'use strict';
    require('angular-ui-router');

    require('./sign-in.scss');

    var MODULE_NAME = 'app.views.sign-in';

    angular.module(MODULE_NAME, [
        'ui.router',
    ]).config(Config).controller('SignInCtrl', Controller);

    /* @ngInject */
    function Controller($rootScope,$scope, $state, $log,$location) {

        $scope.user = {};

        $scope.signIn = function () {

            if ($scope.user.username && $scope.user.password == 'aaa') {
                $rootScope.authenticated = true;
                $location.path('/');
            } else {
                $rootScope.authenticated = false;
                alert('unauthorized!');
            }
        }

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('public', {
                url: '',
                abstract: true
            })
            .state('public.sign-in', {
                url: '/sign-in',
                views: {
                    'container@': {
                        template: require('./sign-in.html'),
                        controller: 'SignInCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    };

    module.exports = MODULE_NAME;

})();